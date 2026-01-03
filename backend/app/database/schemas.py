from pydantic import BaseModel
from typing import Optional
import datetime

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    role: str

    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: int
    query_usage: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True 

class Token(BaseModel):
    access_token: str
    token_type: str