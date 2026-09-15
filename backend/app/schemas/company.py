from pydantic import BaseModel, ConfigDict, field_serializer
from datetime import datetime


class CompanyResponseSchema(BaseModel):
    id: int
    name: str
    created_at: datetime

    @field_serializer("created_at")
    def serialize(self, value: datetime):
        return value.strftime("%Y-%m-%d %H:%M:%S")

    model_config = ConfigDict(from_attributes=True)