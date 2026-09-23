import requests

BASE = "http://127.0.0.1:8000/api/v1"

# 1. Login as CEO
login_resp = requests.post(f"{BASE}/auth/login/", json={
    "email": "ceo@horilux.test",
    "password": "TestPass123!"
})
print("LOGIN STATUS:", login_resp.status_code)
login_data = login_resp.json()
print("LOGIN BODY:", login_data)

token = login_data.get("access") or login_data.get("token")
if not token:
    print("!! No token found in login response - check field name and stop here.")
    raise SystemExit(1)

headers = {"Authorization": f"Bearer {token}"}

# 2. Create a test task
create_resp = requests.post(f"{BASE}/tasks/", headers=headers, json={
    "title": "Test task from API script",
    "due_date": "2026-09-25",
})
print()
print("CREATE STATUS:", create_resp.status_code)
print("CREATE BODY:", create_resp.json())

# 3. List tasks
list_resp = requests.get(f"{BASE}/tasks/", headers=headers)
print()
print("LIST STATUS:", list_resp.status_code)
print("LIST BODY:", list_resp.json())
