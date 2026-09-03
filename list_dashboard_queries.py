#!/usr/bin/env python3
import os, sys, django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Horilux.settings.dev")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.db import connection, reset_queries
from django.conf import settings
settings.DEBUG = True  # required for connection.queries to populate

from reporting.services import ceo_dashboard

reset_queries()
ceo_dashboard()

for i, q in enumerate(connection.queries, 1):
    print(f"{i}. [{q['time']}s] {q['sql'][:160]}")

print(f"\nTotal queries: {len(connection.queries)}")
