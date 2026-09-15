from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func
import math
from fastapi import Response

from app.models.users import User, UserType
from app.models.company import Company
from app.database.session import get_db
from app.schemas.users import *
from app.core.security import hash_password, verify_password, create_access_token, get_current_user, require_role, require_admin_or_owner


router = APIRouter(tags=["Users"], prefix="/users")

@router.post("/register", response_model=RegisterResponseSchema, status_code=201)
def register(payload:RegisterSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email==payload.email).one_or_none()    
    if user:
        raise HTTPException(status_code=409, detail="Email is already taken")

    try:
        company_obj = Company(name=payload.company_name)
        db.add(company_obj)
        db.flush()

        user_obj = User(name=payload.name, email=payload.email, phone_number=payload.phone_number, company_id=company_obj.id,
                        user_type=UserType.OWNER, password_hash=hash_password(payload.password))
       
        db.add(user_obj)
        db.commit()
        db.refresh(user_obj)

        return user_obj
   
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Database error"
        )
    
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

@router.post("/login")
def login(payload: LoginSchema, response: Response, db: Session = Depends(get_db)):
    user_obj = db.query(User).filter_by(email=payload.email).one_or_none()
    if not user_obj:
        raise HTTPException(status_code=401, detail="Email or password is wrong")

    if not verify_password(password=payload.password, hashed_password=user_obj.password_hash):
        raise HTTPException(status_code=401, detail="Email or password is wrong")

    access_token = create_access_token(user_id=user_obj.id, user_type=user_obj.user_type.value)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/dashboard", response_model=LoginResponseSchema)
def me(user: User = Depends(get_current_user)):
    return user

@router.get("/users", response_model=PaginatedUsersResponse)
def retrieve_users(limit: int = Query(10, ge=1, le=15),
                   page: int = Query(1, ge=1),
                   search: str = Query(""),
                   user: User = Depends(require_role(UserType.OWNER, UserType.ADMIN)), 
                   db: Session = Depends(get_db)):
    offset = (page - 1) * limit
    total_users = db.query(func.count(User.id)).filter_by(company_id = user.company_id).scalar()
    total_page = math.ceil(total_users / limit)
    if page > total_page:
        raise HTTPException(status_code=404, detail="Page not found")

    if search != "":
        users = db.query(User).filter(User.company_id==user.company_id,User.name.ilike(f"%{search}%")).offset(offset).limit(limit).all()
        total_users = db.query(func.count(User.id)).filter(User.company_id == user.company_id, User.name == search).scalar()
    else:
        users = db.query(User).filter_by(company_id=user.company_id).offset(offset).limit(limit).all()

    return {
        "users": users,
        "page": page,
        "total_page": total_page,
        "total_users": total_users
    }

@router.delete("/delete/{user_id}", status_code=204)
def delete_user(user_id: int, 
                user: User = Depends(require_role(UserType.OWNER, UserType.ADMIN)), 
                db: Session = Depends(get_db)):

    user_obj = db.query(User).filter(User.id==user_id, User.company_id==user.company_id).one_or_none()
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")

    if user_obj.user_type == UserType.OWNER:
        raise HTTPException(status_code=403, detail="You can't delete owner")

    if user.user_type == UserType.ADMIN and user_obj.user_type == UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin can only delete members")

    db.delete(user_obj)
    db.commit()

    return

@router.post("/create_user", response_model=LoginResponseSchema, status_code=201)
def create_user(payload: CreateUserSchema, user: User = Depends(require_role(UserType.OWNER, UserType.ADMIN))
                , db: Session = Depends(get_db)):
    if user.user_type == UserType.ADMIN and payload.user_type != UserType.MEMBER:
        raise HTTPException(status_code=403, detail="You can't create a non member user")
    if user.user_type == UserType.OWNER and payload.user_type == UserType.OWNER:
        raise HTTPException(status_code=403, detail="You can't create another owner")
    existing_user = (
        db.query(User).filter(User.email == payload.email).one_or_none())

    if existing_user:
        raise HTTPException(status_code=409,detail="Email is already taken")
    
    try:
        user_obj = User(name=payload.name, email=payload.email, password_hash=hash_password(payload.password),
                            phone_number=payload.phone_number, user_type=payload.user_type, company_id=user.company_id)
        
        db.add(user_obj)
        db.commit()
        db.refresh(user_obj)
    
        return user_obj

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(500, "Database Error")

@router.patch("/{user_id}", response_model=LoginResponseSchema)
def update_user(user_id: int,
                payload: UpdateUserSchema, 
                user: User = Depends(require_role(UserType.ADMIN, UserType.OWNER)), 
                db: Session = Depends(get_db)):
    user_obj = db.query(User).filter_by(id=user_id, company_id=user.company_id).one_or_none()
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.email is not None and payload.email != user_obj.email:
        if db.query(User).filter(User.email==payload.email).one_or_none():
            raise HTTPException(status_code=409, detail="Email is already taken")

    if user_obj.user_type == UserType.OWNER:
        raise HTTPException(
            status_code=403,
            detail="You can't update owner"
        )

    if user.user_type == UserType.ADMIN and user_obj.user_type != UserType.MEMBER:
        raise HTTPException(status_code=403,detail="Admin can only update members")
    
    if payload.user_type is not None:
        if user.user_type == UserType.ADMIN and payload.user_type != UserType.MEMBER:
                raise HTTPException(status_code=403, detail="Admin can only assign member role")
        
        if user.user_type == UserType.OWNER and payload.user_type == UserType.OWNER:
            raise HTTPException(status_code=403,detail="You can't assign owner role")
    
    updates = payload.model_dump(exclude_unset=True)
    for  field, value in updates.items():
        if field == "password":
            user_obj.password_hash = hash_password(value)
        else:
            setattr(user_obj, field, value)

    try:
        db.commit()
        db.refresh(user_obj)

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Database error"
        )

    return user_obj
    
  