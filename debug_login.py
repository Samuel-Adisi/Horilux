#!/usr/bin/env python3
import os, sys, django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Horilux.settings.dev")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.test import Client

client = Client()
resp = client.post(
    "/api/v1/auth/login/",
    {"email": "ceo@horilux.test", "password": "TestPass123!"},
    content_type="application/json",
)

print("STATUS:", resp.status_code)
content = resp.content.decode(errors="replace")

# Try to pull the exception type/value Django puts near the top of the debug page
import re
m = re.search(r'<pre class="exception_value">(.*?)</pre>', content, re.S)
if m:
    print("EXCEPTION VALUE:", m.group(1))
m2 = re.search(r'<h1>(.*?)</h1>', content, re.S)
if m2:
    print("EXCEPTION TYPE LINE:", m2.group(1))

# fallback: dump first 3000 chars if regex didn't find it
if not m and not m2:
    print(content[:3000])
