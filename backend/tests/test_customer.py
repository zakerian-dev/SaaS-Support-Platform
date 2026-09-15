from fastapi.testclient import TestClient
from app.main import app
from app.models.customer import Customer

client = TestClient(app)


# ** Create_Customer **
def test_create_customer(member_auth):
    payload = {
        "name": "string",
        "email": "customer@example.com",
        "phone_number": "12345678978",
    }
    res = client.post("/customers", json=payload, headers=member_auth["headers"])
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "string"
    assert data["email"] == "customer@example.com"
    assert data["phone_number"] == "12345678978"
    assert data["company_id"] == member_auth["user"].company_id

def test_create_customer_401():
    payload = {
        "name": "string",
        "email": "customer@example.com",
        "phone_number": "12345678978",
    }
    res = client.post("/customers", json=payload)
    assert res.status_code == 401
    assert res.json()["detail"] == "Not authenticated"  


# ** Retrieve **
def test_retrieve_customer_401():
    res = client.get("/customers")
    assert res.status_code == 401
    assert res.json()["detail"] == "Not authenticated"

def test_retrieve_customer_200(member_auth):
    res = client.get("/customers", headers=member_auth["headers"])
    assert res.status_code == 200
    data = res.json()
    assert data["page"] == 1
    assert data["total_page"] == 1
    assert data["total_customers"] == 0
    assert isinstance(data["customers"], list)

def test_retrieve_customers_404(member_auth):
    res = client.get("/customers?page=2", headers=member_auth["headers"])
    assert res.status_code == 404
    data = res.json()
    assert data["detail"] == "Page not found"  

def test_retrieve_customers_with_limit(member_auth):
    payload = {
        "name": "string",
        "email": "customer@example.com",
        "phone_number": "12345678978",
    }
    res = client.post("/customers", json=payload, headers=member_auth["headers"])
    assert res.status_code == 201
    res = client.post("/customers", json=payload, headers=member_auth["headers"])
    assert res.status_code == 201

    retrieve_res = client.get("/customers?limit=1", headers=member_auth["headers"])
    assert retrieve_res.status_code == 200
    data = retrieve_res.json()
    assert len(data["customers"]) == 1
    assert data["page"] == 1
    assert data["total_page"] == 2
    assert data["total_customers"] == 2
    assert isinstance(data["customers"], list)

def test_retrieve_customers_second_page(member_auth):
    payload = {
        "name": "string",
        "email": "customer@example.com",
        "phone_number": "12345678978",
    }
    payload2 = {
            "name": "string",
            "email": "customer2@example.com",
            "phone_number": "12345678978",
        }
    
    res = client.post("/customers", json=payload, headers=member_auth["headers"])
    assert res.status_code == 201
    res = client.post("/customers", json=payload2, headers=member_auth["headers"])
    assert res.status_code == 201

    retrieve_res = client.get("/customers?limit=1&page=2", headers=member_auth["headers"])
    assert retrieve_res.status_code == 200
    data = retrieve_res.json()
    assert len(data["customers"]) == 1
    assert data["page"] == 2
    assert data["total_page"] == 2
    assert data["total_customers"] == 2
    assert isinstance(data["customers"], list)
    assert data["customers"][0]["email"] == payload2["email"]

# ** Delete **
def test_delete_customer_204_as_admin(admin_auth):
    payload = {
        "name": "string",
        "email": "customer@example.com",
        "phone_number": "12345678978",
    }
    res = client.post("/customers", json=payload, headers=admin_auth["headers"])
    assert res.status_code == 201
    customer_id = res.json()["id"]
    delete_res = client.delete(f"/customers/{customer_id}", headers=admin_auth["headers"])
    assert delete_res.status_code == 204

def test_delete_customer_204_as_owner(owner_auth):
    payload = {
        "name": "string",
        "email": "customer@example.com",
        "phone_number": "12345678978",
    }
    res = client.post("/customers", json=payload, headers=owner_auth["headers"])
    assert res.status_code == 201
    customer_id = res.json()["id"]
    delete_res = client.delete(f"/customers/{customer_id}", headers=owner_auth["headers"])
    assert delete_res.status_code == 204

def test_delete_customer_as_member(member_auth):
    payload = {
        "name": "string",
        "email": "customer@example.com",
        "phone_number": "12345678978",
    }
    res = client.post("/customers", json=payload, headers=member_auth["headers"])
    assert res.status_code == 201
    customer_id = res.json()["id"]
    delete_res = client.delete(f"/customers/{customer_id}", headers=member_auth["headers"])
    assert delete_res.status_code == 403
    assert delete_res.json()["detail"] == "You don't have access to this endpoint"

def test_delete_customer_not_found(admin_auth):
    delete_res = client.delete("/customers/1", headers=admin_auth["headers"])
    assert delete_res.status_code == 404
    assert delete_res.json()["detail"] == "Customer not found" 

def test_delete_customer_401():
    delete_res = client.delete("/customers/1")
    assert delete_res.status_code == 401
    assert delete_res.json()["detail"] == "Not authenticated"

def test_delete_customer_another_company(admin_auth, db):
    create_company_payload = {
        "name": "ali",
        "email": "ali@example.com",
        "password": "string",
        "confirm_password": "string",
        "company_name": "new_company",
        "phone_number": "12345678978"
    }
    create_res = client.post("/users/register", json=create_company_payload)
    assert create_res.status_code == 201

    payload = {
        "name": "string",
        "email": "customer@example.com",
        "phone_number": "12345678978",
    }
    res = client.post("/customers", json=payload, headers=admin_auth["headers"])
    assert res.status_code == 201 

    customer = db.get(Customer, res.json()["id"])
    customer.company_id = create_res.json()["company_id"]
    db.commit()
    db.refresh(customer)

    customer_id = res.json()["id"]
    delete_res = client.delete(f"/customers/{customer_id}", headers=admin_auth["headers"])
    assert delete_res.status_code == 404


# ** Patch **
def test_patch_customer_as_owner(customer, owner_auth):
    email = customer.email
    payload = {
        "name": "updated_name"
    }
    res = client.patch(f"/customers/{customer.id}", json=payload, headers=owner_auth["headers"])
    assert res.status_code == 200
    assert res.json()["name"] == "updated_name"
    assert res.json()["email"] == email

def test_patch_customer_as_admin(customer, admin_auth):
    payload = {
        "email": "new@example.com"
    }
    res = client.patch(f"/customers/{customer.id}", json=payload, headers=admin_auth["headers"])
    assert res.status_code == 200
    assert res.json()["email"] == "new@example.com"

def test_patch_customer_as_member(customer, member_auth):
    payload = {
        "email": "new@example.com"
    }
    res = client.patch(f"/customers/{customer.id}", json=payload, headers=member_auth["headers"])
    assert res.status_code == 403
    assert res.json()["detail"] == "You don't have access to this endpoint"

def test_patch_customer_without_login(customer):
    payload = {
        "email": "new@example.com"
    }
    res = client.patch(f"/customers/{customer.id}", json=payload)
    assert res.status_code == 401
    assert res.json()["detail"] == "Not authenticated"

def test_patch_customer_as_owner_invalid_email(customer, owner_auth):
    payload = {
        "email": "invalid_email"
    }
    res = client.patch(f"/customers/{customer.id}", json=payload, headers=owner_auth["headers"])
    assert res.status_code == 422

def test_patch_customer_as_owner_existing_email(customer, owner_auth):
    create_payload = {
        "name": "string",
        "email": "test@example.com",
        "phone_number": "01234657897",
        "company_id": owner_auth["user"].company_id
    }
    create_res = client.post("/customers", json=create_payload, headers=owner_auth["headers"])
    assert create_res.status_code == 201

    payload = {
        "email": "test@example.com"
    }
    res = client.patch(f"/customers/{customer.id}", json=payload, headers=owner_auth["headers"])
    assert res.status_code == 409
    assert res.json()["detail"] == "Email is already taken"

def test_patch_customer_404(owner_auth):
    payload = {
        "name": "updated_name"
    }
    res = client.patch("/customers/99999", json=payload, headers=owner_auth["headers"])
    assert res.status_code == 404
    assert res.json()["detail"] == "Customer not found"

def test_patch_customer_from_another_company(admin_auth, customer, db):
    create_company_payload = {
        "name": "ali",
        "email": "ali@example.com",
        "password": "string",
        "confirm_password": "string",
        "company_name": "new_company",
        "phone_number": "12345678978"
    }
    create_res = client.post("/users/register", json=create_company_payload)
    assert create_res.status_code == 201

    customer.company_id = create_res.json()["company_id"]
    db.commit()
    db.refresh(customer)

    payload = {
        "name": "string",
    }

    res = client.patch(f"/customers/{customer.id}", json=payload, headers=admin_auth["headers"])
    assert res.status_code == 404 
    assert res.json()["detail"] == "Customer not found"

