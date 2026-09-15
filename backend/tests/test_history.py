from fastapi.testclient import TestClient
from app.main import app
from datetime import datetime

client = TestClient(app)

def test_history_200(member_auth, history, ticket):
    res = client.get(f"/tickets/{ticket.id}/history", headers=member_auth["headers"])
    assert res.status_code == 200
    data = res.json()

    assert data["page"] == 1
    assert data["total_page"] == 1
    assert data["total_history"] == 1

    expected_fields = ["id", "new_value", "old_value", "created_at", "action", "field", "ticket_id", "user_id"]
    assert all(field in data["history"][0] for field in expected_fields)

def test_history_404(member_auth):
    res = client.get(f"/tickets/9999/history", headers=member_auth["headers"])
    assert res.status_code == 404
    assert res.json()["detail"] == "Ticket not found"

def test_history_401(ticket):
    res = client.get(f"/tickets/{ticket.id}/history")
    assert res.status_code == 401
    assert res.json()["detail"] == "Not authenticated"

def test_history_pagination(member_auth, ticket, history):
    update_payload = {
        "status": "in_progress"
    }

    update_res = client.patch(f"/tickets/{ticket.id}", json=update_payload, headers=member_auth["headers"])
    assert update_res.status_code == 200

    get_res = client.get(f"/tickets/{ticket.id}/history?limit=1&page=2", headers=member_auth["headers"])
    assert get_res.status_code == 200
    data = get_res.json()

    assert data["page"] == 2
    assert data["total_page"] == 2
    assert len(data["history"]) == 1
    assert data["total_history"] == 2