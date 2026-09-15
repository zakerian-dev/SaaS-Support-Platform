from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher
from jose import jwt 
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException
from jose.exceptions import JWTError


from app.core.config import settings
from app.database.session import get_db
from app.models.users import User, UserType

password_hash = PasswordHash(hashers=[Argon2Hasher()])

security = HTTPBearer()


def hash_password(password: str) -> str:
    return password_hash.hash(password)

def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password,hash=hashed_password)

def create_access_token(user_id: int, user_type: str):

    payload = {
        "sub": str(user_id),
        "user_type": user_type,
    }

    expire = datetime.now(timezone.utc) + timedelta(hours=3)
    payload["exp"] = expire   
    
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

def get_current_user(credential: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credential.credentials
    try:
        decoded = jwt.decode(token=token, key=settings.SECRET_KEY, algorithms=["HS256"])
        user_id = decoded.get("sub", None)
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid Token")

        user = db.query(User).filter(User.id==int(user_id)).one_or_none()
        if not user:
            raise HTTPException(status_code=401, detail="Authorizaton failed, User not found!")

        return user
        
    except JWTError as e :
        raise HTTPException(status_code=401, detail=f"Authorizaton failed, {e}")

def require_admin_or_owner(credential: HTTPAuthorizationCredentials = Depends(security), user: User = Depends(get_current_user)):
    if user.user_type == UserType.MEMBER:
        raise HTTPException(403, "You do'nt have access to this endpoint")

    return user

def require_role(*allowed_roles: UserType):
    def checker(user: User = Depends(get_current_user)):
        if user.user_type not in allowed_roles:
            raise HTTPException (status_code=403, detail="You don't have access to this endpoint")
        return user
    return checker