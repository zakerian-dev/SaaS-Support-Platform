import pytest

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.database.base import Base
from app.models.company import Company
from app.models.users import User, UserType
from app.models.customer import Customer
from app.models.comments import Comment
from app.models.ticket import Ticket
from app.models.history import History
from app.database.session import get_db
from app.core.security import hash_password
from app.main import app

client = TestClient(app)

TEST_DATABASE_URL = "postgresql://postgres:890477398@localhost:5432/support_test"

test_engine = create_engine(TEST_DATABASE_URL)

TestSessionLocal = sessionmaker(bind=test_engine, autoflush=False, autocommit=False)

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def company(db):
    company = Company(name="test_company")
    db.add(company)
    db.commit()
    db.refresh(company)

    return company

@pytest.fixture
def member(db, company):
    member_user = User(name="test_user", password_hash=hash_password("string"), phone_number="01234567890", email="member@example.com", user_type=UserType.MEMBER, company_id=company.id)

    db.add(member_user)
    db.commit()
    db.refresh(member_user)

    return member_user

@pytest.fixture
def owner(db, company):
    owner = User(name="test_owner", password_hash=hash_password("string"), phone_number="01234567890", email="owner@example.com", user_type=UserType.OWNER, company_id=company.id)

    db.add(owner)
    db.commit()
    db.refresh(owner)

    return owner

@pytest.fixture
def customer(db, company):
    customer = Customer(name="test_customer", phone_number="01234567897", email="customer@example.com", company_id=company.id)
    db.add(customer)
    db.commit()
    db.refresh(customer)

    return customer 

@pytest.fixture
def ticket(db, customer, company):
    ticket = Ticket(subject="sub", description="desc", priority="low", customer_id=customer.id, company_id=company.id)
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return ticket

@pytest.fixture
def comment(ticket, admin_auth, db):
    comment = Comment(ticket_id=ticket.id, user_id=admin_auth["user"].id, content="content")
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return comment

@pytest.fixture
def admin(db, company):
    admin = User(name="test_admin", password_hash=hash_password("string"), phone_number="01234567890", email="admin@example.com", user_type=UserType.ADMIN, company_id=company.id)

    db.add(admin)
    db.commit()
    db.refresh(admin)

    return admin 

@pytest.fixture
def admin_auth(admin):
    response = client.post("/users/login",json={
        "email": admin.email,
        "password": "string"
    })
    token = response.json()["access_token"]
    return {
        "user": admin,
        "headers": {
            "Authorization": f"Bearer {token}"
        }
    }

@pytest.fixture
def owner_auth(owner):
    response = client.post("/users/login",json={
        "email": owner.email,
        "password": "string"
    })
    token = response.json()["access_token"]
    return {
        "user": owner,
        "headers": {
            "Authorization": f"Bearer {token}"
        }
    }

@pytest.fixture
def member_auth(member):
    response = client.post("/users/login",json={
        "email": member.email,
        "password": "string"
    })
    token = response.json()["access_token"]
    return {
        "user": member,
        "headers": {
            "Authorization": f"Bearer {token}"
        }
    }

@pytest.fixture
def history(ticket, member, db):
    history = History(ticket_id=ticket.id, new_value="new_value", old_value="old_value", field="field", action="updated", user_id=member.id)

    db.add(history)
    db.commit()
    db.refresh(history)

    return history