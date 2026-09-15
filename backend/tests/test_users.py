from fastapi.testclient import TestClient
from app.main import app
from app.models.users import UserType, User
from app.core.security import verify_password

client = TestClient(app)


# ** Register **
def test_register():
    payload = {
        "name": "ali",
        "password": "string",
        "confirm_password": "string",
        "email": "test@example.com",
        "company_name": "test",
        "phone_number": "01234567891"
    }
    response = client.post("/users/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"

def test_register_invalid_email():
    payload = {
        "name": "ali",
        "password": "string",
        "confirm_password": "string",
        "email": "testexample.com",
        "company_name": "test",
        "phone_number": "01234567891"
    }
    response = client.post("/users/register", json=payload)
    assert response.status_code == 422

def test_register_password_not_match():
    payload = {
        "name": "ali",
        "password": "string",
        "confirm_password": "string2",
        "email": "test@example.com",
        "company_name": "test",
        "phone_number": "01234567891"
    }
    response = client.post("/users/register", json=payload)
    assert response.status_code == 422    

def test_register_existing_email():
    payload = {
        "name": "ali",
        "password": "string",
        "confirm_password": "string",
        "email": "test@example.com",
        "company_name": "test",
        "phone_number": "01234567891"
    }
    first_response = client.post("/users/register", json=payload)
    assert first_response.status_code == 201

    second_response = client.post("/users/register", json=payload)
    data = second_response.json()
    assert second_response.status_code == 409
    assert data["detail"] == "Email is already taken"


# ** Login **
def test_login(member):
    payload={
        "email": member.email,
        "password": "string"
    }
    response = client.post("/users/login", json=payload)
    data = response.json()

    assert response.status_code == 200
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password(member):
    payload={
        "email": member.email,
        "password": "wrong_password"
    }
    res = client.post("/users/login", json=payload)
    assert res.status_code == 401
    data = res.json()
    assert data["detail"] == "Email or password is wrong"

def test_login_wrong_email():
    pay={
        "email" : "doesnotexist@example.com",
        "password": "string"
    }
    res = client.post("/users/login", json=pay)
    data = res.json()
    assert res.status_code == 401
    assert data["detail"] == "Email or password is wrong"


# ** Dashboard **
def test_dashboard_member(member_auth):

    response = client.get("/users/dashboard", headers=member_auth["headers"])
    assert response.status_code == 403

def test_dashboard_owner(owner_auth):
    response = client.get("/users/dashboard", headers=owner_auth["headers"])
    assert response.status_code == 200

def test_dashboard_without_token():
    res = client.get("/users/dashboard")
    assert res.status_code == 401

def test_dashboard_invalid_token():
    headers = {
        "Authorization": f"Bearer 123asdf"
    }
    response = client.get("/users/dashboard", headers=headers)
    assert response.status_code == 401


# ** Create_user **
def test_create_user_with_member_user(member):
    payload={
        "email": member.email,
        "password": "string"
    }
    response = client.post("/users/login", json=payload)
    assert response.status_code == 200
    
    token = response.json()["access_token"]
    headers={
        "Authorization": f"Bearer {token}"
    }
    create_payload={
        "name": "test_user",
        "email": "test@example.com",
        "password": "string",
        "phone_number": "12345678945",
        "user_type": "member"
    }
    create_response = client.post("/users/create_user", json=create_payload, headers=headers)
    assert create_response.status_code == 403

def test_create_user_with_admin_user(admin):
    payload={
        "email": admin.email,
        "password": "string"
    }
    response = client.post("/users/login", json=payload)
    assert response.status_code == 200
    
    token = response.json()["access_token"]
    headers={
        "Authorization": f"Bearer {token}"
    }
    create_payload={
        "name": "test_user",
        "email": "test@example.com",
        "password": "string",
        "phone_number": "12345678945",
        "user_type": "member"
    }
    create_response = client.post("/users/create_user", json=create_payload, headers=headers)
    assert create_response.status_code == 201

def test_create_admin_user_as_admin(admin):
    payload={
        "email": admin.email,
        "password": "string"
    }
    login_res = client.post("/users/login", json=payload)
    assert login_res.status_code == 200

    token = login_res.json()["access_token"]
    headers = {
        "Authorization": f"Bearer {token}"
    }
    create_payload = {
        "name": "test",
        "password": "string",
        "email": "test@example.com",
        "phone_number": "12345678945",
        "user_type": "admin"
    }
    create_res = client.post("/users/create_user", json=create_payload, headers=headers)
    data = create_res.json()
    assert create_res.status_code == 403
    assert data["detail"] == "You can't create a non member user"

def test_create_user_with_owner(owner):
    payload={
        "email": owner.email,
        "password": "string"
    }
    login_response = client.post("/users/login", json=payload)
    assert login_response.status_code == 200

    token = login_response.json()["access_token"]
    headers = {
        "Authorization": f"Bearer {token}"
    }
    create_payload={
        "name": "test",
        "email": "test@example.com",
        "password": "string",
        "phone_number": "12345678978",
        "user_type": "member"
    }
    create_response = client.post("/users/create_user", json=create_payload, headers=headers)
    assert create_response.status_code == 201

def test_create_owner_user_as_owner(owner):
    log_pay = {
        "email": owner.email,
        "password": "string"
    }

    log_res = client.post("/users/login", json=log_pay)
    assert log_res.status_code == 200

    token = log_res.json()["access_token"]

    headers = {
        "Authorization": f"Bearer {token}"
    }

    create_payload={
        "name": "test",
        "email": "test@example.com",
        "password": "string",
        "phone_number": "12345678978",
        "user_type": "owner"
    }

    create_response = client.post("/users/create_user", json=create_payload, headers=headers)
    data = create_response.json()
    assert create_response.status_code == 403
    assert data["detail"] == "You can't create another owner"

def test_create_user_with_existing_email(admin_auth):

    create_payload = {
            "name": "test",
            "password": "string",
            "email": admin_auth["user"].email,
            "phone_number": "12345678945",
            "user_type": "member"
        }
    create_res = client.post("/users/create_user", json=create_payload, headers=admin_auth["headers"])
    data = create_res.json()
    assert create_res.status_code == 409
    assert data["detail"] == "Email is already taken"

def test_create_user_invalid_email(admin_auth):

    create_payload = {
            "name": "test",
            "password": "string",
            "email": "invalid_email",
            "phone_number": "12345678945",
            "user_type": "member"
        }
    create_res = client.post("/users/create_user", json=create_payload, headers=admin_auth["headers"])
    data = create_res.json()
    assert create_res.status_code == 422

def test_create_user_existing_email(admin_auth, member):

    create_payload = {
            "name": "test",
            "password": "string",
            "email": member.email,
            "phone_number": "12345678945",
            "user_type": "member"
        }
    create_res = client.post("/users/create_user", json=create_payload, headers=admin_auth["headers"])
    data = create_res.json()
    assert create_res.status_code == 409
    assert data["detail"] == "Email is already taken"

def test_create_user_without_name(admin_auth):
    payload = {
        "email": "test@example.com",
        "password": "string",
        "phone_number": "13245678998",
        "user_type": "member"
    }
    res = client.post("/users/create_user", headers=admin_auth["headers"], json=payload)
    assert res.status_code == 422

def test_create_user_without_email(admin_auth):
    payload = {
        "name": "test",
        "password": "string",
        "phone_number": "13245678998",
        "user_type": "member"
    }
    res = client.post("/users/create_user", headers=admin_auth["headers"], json=payload)
    assert res.status_code == 422


# ** Retrieve **
def test_retrieve_users_as_admin(admin):
    payload={
        "email": admin.email,
        "password": "string"
    }
    login_response = client.post("/users/login", json=payload)
    assert login_response.status_code == 200

    token = login_response.json()["access_token"]
    headers={
        "Authorization": f"Bearer {token}"
    }
    retrieve_response = client.get("/users/users", headers=headers)
    assert retrieve_response.status_code == 200

    data = retrieve_response.json()

    assert isinstance(data["users"], list)
    assert len(data["users"]) == 1
    assert data["users"][0]["email"] == admin.email

def test_retrieve_users_as_owner(owner):
    login_payload={
        "email": owner.email,
        "password": "string"
    }
    login_response = client.post("/users/login", json=login_payload)
    assert login_response.status_code == 200

    token = login_response.json()["access_token"]
    headers = {
        "Authorization": f"Bearer {token}"
    }
    retrieve_res = client.get("/users/users",headers=headers)
    data = retrieve_res.json()
    assert retrieve_res.status_code == 200
    assert len(data["users"]) == 1
    assert isinstance(data["users"], list)
    assert data["users"][0]["email"] == owner.email

def test_retrieve_users_as_member(member):
    login_payload={
            "email": member.email,
            "password": "string"
        }
    login_response = client.post("/users/login", json=login_payload)
    assert login_response.status_code == 200

    token = login_response.json()["access_token"]
    headers = {
        "Authorization": f"Bearer {token}"
    }
    retrieve_res = client.get("/users/users",headers=headers)
    data = retrieve_res.json()
    assert retrieve_res.status_code == 403

# * pagination *
def test_pagination(admin_auth, member, owner):
    res = client.get("/users/users", headers=admin_auth["headers"])
    assert res.status_code == 200
    data = res.json()
    assert len(data["users"]) == 3
    assert data["total_users"] == 3
    assert data["total_page"] == 1
    assert data["page"] == 1

def test_pagination_with_limit_2(admin_auth, member, owner):
    res = client.get("/users/users?limit=2", headers=admin_auth["headers"])
    assert res.status_code == 200
    data = res.json()
    assert len(data["users"]) == 2
    assert data["total_users"] == 3
    assert data["total_page"] == 2
    assert data["page"] == 1 

def test_pagination_with_not_found_page(admin_auth, member, owner):
    res = client.get("/users/users?page=2", headers=admin_auth["headers"])
    assert res.status_code == 404
    assert res.json()["detail"]   == "Page not found"
    

# ** Patch **
def test_patch_user_as_owner(owner_auth, member):
    payload = {
        "name": "updated_name"
    }
    res = client.patch(f"/users/{member.id}", json=payload, headers=owner_auth["headers"])
    data = res.json()
    assert res.status_code == 200
    assert data["name"] == "updated_name"

def test_patch_user_as_admin(admin_auth, member):
    payload = {
        "name": "updated_name"
    }
    res = client.patch(f"/users/{member.id}", json=payload, headers=admin_auth["headers"])
    data = res.json()
    assert res.status_code == 200
    assert data["name"] == "updated_name"

def test_patch_admin_as_admin(admin_auth, admin):
    payload = {
        "name": "updated_name"
    }
    res = client.patch(f"/users/{admin.id}", json=payload, headers=admin_auth["headers"])
    data = res.json()
    assert res.status_code == 403
    assert data["detail"] == "Admin can only update members"

def test_patch_admin_as_owner(owner_auth, admin):
    payload = {
        "name": "updated_name"
    }
    res = client.patch(f"/users/{admin.id}", json=payload, headers=owner_auth["headers"])
    data = res.json()
    assert res.status_code == 200
    assert data["name"] == "updated_name" 

def test_patch_owner_as_owner(owner, owner_auth):
    payload = {
        "name": "updated_name"
    }
    res = client.patch(f"/users/{owner.id}", json=payload, headers=owner_auth["headers"])
    data = res.json()
    assert res.status_code == 403
    assert data["detail"] == "You can't update owner" 

def test_owner_can_change_member_role_to_admin(owner_auth, member):
    payload = {
        "user_type": "admin"
    }
    res = client.patch(f"/users/{member.id}", json=payload, headers=owner_auth["headers"])
    data = res.json()
    assert res.status_code == 200
    assert data["user_type"] == "admin"

def test_owner_can_change_admin_role_to_member(owner_auth, admin):
    payload = {
        "user_type": "member"
    }
    res = client.patch(f"/users/{admin.id}", json=payload, headers=owner_auth["headers"])
    data = res.json()
    assert res.status_code == 200
    assert data["user_type"] == "member"  

def test_owner_can_change_admin_role_to_owner(owner_auth, admin, db):
    payload = {
        "user_type": "owner"
    }
    res = client.patch(f"/users/{admin.id}", json=payload, headers=owner_auth["headers"])
    data = res.json()
    assert res.status_code == 403
    assert data["detail"] == "You can't assign owner role"
    db.refresh(admin)
    assert admin.user_type == UserType.ADMIN

def test_admin_can_change_member_role_to_admin(admin_auth, member):
    payload = {
        "user_type": "admin"
    }
    res = client.patch(f"/users/{member.id}", json=payload, headers=admin_auth["headers"])
    data = res.json()
    assert res.status_code == 403
    assert data["detail"] == "Admin can only assign member role"

def test_member_can_change_member_role_to_admin(member_auth, member):
    payload = {
        "user_type": "admin"
    }
    res = client.patch(f"/users/{member.id}", json=payload, headers=member_auth["headers"])
    data = res.json()
    assert res.status_code == 403
    assert data["detail"] == "You don't have access to this endpoint"

def test_owner_existing_email(owner_auth, member):
    payload = {
        "email": owner_auth["user"].email
    }
    res = client.patch(f"/users/{member.id}", json=payload, headers=owner_auth["headers"])
    data = res.json()
    assert res.status_code == 409
    assert data["detail"] == "Email is already taken"

def test_owner_wrong_user(owner_auth, member):
    payload = {
        "email": "testing@example.com"
    }
    res = client.patch(f"/users/{member.id + 10}", json=payload, headers=owner_auth["headers"])
    data = res.json()
    assert res.status_code == 404
    assert data["detail"] == "User not found"

def test_partial_update_member(owner_auth, member, db):
    old_email = member.email
    old_phone = member.phone_number
    old_role = member.user_type
    payload = {
        "name" : "updated_name"
    }
    res = client.patch(f"/users/{member.id}", json=payload, headers=owner_auth["headers"])
    assert res.status_code == 200

    db.refresh(member)

    assert member.email == old_email
    assert member.phone_number == old_phone
    assert member.user_type == old_role
    assert member.name == "updated_name"

def test_update_password(owner_auth, member, db):
    old_password = member.password_hash
    payload = {
        "password": "new_password"
    }
    res = client.patch(f"/users/{member.id}", json=payload, headers=owner_auth["headers"])
    assert res.status_code == 200
    db.refresh(member)
    assert verify_password("new_password", member.password_hash)
    assert member.password_hash != old_password

    old_payload = {
        "email": member.email,
        "password": "string"
    }
    res = client.post("/users/login", json=old_payload)
    data = res.json()
    assert res.status_code == 401
    assert data["detail"] == "Email or password is wrong"

    login_payload = {
        "email": member.email,
        "password": "new_password"
    }
    res = client.post("/users/login", json=login_payload)
    assert res.status_code == 200


# ** Delete **
def test_delete_member_as_owner(owner_auth, member, db):
    user_id = member.id
    res = client.delete(f"/users/delete/{member.id}", headers=owner_auth["headers"])    
    assert res.status_code == 204
    db.expire_all()
    deleted_user = db.get(User, user_id)
    assert deleted_user is None

def test_delete_admin_as_owner(owner_auth, admin, db):
    user_id = admin.id
    res = client.delete(f"/users/delete/{admin.id}", headers=owner_auth["headers"])
    
    assert res.status_code == 204
    db.expire_all()
    deleted_user = db.get(User, user_id)
    assert deleted_user is None

def test_delete_owner_as_owner(owner_auth, owner, db):
    res = client.delete(f"/users/delete/{owner.id}", headers=owner_auth["headers"])
    data = res.json()
    assert res.status_code == 403
    assert data["detail"] == "You can't delete owner"
    db.refresh(owner)
    assert db.get(User, owner.id) is not None

def test_delete_admin_as_admin(admin_auth, admin, db):
    res = client.delete(f"/users/delete/{admin.id}", headers=admin_auth["headers"])
    data = res.json()
    assert res.status_code == 403
    assert data["detail"] == "Admin can only delete members"
    db.refresh(admin)
    assert db.get(User, admin.id) is not None  

def test_delete_member_as_admin(admin_auth, member, db):
    user_id = member.id
    res = client.delete(f"/users/delete/{member.id}",headers=admin_auth["headers"])
    assert res.status_code == 204
    db.expire_all()
    deleted_user = db.get(User, user_id)
    assert deleted_user is None

def test_delete_member_as_member(member_auth, member, db):
    res = client.delete(f"/users/delete/{member.id}", headers=member_auth["headers"])
    data = res.json()
    assert res.status_code == 403
    assert data["detail"] == "You don't have access to this endpoint"
    db.refresh(member)
    assert db.get(User, member.id) is not None  
  
def test_delete_user_not_found(owner_auth):
    res = client.delete("/users/delete/9999", headers=owner_auth["headers"])
    data = res.json()
    assert res.status_code == 404
    assert data["detail"] == "User not found"

