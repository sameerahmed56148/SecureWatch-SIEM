from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.alert import Alert
from app.models.audit_log import AuditLog
from app.schemas.alert import AlertResponse, AlertStatusUpdate
from app.auth.permissions import analyst_required
from app.auth.jwt_handler import get_current_user


router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


def alerts_read_required(
    current_user=Depends(get_current_user)
):
    """
    Alerts are read-only for Viewers.
    All authenticated users can view alerts.
    """
    return current_user


@router.get("/", response_model=list[AlertResponse])
def get_alerts(
    status: str | None = Query(default=None),
    severity: str | None = Query(default=None),
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=Depends(alerts_read_required)
):
    query = db.query(Alert).join(Alert.event)

    # Case-insensitive status filter
    if status:
        query = query.filter(
            Alert.status.ilike(status)
        )

    # Case-insensitive severity filter
    if severity:
        query = query.filter(
            Alert.severity.ilike(severity)
        )

    # Case-insensitive search across alert and event fields
    if search:
        search_pattern = f"%{search}%"

        query = query.filter(
            Alert.title.ilike(search_pattern)
            | Alert.description.ilike(search_pattern)
            | Alert.event.event_type.ilike(search_pattern)
            | Alert.event.username.ilike(search_pattern)
            | Alert.event.source_ip.ilike(search_pattern)
            | Alert.event.message.ilike(search_pattern)
        )

    alerts = (
        query
        .order_by(Alert.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return alerts


@router.put("/{alert_id}/status", response_model=AlertResponse)
def update_alert_status(
    alert_id: int,
    status_data: AlertStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(analyst_required)
):
    alert = (
        db.query(Alert)
        .filter(Alert.id == alert_id)
        .first()
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    old_status = alert.status
    new_status = status_data.status.value

    alert.status = new_status

    audit_log = AuditLog(
        user_email=current_user.email,
        action="STATUS_CHANGE",
        entity_type="Alert",
        entity_id=alert.id,
        old_value=old_status,
        new_value=new_status,
        description=(
            f"Alert status changed from "
            f"{old_status} to {new_status}"
        )
    )

    db.add(audit_log)

    db.commit()
    db.refresh(alert)

    return alert