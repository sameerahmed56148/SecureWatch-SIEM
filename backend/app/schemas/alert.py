from enum import Enum
from pydantic import BaseModel
from datetime import datetime


class AlertStatus(str, Enum):
    Open = "Open"
    Investigating = "Investigating"
    Resolved = "Resolved"


class AlertStatusUpdate(BaseModel):
    status: AlertStatus


class AlertResponse(BaseModel):
    id: int
    event_id: int
    title: str
    severity: str
    description: str
    status: AlertStatus
    created_at: datetime

    class Config:
        from_attributes = True