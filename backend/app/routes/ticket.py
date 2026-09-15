from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from math import ceil
from enum import Enum
from typing import Optional

from app.models.ticket import Ticket
from app.models.customer import Customer
from app.models.users import User, UserType
from app.models.history import History
from app.database.session import get_db
from app.core.security import get_current_user, require_role
from app.schemas.ticket import *

STATUS_TRANSITIONS = {Status.OPEN: [Status.IN_PROGRESS], Status.IN_PROGRESS: [Status.RESOLVED], Status.RESOLVED: [Status.CLOSED], Status.CLOSED: [Status.OPEN]}

router = APIRouter(tags=["Ticket"], prefix="/tickets")

@router.post("", response_model=TicketResponseSchema, status_code=201)
def create_ticket(payload: TicketCreateSchema,
                  user: User = Depends(get_current_user),
                  db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id==payload.customer_id, Customer.company_id==user.company_id).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    ticket = Ticket(subject=payload.subject, description=payload.description,
                    priority=payload.priority, created_by_user_id=user.id,
                    customer_id=payload.customer_id, company_id=user.company_id)

    db.add(ticket)
    db.flush()

    history = History(action="Ticket created",created_at=datetime.now(),user_id=user.id, ticket_id=ticket.id, field="Ticket created")

    
    db.add(history)
    db.commit()
    db.refresh(ticket)
    
    return ticket

@router.get("", response_model=TicketListResponseSchema)
def retrieve_tickets(
    limit: int = Query(12, ge=1, le=100),
    page: int = Query(1, ge=1),
    status: Optional[List[Status]] = Query(None),
    priority: Optional[List[Priority]] = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    offset = (page - 1) * limit

    base_query = db.query(Ticket).filter(
        Ticket.company_id == user.company_id,
        Ticket.deleted_at.is_(None),
    )

    # فقط اگه کاربر واقعا چیزی انتخاب کرده باشه فیلتر اعمال میشه
    if status:
        base_query = base_query.filter(Ticket.status.in_(status))

    if priority:
        base_query = base_query.filter(Ticket.priority.in_(priority))

    total_tickets = base_query.count()
    total_page = ceil(total_tickets / limit) if total_tickets else 1

    if page > total_page:
        raise HTTPException(status_code=404, detail="Page not found")

    if search is not None: 
        tickets = (
                base_query.filter(Ticket.subject.ilike(f"%{search}%")).order_by(Ticket.id.asc())
                .offset(offset)
                .limit(limit)
                .all()
            )
    else: 
        tickets = (
            base_query.order_by(Ticket.id.asc())
            .offset(offset)
            .limit(limit)
            .all()
        )



    return {
        "tickets": tickets,
        "page": page,
        "total_page": total_page,
        "total_tickets": total_tickets,
    }

@router.get("/{ticket_id}", response_model=TicketResponseSchema)
def retrieve_ticket(ticket_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id==ticket_id, Ticket.company_id==user.company_id, Ticket.deleted_at.is_(None)).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    return ticket

@router.patch("/{ticket_id}", response_model=TicketResponseSchema)
def update_ticket(ticket_id: int, payload: TicketUpdateSchema, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id==ticket_id, Ticket.company_id==user.company_id, Ticket.deleted_at.is_(None)).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    updates = payload.model_dump(exclude_unset=True)

    if "assigned_to" in updates and updates["assigned_to"] is not None:
        if user.user_type == UserType.MEMBER:
            raise HTTPException(status_code=403, detail="You don't have permission to assign tickets")
        
        assigned_to_user = db.query(User).filter_by(id=updates["assigned_to"], company_id=user.company_id).first()

        if not assigned_to_user:
            raise HTTPException(status_code=404, detail="No such user for assigning to!")
    
    if "status" in updates and updates["status"] != ticket.status:
        old_status = ticket.status
        new_status = updates["status"]
        allowed_status=STATUS_TRANSITIONS[old_status]
        if new_status not in allowed_status:
            raise HTTPException(status_code=422, detail=f"Invalid status transition from {old_status.value} to {new_status.value}")
    try:
        for field, value in updates.items():
            old_value = getattr(ticket, field)

            if isinstance(old_value, Enum):
                old_value = old_value.value
            elif old_value is not None:
                old_value = str(old_value)

            new_value = value

            if isinstance(new_value, Enum):
                new_value = new_value.value
            elif new_value is not None:
                new_value = str(new_value)

            if old_value == new_value:
                continue

            history = History(
                old_value=old_value,
                new_value=new_value,
                user_id=user.id,
                ticket_id=ticket.id,
                field=field,
                created_at=datetime.now(),
                action="updated"
            )

            db.add(history)

        for field, value in updates.items():
            setattr(ticket, field, value)

        db.commit()
        db.refresh(ticket)

        return ticket

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Database Error"
        )
    
@router.delete("/{ticket_id}", status_code=204)
def delete_ticket(ticket_id: int, user: User = Depends(require_role(UserType.ADMIN, UserType.OWNER)),
                  db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id==ticket_id, Ticket.company_id==user.company_id, Ticket.deleted_at.is_(None)).one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")   

    ticket.deleted_at = datetime.now()
    db.commit()

