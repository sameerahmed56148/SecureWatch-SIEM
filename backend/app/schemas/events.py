from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class EventSeverity(str, Enum):
    Low = "Low"
    Medium = "Medium"
    High = "High"
    Critical = "Critical"


class SecurityEventCreate(BaseModel):
    event_type: str
    severity: EventSeverity
    source_ip: str | None = None
    username: str | None = None
    message: str


class SecurityEventResponse(BaseModel):
    id: int
    timestamp: datetime
    event_type: str
    severity: EventSeverity
    source_ip: str | None
    username: str | None
    message: str

    class Config:
        from_attributes = True