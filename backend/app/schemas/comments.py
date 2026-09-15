from pydantic import BaseModel
from datetime import datetime
from typing import List


class CommentCreateSchema(BaseModel):
    content: str


class UserCommentSchema(BaseModel):
    id: int
    name: str
    user_type: str


class CommentResponseSchema(BaseModel):
    id: int
    content: str
    user_id: int
    ticket_id: int
    created_at: datetime
    updated_at: datetime | None
    user: UserCommentSchema

    model_config= {
        "from_attributes": True
    }


class CommentResponseAllSchema(BaseModel):
    comments: List[CommentResponseSchema]
    page: int
    total_page: int
    total_comments: int


class CommentUpdateSchema(CommentCreateSchema):
    content: str | None = None