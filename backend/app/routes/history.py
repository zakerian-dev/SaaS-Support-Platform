from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from math import ceil

from app.models.users import User, UserType
from app.schemas.history import *
from app.models.history import History
from app.models.ticket import Ticket, Status
from app.core.security import require_role, get_current_user
from app.database.session import get_db

router = APIRouter(tags=["History"], prefix="/tickets")

@router.get("/{ticket_id}/history", response_model=HistoryResponseAllSchema)
def retrieve_history(ticket_id: int, limit: int = Query(5, ge=1, le=50), page: int = Query(1, ge=1),
                     user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id==ticket_id, Ticket.company_id==user.company_id, Ticket.deleted_at.is_(None)).one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    offset = (page - 1) * limit
    total_history = db.query(func.count(History.id)).filter(History.ticket_id==ticket_id).scalar()
    total_page = ceil(total_history / limit)
    history = db.query(History).options(joinedload(History.user)).filter(History.ticket_id==ticket_id).order_by(History.created_at).limit(limit).offset(offset).all()

    if total_page == 0:
        total_page = 1

    if page > total_page:
        raise HTTPException(status_code=404, detail="Page not found")

    

    return {
        "history": history,
        "page": page,
        "total_page": total_page,
        "total_history": total_history

    }

    