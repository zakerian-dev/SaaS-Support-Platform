from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.base import Base

class Company(Base):
    __tablename__ = "company"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    users = relationship("User", back_populates="company")
    customers = relationship("Customer", back_populates="company")
    tickets = relationship("Ticket", back_populates="company")