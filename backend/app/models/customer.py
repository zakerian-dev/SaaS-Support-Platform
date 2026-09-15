from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from app.database.base import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    company_id = Column(Integer, ForeignKey("company.id"), nullable=False)
    email = Column(String, nullable=False)
    company = relationship("Company", back_populates="customers")
    tickets = relationship("Ticket", back_populates="customer")

    