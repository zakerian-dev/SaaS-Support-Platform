from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Enum as sqlEnum
from enum import Enum
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.base import Base


class Status(Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class Priority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True)
    subject = Column(String, nullable=False)
    description = Column(String, nullable=False)
    status = Column(sqlEnum(Status, values_callable = lambda enum: [item.value for item in enum]), default=Status.OPEN, nullable=False)
    priority = Column(sqlEnum(Priority, values_callable = lambda enum: [item.value for item in enum]), default=Priority.LOW, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"))
    created_by_user_id = Column(Integer, ForeignKey("users.id"))
    company_id = Column(Integer, ForeignKey("company.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    deleted_at = Column(DateTime, nullable=True)
    customer = relationship("Customer", back_populates="tickets")
    company = relationship("Company", back_populates="tickets")
    assigned_user = relationship("User", foreign_keys=[assigned_to], back_populates="assigned_tickets")
    created_user = relationship("User", foreign_keys=[created_by_user_id], back_populates="created_tickets")
    comments = relationship("Comment", back_populates="ticket")
    histories = relationship("History", back_populates="ticket")
