from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func
import math

from app.database.session import get_db
from app.models.customer import Customer
from app.models.company import Company
from app.models.users import User, UserType
from app.core.security import require_role, get_current_user

from app.schemas.customer import *

router = APIRouter(tags=["Customer"], prefix="/customers")

@router.post("", response_model=CustomerResponseSchema, status_code=201)
def create_customer(payload: CustomerCreateSchema, user: User = Depends(get_current_user), db: Session = Depends(get_db)):

    customer = db.query(Customer).filter(Customer.email==payload.email, Customer.company_id==user.company_id).one_or_none()
    if customer:
        raise HTTPException(status_code=400, detail="Email is already taken")
    
    new_customer = Customer(name=payload.name, phone_number=payload.phone_number, email=payload.email, company_id=user.company_id)
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer

@router.get("", response_model=CustomerResponseAllSchema)
def retrieve_customers(limit: int = Query(10, ge=1, le=15),
                       page: int = Query(1, ge=1),
                       search: str = Query(""),
                       user: User = Depends(get_current_user),
                       db: Session = Depends(get_db)):
    
    offset = (page - 1) * limit    
    total_customers = db.query(func.count(Customer.id)).filter_by(company_id=user.company_id).scalar()
    total_page = math.ceil(total_customers / limit)

    if total_page == 0:
        total_page = 1

    if page > total_page:
        raise HTTPException(status_code=404, detail="Page not found")

    if search != "":
        customers = db.query(Customer).filter(Customer.company_id==user.company_id,Customer.name.ilike(f"%{search}%")).order_by(Customer.id.asc()).offset(offset).limit(limit).all()
        total_customers = db.query(func.count(Customer.id)).filter(Customer.company_id==user.company_id, Customer.name.ilike(f"%{search}%")).scalar()
        total_page = math.ceil(total_customers / limit)
    else:    
        customers = db.query(Customer).filter_by(company_id=user.company_id).order_by(Customer.id.asc()).offset(offset).limit(limit).all()

    return {
        "customers": customers,
        "page": page,
        "total_page": total_page,
        "total_customers": total_customers
    }

@router.delete("/{customer_id}", status_code=204)
def delete_customer(customer_id: int,
                    user: User = Depends(require_role(UserType.ADMIN, UserType.OWNER)),
                    db: Session = Depends(get_db)):
    customer = db.query(Customer).filter_by(id=customer_id, company_id=user.company_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    db.delete(customer)
    db.commit()

@router.patch("/{customer_id}", response_model=CustomerResponseSchema, status_code=200)
def update_customer(customer_id: int, payload: CustomerUpdateSchema,
                    user: User = Depends(require_role(UserType.ADMIN, UserType.OWNER)),
                    db: Session = Depends(get_db)):

    customer = db.query(Customer).filter_by(id=customer_id, company_id=user.company_id).one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if payload.email is not None:
        if db.query(Customer).filter(Customer.email==payload.email, Customer.id!=customer_id).one_or_none():
            raise HTTPException(status_code=409, detail="Email is already taken")

    updated = payload.model_dump(exclude_unset=True)
    for field, value in updated.items():
        setattr(customer, field, value)

    try:
        db.commit()
        db.refresh(customer)

    except SQLAlchemyError as e:
        db.rollback()
        print("DATABASE ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
    return customer

