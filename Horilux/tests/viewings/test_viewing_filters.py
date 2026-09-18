"""Viewing filters/ordering/cancel guard and follow-up filters/defaults."""
import datetime

import pytest

from viewings.models import Viewing, FollowUp

pytestmark = pytest.mark.django_db


@pytest.fixture
def viewings(sales, make_property, make_client):
    prop = make_property()
    client = make_client(sales)

    def mk(day, hour, status="scheduled"):
        return Viewing.objects.create(
            client=client, property=prop, agent=sales,
            date=datetime.date(2026, 9, day), time=datetime.time(hour, 0), status=status,
        )
    return [mk(1, 9), mk(1, 15, "confirmed"), mk(10, 10, "completed"), mk(20, 11, "cancelled")]


def test_viewing_ordering_and_filters(api, sales, viewings):
    api.force_authenticate(sales)
    rows = api.get("/api/v1/viewings/").data["results"]
    assert [(r["date"], r["time"]) for r in rows] == [
        ("2026-09-20", "11:00:00"), ("2026-09-10", "10:00:00"),
        ("2026-09-01", "15:00:00"), ("2026-09-01", "09:00:00"),
    ]
    assert api.get("/api/v1/viewings/?status=confirmed").data["count"] == 1
    assert api.get("/api/v1/viewings/?date_from=2026-09-05").data["count"] == 2
    assert api.get("/api/v1/viewings/?date_to=2026-09-01").data["count"] == 2
    assert api.get("/api/v1/viewings/?date_from=2026-09-05&date_to=2026-09-15").data["count"] == 1
    assert api.get("/api/v1/viewings/?date_from=nope").status_code == 400


def test_sales_can_book_viewing_on_any_property(api, sales, listing, make_property, make_client):
    prop = make_property(agent=listing)
    client = make_client(sales)
    api.force_authenticate(sales)
    assert api.get(f"/api/v1/properties/{prop.id}/").status_code == 200
    resp = api.post("/api/v1/viewings/", {
        "client": str(client.id), "property": str(prop.id), "date": "2026-10-01", "time": "10:00",
    }, format="json")
    assert resp.status_code == 201, resp.data


@pytest.mark.parametrize("status", ["completed", "cancelled", "no_show"])
def test_cancel_rejects_terminal_viewings(api, sales, viewings, status):
    v = viewings[0]
    v.status = status
    v.save()
    api.force_authenticate(sales)
    resp = api.post(f"/api/v1/viewings/{v.id}/cancel/", {"reason": "x"}, format="json")
    assert resp.status_code == 400
    assert isinstance(resp.data, list)


def test_cancel_scheduled_viewing(api, sales, viewings):
    api.force_authenticate(sales)
    resp = api.post(f"/api/v1/viewings/{viewings[0].id}/cancel/", {"no_show": True}, format="json")
    assert resp.status_code == 200
    assert resp.data["status"] == "no_show"


def test_followups_default_agent_filter_and_ordering(api, sales, make_client):
    client = make_client(sales)
    api.force_authenticate(sales)
    r1 = api.post("/api/v1/follow-ups/", {"client": str(client.id), "due_date": "2026-10-05"}, format="json")
    assert r1.status_code == 201, r1.data
    assert str(r1.data["responsible_agent"]) == str(sales.id)
    api.post("/api/v1/follow-ups/", {"client": str(client.id), "due_date": "2026-10-01"}, format="json")
    FollowUp.objects.filter(due_date="2026-10-05").update(completed=True)

    rows = api.get("/api/v1/follow-ups/").data["results"]
    assert [r["due_date"] for r in rows] == ["2026-10-01", "2026-10-05"]
    assert api.get("/api/v1/follow-ups/?completed=true").data["count"] == 1
    assert api.get("/api/v1/follow-ups/?completed=false").data["results"][0]["due_date"] == "2026-10-01"
