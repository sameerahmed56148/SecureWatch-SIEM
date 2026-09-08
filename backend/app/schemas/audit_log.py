from datetime import datetime

from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    id: int
    user_email: str
    action: str
    entity_type: str
    entity_id: int
    old_value: str | None
    new_value: str | None
    description: str | None
    created_at: datetime

    class Config:
        from_attributes = True