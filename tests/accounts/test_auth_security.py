"""
Phase 9 functional tests: Security -- auth flows, token lifecycle, and
basic injection/XSS input-safety smoke tests.

Scope note: accounts/views.py has no user-management endpoints yet (still
a TODO stub) -- so this covers JWT auth (login/refresh/logout/blacklist/
rotation) and access-control-without-token, not registration/user CRUD.
"""
import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def sales_agent(user_factory):
    return user_factory(role_name="Sales", email="secure-sales@horilux.test")


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

def test_login_with_valid_credentials_returns_tokens(api_client, sales_agent):
    resp = api_client.post("/api/v1/auth/login/", {
        "email": "secure-sales@horilux.test", "password": "TestPass123!",
    }, format="json")
    assert resp.status_code == 200
    assert "access" in resp.data
    assert "refresh" in resp.data


def test_login_with_wrong_password_returns_401(api_client, sales_agent):
    resp = api_client.post("/api/v1/auth/login/", {
        "email": "secure-sales@horilux.test", "password": "WrongPassword!",
    }, format="json")
    assert resp.status_code == 401


def test_login_with_nonexistent_email_returns_401_not_500(api_client):
    resp = api_client.post("/api/v1/auth/login/", {
        "email": "nobody@horilux.test", "password": "whatever",
    }, format="json")
    assert resp.status_code == 401


def test_login_with_sql_injection_payload_in_email_is_handled_safely(api_client):
    """ORM parameterizes queries, so this should behave as a normal failed
    login (401), never a 500 or unexpected data leak."""
    payload = "admin@horilux.test' OR '1'='1"
    resp = api_client.post("/api/v1/auth/login/", {
        "email": payload, "password": "irrelevant",
    }, format="json")
    assert resp.status_code in (400, 401)


def test_login_with_missing_fields_returns_400_not_500(api_client):
    resp = api_client.post("/api/v1/auth/login/", {}, format="json")
    assert resp.status_code == 400


# ---------------------------------------------------------------------------
# Access control without / with invalid tokens
# ---------------------------------------------------------------------------

def test_protected_endpoint_without_token_returns_401(api_client):
    resp = api_client.get("/api/v1/properties/")
    assert resp.status_code == 401


def test_protected_endpoint_with_garbage_token_returns_401(api_client):
    api_client.credentials(HTTP_AUTHORIZATION="Bearer not-a-real-token")
    resp = api_client.get("/api/v1/properties/")
    assert resp.status_code == 401


def test_protected_endpoint_with_malformed_auth_header_returns_401(api_client):
    api_client.credentials(HTTP_AUTHORIZATION="NotBearer sometoken")
    resp = api_client.get("/api/v1/properties/")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Refresh / rotation / blacklist
# ---------------------------------------------------------------------------

def test_refresh_token_issues_new_access_token(api_client, sales_agent):
    login_resp = api_client.post("/api/v1/auth/login/", {
        "email": "secure-sales@horilux.test", "password": "TestPass123!",
    }, format="json")
    refresh_token = login_resp.data["refresh"]

    resp = api_client.post("/api/v1/auth/refresh/", {"refresh": refresh_token}, format="json")
    assert resp.status_code == 200
    assert "access" in resp.data


def test_refresh_with_invalid_token_returns_401(api_client):
    resp = api_client.post("/api/v1/auth/refresh/", {"refresh": "garbage-token"}, format="json")
    assert resp.status_code == 401


def test_rotated_refresh_token_cannot_be_reused(api_client, sales_agent):
    """ROTATE_REFRESH_TOKENS + BLACKLIST_AFTER_ROTATION means using a refresh
    token once should blacklist it -- a second use of the SAME old token
    must fail, even though it issues a new one each time."""
    login_resp = api_client.post("/api/v1/auth/login/", {
        "email": "secure-sales@horilux.test", "password": "TestPass123!",
    }, format="json")
    original_refresh = login_resp.data["refresh"]

    first_use = api_client.post("/api/v1/auth/refresh/", {"refresh": original_refresh}, format="json")
    assert first_use.status_code == 200

    second_use = api_client.post("/api/v1/auth/refresh/", {"refresh": original_refresh}, format="json")
    assert second_use.status_code == 401, (
        "Reusing a rotated refresh token should fail (BLACKLIST_AFTER_ROTATION=True) "
        "-- if this passes, token rotation/blacklisting is not actually enforced."
    )


def test_logout_blacklists_refresh_token(api_client, sales_agent):
    login_resp = api_client.post("/api/v1/auth/login/", {
        "email": "secure-sales@horilux.test", "password": "TestPass123!",
    }, format="json")
    refresh_token = login_resp.data["refresh"]

    logout_resp = api_client.post("/api/v1/auth/logout/", {"refresh": refresh_token}, format="json")
    assert logout_resp.status_code == 200

    reuse_resp = api_client.post("/api/v1/auth/refresh/", {"refresh": refresh_token}, format="json")
    assert reuse_resp.status_code == 401, "Refresh token should be unusable after logout/blacklist."


def test_access_token_works_for_protected_endpoint(api_client, sales_agent):
    login_resp = api_client.post("/api/v1/auth/login/", {
        "email": "secure-sales@horilux.test", "password": "TestPass123!",
    }, format="json")
    access_token = login_resp.data["access"]

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
    resp = api_client.get("/api/v1/properties/")
    assert resp.status_code == 200


# ---------------------------------------------------------------------------
# Input safety smoke tests (XSS / injection payloads stored safely)
# ---------------------------------------------------------------------------

def test_xss_payload_in_property_title_is_stored_literally_not_executed(api_client, sales_agent, user_factory):
    from properties.models import PropertyOwner
    listing_agent = user_factory(role_name="Listing", email="secure-listing@horilux.test")
    owner = PropertyOwner.objects.create(name="Test Owner", phone="0200000000")

    api_client.force_authenticate(listing_agent)
    payload = "<script>alert(\'xss\')</script>"
    resp = api_client.post("/api/v1/properties/", {
        "title": payload, "property_type": "residential", "listing_type": "sale",
        "price": "100000.00", "currency": "GHS", "location": "Accra",
        "owner": str(owner.id),
    }, format="json")
    assert resp.status_code == 201, resp.data
    # DRF/JSON responses are not HTML-rendered, so the payload should come
    # back as a literal string, not be stripped, altered, or trigger any error.
    assert resp.data["title"] == payload


def test_sql_injection_payload_in_search_field_does_not_500(api_client, sales_agent):
    """The ORM parameterizes queries, so a raw SQLi string used as a filter
    value should just return an empty/normal result, never a 500."""
    api_client.force_authenticate(sales_agent)
    resp = api_client.get("/api/v1/leads/", {"search": "'; DROP TABLE crm_lead; --"})
    assert resp.status_code == 200


def test_oversized_input_does_not_crash_endpoint(api_client, sales_agent, user_factory):
    from properties.models import PropertyOwner
    listing_agent = user_factory(role_name="Listing", email="secure-listing2@horilux.test")
    owner = PropertyOwner.objects.create(name="Test Owner", phone="0200000000")

    api_client.force_authenticate(listing_agent)
    huge_description = "A" * 100_000
    resp = api_client.post("/api/v1/properties/", {
        "title": "Big Description House", "property_type": "residential", "listing_type": "sale",
        "price": "100000.00", "currency": "GHS", "location": "Accra",
        "owner": str(owner.id), "description": huge_description,
    }, format="json")
    assert resp.status_code in (201, 400), resp.status_code
