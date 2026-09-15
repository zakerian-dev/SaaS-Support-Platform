from pydantic import BaseModel, field_serializer
from datetime import datetime
from typing import List

from app.models.ticket import Priority, Status


class TicketCreateSchema(BaseModel):
    subject: str
    description: str
    customer_id: int
    priority: Priority


class TicketResponseSchema(BaseModel):
    id: int
    subject: str
    description: str
    priority: Priority
    status: Status
    assigned_to: int | None
    customer_id: int
    company_id: int
    created_at: datetime
    updated_at: datetime | None

    @field_serializer("created_at", "updated_at")
    def serialize(self, value: datetime):
        return value.strftime("%Y-%m-%d - %H:%M:%S")

    model_config = {
        "from_attributes": True
    }


class TicketUpdateSchema(BaseModel):
    subject: str | None = None
    description: str | None = None
    status: Status | None = None
    priority: Priority | None = None
    assigned_to: int | None = None

class TicketListResponseSchema(BaseModel):
    tickets: List[TicketResponseSchema]
    page: int
    total_page: int
    total_tickets: int