from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.users import User, UserType
from app.schemas.company import CompanyResponseSchema
from app.models.company import Company
from app.core.security import require_role, get_current_user
from app.database.session import get_db

router = APIRouter(tags=["Company"], prefix="/companies")

@router.get("/me", response_model=CompanyResponseSchema)
def my_company(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id==user.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    return company