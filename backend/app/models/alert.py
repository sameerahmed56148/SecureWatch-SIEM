from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)

    event_id = Column(
        Integer,
        ForeignKey("security_events.id"),
        nullable=False
    )

    title = Column(String, nullable=False)

    severity = Column(String, nullable=False)

    description = Column(Text, nullable=False)

    status = Column(String, default="Open", nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    event = relationship(
        "SecurityEvent",
        back_populates="alerts"
    )