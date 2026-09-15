from fastapi.testclient import TestClient
from app.main import app
from datetime import datetime


client = TestClient(app)


# ** Create_Comment **
def test_create_comment_201(admin_auth, ticket):
    payload = {
        "content": "content"
    }
    res = client.post(f"/tickets/{ticket.id}/comments", headers=admin_auth["headers"], json=payload)
    assert res.status_code == 201
    data = res.json()

    expected_fields = ["id", "content", "user_id", "ticket_id", "created_at", "updated_at"]
    assert all(field in data for field in expected_fields)

def test_create_comment_401(ticket):
    payload = {
        "content": "content"
    }
    res = client.post(f"/tickets/{ticket.id}/comments", json=payload)
    assert res.status_code == 401
    assert res.json()["detail"] == "Not authenticated"

def test_create_comment_404(admin_auth):
    payload = {
        "content": "content"
    }
    res = client.post(f"/tickets/9999/comments", json=payload, headers=admin_auth["headers"])
    assert res.status_code == 404
    assert res.json()["detail"] == "Ticket not found"

def test_create_comment_for_another_company(admin_auth, db, ticket):
    payload = {
        "name": "string",
        "email": "email@example.com",
        "password": "string",
        "confirm_password": "string",
        "phone_number": "12345678978",
        "company_name": "abc"
    }
    register_res = client.post("/users/register", json=payload)
    assert register_res.status_code == 201
    assert "company_id" in register_res.json()
    ticket.company_id = register_res.json()["company_id"]
    db.commit()
    db.refresh(ticket)

    comment_payload = {
        "content": "content"
    }

    comment_res = client.post(f"/tickets/{ticket.id}/comments", json=comment_payload, headers=admin_auth["headers"])
    assert comment_res.status_code == 404
    assert comment_res.json()["detail"] == "Ticket not found"


# ** Get_Comments **
def test_get_comments_200(admin_auth, ticket, comment):
    res = client.get(f"/tickets/{ticket.id}/comments", headers=admin_auth["headers"])
    assert res.status_code == 200
    data = res.json()
    assert data["page"] == 1
    assert data["total_page"] == 1
    assert data["total_comments"] == 1
    assert data["comments"][0]["content"] == "content"

def test_get_comments_401(ticket, comment):
    res = client.get(f"/tickets/{ticket.id}/comments")
    assert res.status_code == 401
    assert res.json()["detail"]  == "Not authenticated"

def test_get_comments_404(admin_auth, comment):
    res = client.get(f"/tickets/9999/comments", headers=admin_auth["headers"])
    assert res.status_code == 404
    assert res.json()["detail"]  == "Ticket not found"

def test_get_comments_pagination(admin_auth, ticket, comment):
    payload2 = {
        "content": "content2"
    }
    payload3 = {
        "content": "content3"
    }
    create_res = client.post(f"/tickets/{ticket.id}/comments", json=payload2, headers=admin_auth["headers"])
    assert create_res.status_code == 201

    create_res = client.post(f"/tickets/{ticket.id}/comments", json=payload3, headers=admin_auth["headers"])
    assert create_res.status_code == 201

    get_res = client.get(f"/tickets/{ticket.id}/comments?limit=1&page=2", headers=admin_auth["headers"])
    assert get_res.status_code == 200
    data = get_res.json()

    assert data["page"] == 2
    assert data["total_page"] == 3
    assert data["total_comments"] == 3
    assert data["comments"][0]["content"] == "content2"

def test_get_comments_soft_deleted(admin_auth, ticket, comment, db):
    comment.deleted_at = datetime.now()
    db.commit()
    db.refresh(comment)

    get_res = client.get(f"/tickets/{ticket.id}/comments", headers=admin_auth["headers"])
    assert get_res.status_code == 200
    data = get_res.json()

    assert data["page"] == 1
    assert data["total_page"] == 1
    assert data["total_comments"] == 0
    assert isinstance(data["comments"], list)


# ** Update_Comments **
def test_update_comment_200(admin_auth, ticket, comment):
    payload = {
        "content": "new_content"
    }
    res = client.patch(f"/tickets/{ticket.id}/comments/{comment.id}", json=payload, headers=admin_auth["headers"])
    assert res.status_code == 200
    data = res.json()

    assert data["content"] == "new_content"
    assert data["user_id"] == admin_auth["user"].id
    assert data["ticket_id"] == ticket.id

def test_update_comment_401(ticket, comment):
    payload = {
        "content": "new_content"
    }
    res = client.patch(f"/tickets/{ticket.id}/comments/{comment.id}", json=payload)
    assert res.status_code == 401
    assert res.json()["detail"] == "Not authenticated"

def test_update_comment_404(admin_auth, ticket, comment):
    payload = {
        "content": "new_content"
    }
    res = client.patch(f"/tickets/{ticket.id}/comments/9999", json=payload, headers=admin_auth["headers"])
    assert res.status_code == 404
    assert res.json()['detail'] == "Comment not found"

    res2 = client.patch(f"/tickets/9999/comments/{comment.id}", json=payload, headers=admin_auth["headers"])
    assert res2.status_code == 404
    assert res2.json()['detail'] == "Ticket not found"

def test_update_comment_403(admin_auth, ticket, comment, db):
    create_payload={
        "name": "test_user",
        "email": "test@example.com",
        "password": "string",
        "phone_number": "12345678945",
        "user_type": "member"
    }
    create_res = client.post("/users/create_user", json=create_payload, headers=admin_auth["headers"])
    assert create_res.status_code == 201

    comment.user_id = create_res.json()["id"]
    db.commit()
    db.refresh(comment)

    assert comment.user_id != admin_auth["user"].id

    update_payload = {
        "content": "new_content"
    }

    update_res = client.patch(f"/tickets/{ticket.id}/comments/{comment.id}", json=update_payload, headers=admin_auth["headers"])
    assert update_res.status_code == 403
    assert update_res.json()["detail"] == "You can't update a comment that is not yours"
    assert comment.content != "new_content"


# ** Delete_Comment **
def test_delete_comment_204(admin_auth,ticket, comment, db):
    res = client.delete(f"/tickets/{ticket.id}/comments/{comment.id}", headers=admin_auth["headers"])
    assert res.status_code == 204
    db.refresh(comment)
    assert comment.deleted_at is not None

def test_delete_comment_401(admin_auth, ticket, comment):
    res = client.delete(f"/tickets/{ticket.id}/comments/{comment.id}")
    assert res.status_code == 401
    assert res.json()["detail"] == "Not authenticated"

def test_delete_comment_404(admin_auth, ticket, comment):
    ticket_res = client.delete(f"/tickets/{ticket.id}/comments/9999", headers=admin_auth["headers"])
    assert ticket_res.status_code == 404
    assert ticket_res.json()["detail"] == "Comment not found"

    comment_res = client.delete(f"/tickets/9999/comments/{comment.id}", headers=admin_auth["headers"])
    assert comment_res.status_code == 404
    assert comment_res.json()["detail"] == "Ticket not found" 

def test_delete_comment_403(admin_auth, ticket, comment, db):
    create_payload={
        "name": "test_user",
        "email": "test@example.com",
        "password": "string",
        "phone_number": "12345678945",
        "user_type": "member"
    }
    create_res = client.post("/users/create_user", json=create_payload, headers=admin_auth["headers"])
    assert create_res.status_code == 201

    comment.user_id = create_res.json()["id"]
    db.commit()
    db.refresh(comment)

    assert comment.user_id != admin_auth["user"].id

    delete_res = client.delete(f"/tickets/{ticket.id}/comments/{comment.id}", headers=admin_auth["headers"])
    assert delete_res.status_code == 403
    assert delete_res.json()["detail"] == "You can't delete a comment that is not yours"
    db.refresh(comment)
    assert comment.deleted_at is None

