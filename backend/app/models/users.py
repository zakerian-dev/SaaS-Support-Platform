from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Enum as sqlEnum
from enum import Enum
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.base import Base


class UserType(Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    user_type = Column(sqlEnum(UserType , values_callable=lambda enum: [item.value for item in enum]), nullable=False, default=UserType.OWNER)
    created_at = Column(DateTime, default=datetime.now)
    company_id = Column(Integer, ForeignKey("company.id"), nullable=False)
    company = relationship("Company", back_populates="users")
    assigned_tickets = relationship("Ticket", foreign_keys="Ticket.assigned_to", back_populates="assigned_user")
    created_tickets = relationship("Ticket", foreign_keys="Ticket.created_by_user_id", back_populates="created_user")
    comments = relationship("Comment", back_populates="user")
    histories = relationship("History", back_populates="user")