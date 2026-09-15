from pydantic import BaseModel, EmailStr, model_validator, ConfigDict, field_serializer
from app.models.users import UserType
from datetime import datetime
from typing import Optional

class RegisterSchema(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirm_password: str
    phone_number: str
    company_name: str

    @model_validator(mode="after")
    def validating(self):
        if self.password != self.confirm_password:
            raise ValueError("Password does not match")

        if len(self.phone_number) != 11 or not self.phone_number.isdigit():
            raise ValueError("Phone number must be 11 digits and must contain numbers")
        
        return self


class RegisterResponseSchema(BaseModel):
    id: int
    name: str
    email: str
    phone_number: str
    user_type: UserType
    company_id: int

    model_config = ConfigDict(from_attributes=True)


class LoginSchema(BaseModel):
    email: EmailStr
    password: str


class LoginResponseSchema(BaseModel):
    id: int
    name: str
    email: str
    phone_number: str
    user_type: UserType
    company_id: int

    model_config = ConfigDict(from_attributes=True)


class CreateUserSchema(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone_number: str
    user_type: UserType


class RetrieveUsersSchema(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone_number: str
    user_type: UserType
    company_id: int
    created_at: datetime

    @field_serializer("created_at")
    def serialize(self, value: datetime):
        return value.strftime("%Y-%m-%d - %H:%M:%S")

    model_config = ConfigDict(from_attributes=True)


class UpdateUserSchema(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    phone_number: str | None = None
    user_type: UserType | None = None


class PaginatedUsersResponse(BaseModel):
    users: list[RetrieveUsersSchema]
    page: int
    total_page: int
    total_users: int

