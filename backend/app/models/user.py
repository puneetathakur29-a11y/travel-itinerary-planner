from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


class UserProfile(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Collaborator(BaseModel):
    id: str
    trip_id: str
    email: str
    role: str = "editor"  # "viewer" or "editor"
    status: str = "accepted"  # "pending", "accepted"
    invited_at: datetime = Field(default_factory=datetime.utcnow)


class ShareInviteRequest(BaseModel):
    email: EmailStr
    role: str = "editor"
