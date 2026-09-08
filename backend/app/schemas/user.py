from enum import Enum

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRole(str, Enum):
    Admin = "Admin"
    Analyst = "Analyst"
    Viewer = "Viewer"


class UpdateRole(BaseModel):
    role: UserRole


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: UserRole

    class Config:
        from_attributes = True