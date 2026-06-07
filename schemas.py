from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# User Schemas
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    status: Optional[str] = None
    avatar_url: Optional[str] = None

class User(UserBase):
    id: int
    status: str
    avatar_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class UserWithGoogleId(User):
    google_id: Optional[str]

# Message Schemas
class DirectMessageCreate(BaseModel):
    recipient_id: int
    content: str

class DirectMessage(BaseModel):
    id: int
    sender_id: int
    recipient_id: int
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class GroupMessageCreate(BaseModel):
    group_id: int
    content: str

class GroupMessage(BaseModel):
    id: int
    group_id: int
    sender_id: int
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

# Group Schemas
class GroupCreate(BaseModel):
    name: str
    description: Optional[str] = None

class GroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class Group(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_by: int
    created_at: datetime
    members: List[User] = []

    class Config:
        from_attributes = True

# Call Schemas
class CallCreate(BaseModel):
    max_participants: int = 30

class Call(BaseModel):
    id: int
    initiator_id: int
    started_at: datetime
    ended_at: Optional[datetime]
    max_participants: int
    is_active: bool
    participants: List[User] = []

    class Config:
        from_attributes = True

# Game Vote Schemas
class GameVoteCreate(BaseModel):
    game_name: str

class GameVote(BaseModel):
    id: int
    game_name: str
    user_id: int
    voted_at: datetime

    class Config:
        from_attributes = True

class GameVoteResult(BaseModel):
    game_name: str
    vote_count: int
