from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True)

    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    event_type = Column(String, nullable=False)

    severity = Column(String, nullable=False)

    source_ip = Column(String, nullable=True)

    username = Column(String, nullable=True)

    message = Column(Text, nullable=False)

    alerts = relationship(
        "Alert",
        back_populates="event"
    )