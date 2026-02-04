from pydantic import BaseModel
from typing import Optional, List
import datetime

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    role: str
    assistants: List['AssistantResponse'] = []

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


class AssistantBase(BaseModel):
    name: str
    temperature: float = 0.5
    top_k: int = 5
    chunk_size: int = 500
    chunk_overlap: int = 50

class AssistantCreate(AssistantBase):
    pass 

class AssistantResponse(AssistantBase):
    id: int
    file_name: str
    image_base64: Optional[str] = None 

    class Config:
        from_attributes = True

# Update forward references
UserOut.model_rebuild()