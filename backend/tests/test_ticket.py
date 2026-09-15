from fastapi.testclient import TestClient
from app.main import app
from app.models.history import History


client = TestClient(app)

# ** Create_ticket **
def test_create_ticket_401(customer):
    payload = {
        "subject": "test_subject",
        "description": "desc",
        "priority": "low",
        "customer_id": customer.id
    }

    res = client.post("/tickets", json=payload)
    assert res.status_code == 401
    assert res.json()["detail"] == "Not authenticated"

def test_create_ticket(member_auth, customer):
    payload = {
        "subject": "test_subject",
        "description": "desc",
        "priority": "low",
        "customer_id": customer.id
    }

    res = client.post("/tickets", json=payload, headers=member_auth["headers"])
    assert res.status_code == 201
    data = res.json()
    assert data["company_id"] == customer.company_id
    assert data["description"] == "desc"
    assert data["company_id"] == member_auth["user"].company_id
    assert data["priority"] == "low"
    assert data["status"] == "open"
    assert data["assigned_to"] == None
    assert data["subject"] == payload["subject"]
    assert data["customer_id"] == payload["customer_id"]

def test_create_ticket_customer_from_another_company(admin_auth, customer, db):
    register_payload = {
        "name": "string",
        "password": "string",
        "confirm_password": "string",
        "company_name": "ABC",
        "phone_number": "12345678978",
        "email": "abc@example.com",
    }
    res = client.post("/users/register", json=register_payload)
    assert res.status_code == 201
    customer.company_id = res.json()["company_id"]
    db.commit()
    db.refresh(customer)
    assert customer.company_id == res.json()["company_id"]
    assert customer.company_id != admin_auth["user"].company_id
    ticket_payload = {
        "subject": "test_subject",
        "description": "desc",
        "priority": "low",
        "customer_id": customer.id  
    }
    ticket_res = client.post("/tickets", json=ticket_payload, headers=admin_auth["headers"])
    assert ticket_res.status_code == 404
    assert ticket_res.json()["detail"] == "Customer not found"

def test_create_ticket_customer_not_found(admin_auth, db, customer):
    payload = {
        "subject": "test_subject",
        "description": "desc",
        "priority": "low",
        "customer_id": customer.id
    }

    res = client.delete(f"/customers/{customer.id}", headers=admin_auth["headers"])
    assert res.status_code == 204

    ticket_res = client.post("/tickets", json=payload, headers=admin_auth["headers"])
    assert ticket_res.status_code == 404
    assert ticket_res.json()["detail"] == "Customer not found"

def test_create_ticket_invalid_priority(admin_auth, customer):
    payload = {
        "subject": "test_subject",
        "description": "desc",
        "priority": "something_wrong",
        "customer_id": customer.id
    }

    res = client.post("/tickets", json=payload, headers=admin_auth["headers"])
    assert res.status_code == 422

def test_create_ticket_missing_subject(admin_auth, customer): 

    payload = {
        "description": "desc",
        "priority": "low",
        "customer_id": customer.id
    }

    res = client.post("/tickets", json=payload, headers=admin_auth["headers"])
    assert res.status_code == 422

def test_create_ticket_missing_description(admin_auth, customer): 

    payload = {
        "subject": "subject",
        "priority": "low",
        "customer_id": customer.id
    }

    res = client.post("/tickets", json=payload, headers=admin_auth["headers"])
    assert res.status_code == 422


# ** Retrieve_tickets **
def test_retrieve_tickets_401():
    res = client.get("/tickets")
    assert res.status_code == 401
    assert res.json()["detail"] == "Not authenticated"

def test_retrieve_tickets_200(admin_auth):
    res = client.get("/tickets", headers=admin_auth["headers"])
    assert res.status_code == 200
    data = res.json()
    assert data["page"] == 1
    assert data["total_page"] == 1
    assert data["total_tickets"] == 0
    assert isinstance(data["tickets"], list)
    assert len(data["tickets"]) == 0

def test_retrieve_tickets_with_limit(admin_auth, customer):
    payload1 = {
        "subject": "subject1",
        "description": "desc",
        "priority": "low",
        "customer_id": customer.id
    }

    payload2 = {
            "subject": "subject2",
            "description": "desc",
            "priority": "low",
            "customer_id": customer.id
        }

    res = client.post("/tickets", json=payload1, headers=admin_auth["headers"])
    assert res.status_code == 201
    res = client.post("/tickets", json=payload2, headers=admin_auth["headers"])
    assert res.status_code == 201

    retrieve_res = client.get("/tickets?limit=1", headers=admin_auth["headers"])
    assert retrieve_res.status_code == 200
    data = retrieve_res.json()

    assert data["total_page"] == 2
    assert data["page"] == 1
    assert data["total_tickets"] == 2
    assert len(data["tickets"]) == 1
    assert data["tickets"][0]["subject"] == "subject1"

    retrieve_res = client.get("/tickets?limit=1&page=2", headers=admin_auth["headers"])
    assert retrieve_res.status_code == 200
    data = retrieve_res.json()

    assert data["total_page"] == 2
    assert data["page"] == 2
    assert data["total_tickets"] == 2
    assert len(data["tickets"]) == 1
    assert data["tickets"][0]["subject"] == "subject2"

def test_retrieve_tickets_page_not_found(admin_auth, customer):
    payload1 = {
        "subject": "subject1",
        "description": "desc",
        "priority": "low",
        "customer_id": customer.id
    }

    payload2 = {
            "subject": "subject2",
            "description": "desc",
            "priority": "low",
            "customer_id": customer.id
        }

    res = client.post("/tickets", json=payload1, headers=admin_auth["headers"])
    assert res.status_code == 201
    res = client.post("/tickets", json=payload2, headers=admin_auth["headers"])
    assert res.status_code == 201

    retrieve_res = client.get("/tickets?limit=1&page=3", headers=admin_auth["headers"])
    assert retrieve_res.status_code == 404
    assert retrieve_res.json()["detail"] == "Page not found"

def test_retrieve_tickets_from_another_company(owner_auth, customer, db):
    register_payload = {
        "name": "string",
        "password": "string",
        "confirm_password": "string",
        "company_name": "ABC",
        "phone_number": "12345678978",
        "email": "abc@example.com",
    }
    res = client.post("/users/register", json=register_payload)
    assert res.status_code == 201

    login_res = client.post("/users/login", json={"email": "abc@example.com", "password": "string"})
    assert login_res.status_code == 200

    customer.company_id = res.json()["company_id"]
    db.commit()
    db.refresh(customer)
    assert customer.company_id == res.json()["company_id"]

    token = login_res.json()["access_token"]
    ticket_payload1 = {
        "subject": "test_subject",
        "description": "desc",
        "priority": "low",
        "customer_id": customer.id  
    }
    headers = {
        "Authorization": f"Bearer {token}"
    }

    create_ticket_res = client.post("/tickets", json=ticket_payload1, headers=headers)
    assert create_ticket_res.status_code == 201

    retrieve_res = client.get("/tickets", headers=owner_auth["headers"])
    data = retrieve_res.json()

    assert data["total_tickets"] == 0
    assert len(data["tickets"]) == 0
    assert isinstance(data["tickets"], list)

def test_retrieve_tickets_invalid_limit(admin_auth):
    res = client.get("/tickets?limit=150", headers=admin_auth["headers"])
    assert res.status_code == 422

    res2 = client.get("/tickets?limit=0", headers=admin_auth["headers"])
    assert res2.status_code == 422

def test_retrieve_tickets_invalid_page(admin_auth):
    res = client.get("/tickets?page=0", headers=admin_auth["headers"])
    assert res.status_code == 422

def test_retrieve_tickets_response_fields(admin_auth, customer):
    payload = {
        "subject": "subject",
        "priority": "low",
        "customer_id": customer.id,
        "description": "desc"
    }

    create_res = client.post("/tickets", json=payload, headers=admin_auth["headers"])
    assert create_res.status_code == 201

    retrieve_res = client.get("/tickets", headers=admin_auth["headers"])
    assert retrieve_res.status_code == 200
    data = retrieve_res.json()
    ticket = data["tickets"][0]
    expected_fields = ["id", "subject", "company_id", "customer_id", "description", "priority", "status", "assigned_to", "created_at", "updated_at"]

    assert all(field in ticket for field in expected_fields)


# ** Patch Tickets **
def test_update_tickets_401(member_auth, customer):
    payload = {
        "subject": "sub",
        "description": "desc",
        "priority": "low",
        "customer_id": customer.id
    }

    create_ticket_res = client.post("/tickets", json=payload, headers=member_auth["headers"])
    assert create_ticket_res.status_code == 201
    assert "id" in create_ticket_res.json()
    ticket_id = create_ticket_res.json()["id"]
    

    update_payload = {
        "subject": "new_sub"
    }

    update_ticket_res = client.patch(f"/tickets/{ticket_id}", json=update_payload)
    assert update_ticket_res.status_code == 401
    assert update_ticket_res.json()["detail"] == "Not authenticated"

def test_update_ticket_200(admin_auth, customer):
    payload = {
        "subject": "sub",
        "description": "desc",
        "priority": "low",
        "customer_id": customer.id
    }
    create_res = client.post("/tickets", json=payload, headers=admin_auth["headers"])
    assert create_res.status_code == 201
    ticket_id = create_res.json()["id"]

    update_payload = {
        "subject": "new_sub"
    }
    update_res = client.patch(f"/tickets/{ticket_id}", json=update_payload, headers=admin_auth["headers"])
    assert update_res.status_code == 200
    assert update_res.json()["subject"] == "new_sub"
    assert update_res.json()["description"] == "desc"

def test_update_ticket_invalid_payload(admin_auth,customer):
    payload = {
        "subject": "sub",
        "description": "desc",
        "priority": "low",
        "customer_id": customer.id
    }
    create_res = client.post("/tickets", json=payload, headers=admin_auth["headers"])
    assert create_res.status_code == 201
    assert "id" in create_res.json()
    ticket_id = create_res.json()["id"]

    update_payload = {
        "priority": "invalid"
    }

    update_res = client.patch(f"/tickets/{ticket_id}", json=update_payload, headers=admin_auth["headers"])
    assert update_res.status_code == 422

def test_update_ticket_multiple_fields(admin_auth, customer):
    payload = {
        "subject": "sub",
        "description": "desc",
        "priority": "low",
        "customer_id": customer.id
    }
    create_res = client.post("/tickets", json=payload, headers=admin_auth["headers"])
    assert create_res.status_code == 201
    assert "id" in create_res.json()
    ticket_id = create_res.json()["id"]

    update_payload = {
        "subject": "new_sub",
        "description": "new_desc",
        "priority": "high"
    }
    update_res = client.patch(f"/tickets/{ticket_id}", json=update_payload, headers=admin_auth["headers"])
    assert update_res.status_code == 200

    data = update_res.json()
    assert data["subject"] == "new_sub"
    assert data["description"] == "new_desc"
    assert data["priority"] == "high"
    assert data["status"] == "open"

def test_update_ticket_assign_user_from_another_company(admin_auth, customer):
    register_payload = {
        "name": "string",
        "password": "string",
        "confirm_password": "string",
        "company_name": "string",
        "email": "reg@example.com",
        "phone_number": "12346578978"
    }
    register_res = client.post("/users/register", json=register_payload)
    assert register_res.status_code == 201
    id = register_res.json()["id"]

    payload = {
        "subject": "sub",
        "description": "desc",
        "priority": "low",
        "customer_id": customer.id
    }
    create_res = client.post("/tickets", json=payload, headers=admin_auth["headers"])
    assert create_res.status_code == 201
    assert "id" in create_res.json()
    ticket_id = create_res.json()["id"]

    update_payload = {
        "assigned_to": id
    }

    update_res = client.patch(f"/tickets/{ticket_id}", json=update_payload, headers=admin_auth["headers"])
    assert update_res.status_code == 404
    assert update_res.json()["detail"] == "No such user for assigning to!"

def test_update_ticket_status_200(admin_auth, ticket):
    payload= {
        "status": "in_progress"
    }
    res = client.patch(f"/tickets/{ticket.id}", json=payload, headers=admin_auth["headers"])
    assert res.status_code == 200
    assert res.json()["status"] == payload["status"]

def test_update_ticket_status_422(admin_auth, ticket, db):
    payload= {
        "status": "closed"
    }
    res = client.patch(f"/tickets/{ticket.id}", json=payload, headers=admin_auth["headers"])
    assert res.status_code == 422
    assert res.json()["detail"] == f"Invalid status transition from {ticket.status.value} to {payload['status']}"
    assert ticket.status.value == "open"
    histories = db.query(History).filter(History.user_id==admin_auth["user"].id, History.ticket_id==ticket.id).all()
    assert len(histories) == 0

def test_update_ticket_multiple_fields(admin_auth, ticket):
    payload= {
        "status": "in_progress",
        "assigned_to": admin_auth["user"].id
    }
    res = client.patch(f"/tickets/{ticket.id}", json=payload, headers=admin_auth["headers"])
    assert res.status_code == 200
    assert res.json()["status"] == payload["status"]
    assert res.json()["assigned_to"] == admin_auth["user"].id

def test_update_ticket_history_200(admin_auth, ticket, db):
    payload= {
        "status": "in_progress",
        "assigned_to": admin_auth["user"].id
    }
    res = client.patch(f"/tickets/{ticket.id}", json=payload, headers=admin_auth["headers"])
    assert res.status_code == 200
    histories = db.query(History).filter(History.user_id==admin_auth["user"].id, History.ticket_id==ticket.id).all()
    assert len(histories) == 2

    status_history = [history for history in histories if history.field == "status"]
    assert status_history[0].new_value == "in_progress"
    assert status_history[0].old_value == "open"

    assigned_to_history = [history for history in histories if history.field == "assigned_to"]
    assert assigned_to_history[0].new_value == str(admin_auth["user"].id)
    assert assigned_to_history[0].old_value is None

def test_update_ticket_403(member_auth, ticket, db):
    payload= {
        "status": "in_progress",
        "assigned_to": member_auth["user"].id
    }
    res = client.patch(f"/tickets/{ticket.id}", json=payload, headers=member_auth["headers"])
    assert res.status_code == 403
    assert res.json()["detail"] == "You don't have permission to assign tickets"
    histories = db.query(History).filter(History.user_id==member_auth["user"].id, History.ticket_id==ticket.id).all()
    assert len(histories) == 0


# ** Retrieve_ticket **
def test_retrieve_ticket_200(member_auth, customer):
    payload = {
        "subject": "sub",
        "description": "desc",
        "priority": "low",
        "customer_id": customer.id
    }
    create_res = client.post("/tickets", json=payload, headers=member_auth["headers"])
    assert create_res.status_code == 201
    res = client.get(f"/tickets/{create_res.json()["id"]}", headers=member_auth["headers"])
    assert res.status_code == 200

def test_retrieve_ticket_401(member_auth, customer):
    payload = {
        "subject": "sub",
        "description": "desc",
        "priority": "low",
        "customer_id": customer.id
    }
    create_res = client.post("/tickets", json=payload, headers=member_auth["headers"])
    assert create_res.status_code == 201
    res = client.get(f"/tickets/{create_res.json()['id']}")
    assert res.status_code == 401
    assert res.json()["detail"] == "Not authenticated"

def test_retrieve_ticket_404(member_auth, customer):
    res = client.get(f"/tickets/9999", headers=member_auth["headers"])
    assert res.status_code == 404
    assert res.json()["detail"] == "Ticket not found"

def test_retrieve_deleted_ticket(admin_auth, customer):
    payload = {
        "subject": "sub",
        "description": "desc",
        "priority": "low",
        "customer_id": customer.id
    }
    create_res = client.post("/tickets", json=payload, headers=admin_auth["headers"])
    assert create_res.status_code == 201
    ticket_id = create_res.json()['id']

    delete_res = client.delete(f"/tickets/{ticket_id}", headers=admin_auth["headers"])
    assert delete_res.status_code == 204

    get_res = client.get(f"/tickets/{ticket_id}", headers=admin_auth["headers"])
    assert get_res.status_code == 404
    assert get_res.json()["detail"] == "Ticket not found"

    