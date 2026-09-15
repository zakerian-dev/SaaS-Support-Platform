from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base


class History(Base):
    __tablename__ = "histories"

    id = Column(Integer, primary_key=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    user_id = Column(Integer,ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    field = Column(String, nullable=False)
    old_value = Column(String)
    new_value = Column(String)
    created_at = Column(DateTime, default=datetime.now)

    user = relationship("User", back_populates="histories")
    ticket = relationship("Ticket", back_populates="histories")