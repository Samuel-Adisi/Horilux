import requests

BASE = "http://127.0.0.1:8000/api/v1"

login_resp = requests.post(f"{BASE}/auth/login/", json={
    "email": "ceo@horilux.test",
    "password": "TestPass123!"
})
print("LOGIN STATUS:", login_resp.status_code)
token = login_resp.json().get("access")
if not token:
    print("!! No access token, stopping.")
    raise SystemExit(1)

headers = {"Authorization": f"Bearer {token}"}

pdf_resp = requests.get(f"{BASE}/reports/board-pack-pdf/", headers=headers)
print("PDF STATUS:", pdf_resp.status_code)
print("CONTENT-TYPE:", pdf_resp.headers.get("content-type"))
print("CONTENT-LENGTH:", len(pdf_resp.content))

if pdf_resp.status_code == 200:
    with open("test_board_pack.pdf", "wb") as f:
        f.write(pdf_resp.content)
    print("Saved to test_board_pack.pdf — open it to check visually.")
else:
    print("BODY:", pdf_resp.text[:1000])
