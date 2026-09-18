"""Shared fixtures for the tests under tests/ (the root conftest seeds RBAC)."""
import pytest
from rest_framework.test import APIClient


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def prop_owner(db):
    from properties.models import PropertyOwner
    return PropertyOwner.objects.create(name="Shared Owner", phone="0200000001")


@pytest.fixture
def make_property(db, prop_owner):
    from properties.models import Property, VerificationChecklist

    def make(agent=None, status="draft", price=100000, owner=None, title="Fixture House"):
        prop = Property.objects.create(
            title=title, property_type="residential", listing_type="sale",
            price=price, currency="GHS", location="Accra", owner=owner or prop_owner,
            agent=agent, status=status,
        )
        VerificationChecklist.objects.create(property=prop)
        return prop
    return make


@pytest.fixture
def make_client(db):
    from crm.models import Client

    def make(agent=None, name="Buyer"):
        return Client.objects.create(name=name, phone="0244000001", assigned_agent=agent)
    return make


@pytest.fixture
def ceo(user_factory):
    return user_factory(role_name="CEO")


@pytest.fixture
def ops(user_factory):
    return user_factory(role_name="Operations")


@pytest.fixture
def listing(user_factory):
    return user_factory(role_name="Listing")


@pytest.fixture
def sales(user_factory):
    return user_factory(role_name="Sales")


@pytest.fixture
def marketing(user_factory):
    return user_factory(role_name="Marketing")


@pytest.fixture
def finance(user_factory):
    return user_factory(role_name="Finance")
