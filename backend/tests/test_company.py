from fastapi.testclient import TestClient
from app.main import app
from app.models.users import UserType, User
from app.core.security import verify_password

client = TestClient(app)

def test_get_company_without_login():
    res = client.get("/companies/me")
    assert res.status_code == 401
    data = res.json()
    assert data["detail"] == "Not authenticated"

def test_get_company_with_login(member_auth):
    res = client.get("/companies/me", headers=member_auth["headers"])
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == member_auth["user"].company_id
