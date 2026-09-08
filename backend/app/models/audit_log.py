from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime

from app.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)

    user_email = Column(String, nullable=False)

    action = Column(String, nullable=False)

    entity_type = Column(String, nullable=False)

    entity_id = Column(Integer, nullable=False)

    old_value = Column(String, nullable=True)

    new_value = Column(String, nullable=True)

    description = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )