import requests

BASE = "http://127.0.0.1:8000/api/v1"

login_resp = requests.post(f"{BASE}/auth/login/", json={
    "email": "ceo@horilux.test",
    "password": "TestPass123!"
})
token = login_resp.json().get("access")
headers = {"Authorization": f"Bearer {token}"}

for r in ["M", "Q", "Y"]:
    resp = requests.get(f"{BASE}/reports/revenue-trend/", headers=headers, params={"range": r})
    print(f"\nRANGE={r} STATUS={resp.status_code}")
    body = resp.json()
    print("months:", body.get("months"))
    print("trend length:", len(body.get("trend", [])))
    print("first entry:", body.get("trend", [{}])[0] if body.get("trend") else None)
    print("last entry:", body.get("trend", [{}])[-1] if body.get("trend") else None)
