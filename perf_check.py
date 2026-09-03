#!/usr/bin/env python3
"""
Phase 9 - Performance checks: search latency + dashboard aggregation timing.
Run from project root (manage.py dir) with venv activated:
    python3 perf_check.py
"""
import os
import sys
import time
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Horilux.settings.dev")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.conf import settings
if "testserver" not in settings.ALLOWED_HOSTS:
    settings.ALLOWED_HOSTS.append("testserver")

from django.test import Client
from django.test.utils import CaptureQueriesContext
from django.db import connection

RESULTS = []


def timed_request(label, client, method, url, **kwargs):
    with CaptureQueriesContext(connection) as ctx:
        start = time.perf_counter()
        resp = getattr(client, method)(url, **kwargs)
        elapsed = (time.perf_counter() - start) * 1000
    RESULTS.append({
        "label": label,
        "status": resp.status_code,
        "ms": round(elapsed, 2),
        "queries": len(ctx.captured_queries),
    })
    return resp


def get_token(client, email, password="TestPass123!"):
    resp = client.post(
        "/api/v1/auth/login/",
        {"email": email, "password": password},
        content_type="application/json",
    )
    if resp.status_code != 200:
        print(f"  LOGIN FAILED for {email}: {resp.status_code} {resp.content}")
        return None
    return resp.json()["access"]


def auth_header(token):
    return {"HTTP_AUTHORIZATION": f"Bearer {token}"}


def main():
    client = Client()

    print("Logging in as CEO and Sales test users...")
    ceo_token = get_token(client, "ceo@horilux.test")
    sales_token = get_token(client, "sales@horilux.test")

    if not ceo_token or not sales_token:
        print("Aborting — check seed_test_users has been run.")
        return

    ceo_hdr = auth_header(ceo_token)
    sales_hdr = auth_header(sales_token)

    timed_request("Property list (no filter)", client, "get",
                  "/api/v1/properties/", **ceo_hdr)
    timed_request("Property search (?search=)", client, "get",
                  "/api/v1/properties/?search=lagos", **ceo_hdr)
    timed_request("Property filter (?status=)", client, "get",
                  "/api/v1/properties/?status=published", **ceo_hdr)
    timed_request("Lead list (Sales, assigned scope)", client, "get",
                  "/api/v1/leads/", **sales_hdr)
    timed_request("Lead search (?search=)", client, "get",
                  "/api/v1/leads/?search=john", **ceo_hdr)
    timed_request("Transaction list", client, "get",
                  "/api/v1/transactions/", **ceo_hdr)
    timed_request("Viewing list", client, "get",
                  "/api/v1/viewings/", **ceo_hdr)

    timed_request("CEO dashboard aggregation", client, "get",
                  "/api/v1/reports/ceo-dashboard/", **ceo_hdr)
    timed_request("Sales report (own scope)", client, "get",
                  "/api/v1/reports/sales/", **sales_hdr)

    timed_request("CEO dashboard (2nd call, warm)", client, "get",
                  "/api/v1/reports/ceo-dashboard/", **ceo_hdr)

    print("\n" + "=" * 70)
    print(f"{'Endpoint':<40}{'Status':<8}{'ms':<10}{'Queries':<8}")
    print("=" * 70)
    flagged = []
    for r in RESULTS:
        print(f"{r['label']:<40}{r['status']:<8}{r['ms']:<10}{r['queries']:<8}")
        if r["ms"] > 500:
            flagged.append((r["label"], "slow (>500ms)"))
        if r["queries"] > 20:
            flagged.append((r["label"], f"N+1 risk ({r['queries']} queries)"))

    print("=" * 70)
    if flagged:
        print("\nFlags to investigate:")
        for label, reason in flagged:
            print(f"  - {label}: {reason}")
    else:
        print("\nNo endpoints exceeded 500ms or 20 queries.")


if __name__ == "__main__":
    main()
