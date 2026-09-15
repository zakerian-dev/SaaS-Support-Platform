from pydantic import BaseModel, EmailStr, Field
from typing import List


class CustomerCreateSchema(BaseModel):
    name: str = Field(min_length=1)
    phone_number: str = Field(min_length=11)
    email: EmailStr

    model_config = {
        "from_attributes": True
    }


class CustomerResponseSchema(BaseModel):
    id: int
    name: str
    phone_number: str
    email: EmailStr 
    company_id: int

    model_config = {
        "from_attributes": True
    }


class CustomerResponseAllSchema(BaseModel):
    customers: List[CustomerResponseSchema]
    page: int
    total_page: int
    total_customers: int

    model_config = {
        "from_attributes": True
    }


class CustomerUpdateSchema(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    phone_number: str | None = None
    