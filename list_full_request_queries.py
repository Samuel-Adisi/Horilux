#!/usr/bin/env python3
import os, sys, django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Horilux.settings.dev")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.conf import settings
settings.DEBUG = True
if "testserver" not in settings.ALLOWED_HOSTS:
    settings.ALLOWED_HOSTS.append("testserver")

from django.db import connection, reset_queries
from django.test import Client

client = Client()
resp = client.post("/api/v1/auth/login/", {"email": "ceo@horilux.test", "password": "TestPass123!"}, content_type="application/json")
token = resp.json()["access"]

reset_queries()
resp = client.get("/api/v1/reports/ceo-dashboard/", HTTP_AUTHORIZATION=f"Bearer {token}")

for i, q in enumerate(connection.queries, 1):
    print(f"{i}. [{q['time']}s] {q['sql'][:140]}")
print(f"\nTotal: {len(connection.queries)}")
