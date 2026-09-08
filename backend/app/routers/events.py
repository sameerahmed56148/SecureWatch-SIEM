from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.events import SecurityEvent
from app.models.alert import Alert
from app.schemas.events import SecurityEventCreate, SecurityEventResponse
from app.auth.permissions import analyst_required
from app.auth.jwt_handler import get_current_user


router = APIRouter(
    prefix="/events",
    tags=["Events"]
)


def events_read_required(
    current_user=Depends(get_current_user)
):
    """
    Events are read-only for Viewers.
    All authenticated users can view events.
    """
    return current_user


@router.post("/", response_model=SecurityEventResponse)
def create_event(
    event_data: SecurityEventCreate,
    db: Session = Depends(get_db),
    current_user=Depends(analyst_required)
):
    event = SecurityEvent(
        event_type=event_data.event_type,
        severity=event_data.severity,
        source_ip=event_data.source_ip,
        username=event_data.username,
        message=event_data.message
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    # Create an alert for High or Critical events
    if event.severity in ["High", "Critical"]:
        alert = Alert(
            event_id=event.id,
            title=f"High Severity Security Event: {event.event_type}",
            severity=event.severity,
            description=event.message,
            status="Open"
        )

        db.add(alert)
        db.commit()

    return event


@router.get("/", response_model=list[SecurityEventResponse])
def get_events(
    severity: str | None = Query(default=None),
    event_type: str | None = Query(default=None),
    username: str | None = Query(default=None),
    source_ip: str | None = Query(default=None),
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=Depends(events_read_required)
):
    query = db.query(SecurityEvent)

    if severity:
        query = query.filter(
            SecurityEvent.severity == severity
        )

    if event_type:
        query = query.filter(
            SecurityEvent.event_type == event_type
        )

    if username:
        query = query.filter(
            SecurityEvent.username == username
        )

    if source_ip:
        query = query.filter(
            SecurityEvent.source_ip == source_ip
        )

    # Case-insensitive search across multiple event fields
    if search:
        search_pattern = f"%{search}%"

        query = query.filter(
            SecurityEvent.event_type.ilike(search_pattern)
            | SecurityEvent.username.ilike(search_pattern)
            | SecurityEvent.source_ip.ilike(search_pattern)
            | SecurityEvent.message.ilike(search_pattern)
        )

    events = (
        query
        .order_by(SecurityEvent.timestamp.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return events


@router.get("/{event_id}", response_model=SecurityEventResponse)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(events_read_required)
):
    event = (
        db.query(SecurityEvent)
        .filter(SecurityEvent.id == event_id)
        .first()
    )

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Security event not found"
        )

    return event