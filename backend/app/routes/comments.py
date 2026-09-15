from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from math import ceil

from app.models.users import User, UserType
from app.schemas.comments import *
from app.models.comments import Comment
from app.models.ticket import Ticket, Status
from app.core.security import require_role, get_current_user
from app.database.session import get_db


router = APIRouter(tags=["Comment"])

@router.post("/tickets/{ticket_id}/comments", response_model=CommentResponseSchema, status_code=201)
def create_comment(ticket_id: int, payload: CommentCreateSchema, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id==ticket_id, Ticket.company_id==user.company_id, Ticket.deleted_at.is_(None)).one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    comment = Comment(content=payload.content, ticket_id=ticket_id, user_id=user.id, user=user)

    db.add(comment)
    db.commit()
    db.refresh(comment)

    return comment

@router.get("/tickets/{ticket_id}/comments", response_model=CommentResponseAllSchema)
def retrieve_comments(ticket_id: int,
                      limit: int = Query(10, ge=1, le=50),
                      page: int = Query(1, ge=1),
                      user: User = Depends(get_current_user),
                      db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id==ticket_id, Ticket.company_id==user.company_id, Ticket.deleted_at.is_(None)).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    offset = (page - 1) * limit
    total_comments = db.query(func.count(Comment.id)).filter(Comment.ticket_id==ticket_id, Comment.deleted_at.is_(None)).scalar()
    total_page = ceil(total_comments / limit)
    comments = (
        db.query(Comment)
        .options(joinedload(Comment.user))
        .filter(
            Comment.ticket_id == ticket_id,
            Comment.deleted_at.is_(None)
        )
        .order_by(Comment.created_at.asc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    if total_page == 0:
        total_page = 1

    if page > total_page:
        raise HTTPException(status_code=404, detail="Page not found")

    return {
        "comments": comments,
        "page": page,
        "total_page": total_page,
        "total_comments": total_comments,
    }

@router.patch("/tickets/{ticket_id}/comments/{comment_id}", response_model=CommentResponseSchema)
def update_comment(ticket_id: int,
                   comment_id: int,
                   payload: CommentUpdateSchema,
                   user: User = Depends(get_current_user),
                   db: Session = Depends(get_db)) :
    
    ticket = db.query(Ticket).filter(Ticket.id==ticket_id, Ticket.company_id==user.company_id, Ticket.deleted_at.is_(None)).one_or_none()
    if not ticket:
        raise HTTPException(status_code=404 , detail="Ticket not found")

    comment = db.query(Comment).filter(Comment.ticket_id==ticket_id, Comment.deleted_at.is_(None), Comment.id==comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != user.id:
        raise HTTPException(status_code=403, detail="You can't update a comment that is not yours")

    updates = payload.model_dump(exclude_unset=True)


    for field, value in updates.items():
        setattr(comment, field, value)

    db.commit()
    db.refresh(comment)

    return comment

@router.delete("/tickets/{ticket_id}/comments/{comment_id}", status_code=204)
def delete_comment(ticket_id: int,
                   comment_id: int,
                   user: User = Depends(get_current_user),
                   db: Session = Depends(get_db)) :
    
    ticket = db.query(Ticket).filter(Ticket.id==ticket_id, Ticket.company_id==user.company_id, Ticket.deleted_at.is_(None)).one_or_none()
    if not ticket:
        raise HTTPException(status_code=404 , detail="Ticket not found")

    comment = db.query(Comment).filter(Comment.ticket_id==ticket_id, Comment.deleted_at.is_(None), Comment.id==comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != user.id:
        raise HTTPException(status_code=403, detail="You can't delete a comment that is not yours")

    comment.deleted_at = datetime.now()

    db.commit()
