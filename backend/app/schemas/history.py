from pydantic import BaseModel, field_serializer, ConfigDict
from datetime import datetime
from typing import List

class HistoryUserSchema(BaseModel):
    id: int
    name: str  

    model_config = ConfigDict(from_attributes=True)

class HistoryResponseSchema(BaseModel):
    user: HistoryUserSchema
    id: int
    ticket_id: int
    user_id: int
    action: str
    field: str
    old_value: str | None = None
    new_value: str | None = None
    created_at: datetime

    @field_serializer("created_at")
    def serialize(self, value: datetime):
        return value.strftime("%Y-%m-%d %H:%M:%S")

    model_config = ConfigDict(from_attributes=True)

class HistoryResponseAllSchema(BaseModel):
    history: List[HistoryResponseSchema]
    page: int
    total_page: int
    total_history: int