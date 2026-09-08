from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.events import SecurityEvent
from app.models.alert import Alert
from app.auth.jwt_handler import get_current_user


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


def dashboard_access_required(
    current_user=Depends(get_current_user)
):
    """
    Dashboard is read-only, so all authenticated users
    (Admin, Analyst, Viewer) are allowed to view it.
    """
    return current_user


@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user=Depends(dashboard_access_required)
):
    total_events = db.query(SecurityEvent).count()

    total_alerts = db.query(Alert).count()

    open_alerts = db.query(Alert).filter(
        Alert.status == "Open"
    ).count()

    investigating_alerts = db.query(Alert).filter(
        Alert.status == "Investigating"
    ).count()

    resolved_alerts = db.query(Alert).filter(
        Alert.status == "Resolved"
    ).count()

    critical_events = db.query(SecurityEvent).filter(
        SecurityEvent.severity == "Critical"
    ).count()

    return {
        "total_events": total_events,
        "total_alerts": total_alerts,
        "open_alerts": open_alerts,
        "investigating_alerts": investigating_alerts,
        "resolved_alerts": resolved_alerts,
        "critical_events": critical_events
    }


@router.get("/severity")
def severity_statistics(
    db: Session = Depends(get_db),
    current_user=Depends(dashboard_access_required)
):
    low = db.query(SecurityEvent).filter(
        SecurityEvent.severity == "Low"
    ).count()

    medium = db.query(SecurityEvent).filter(
        SecurityEvent.severity == "Medium"
    ).count()

    high = db.query(SecurityEvent).filter(
        SecurityEvent.severity == "High"
    ).count()

    critical = db.query(SecurityEvent).filter(
        SecurityEvent.severity == "Critical"
    ).count()

    return {
        "Low": low,
        "Medium": medium,
        "High": high,
        "Critical": critical
    }


@router.get("/trends")
def dashboard_trends(
    days: int = Query(default=7, ge=1, le=90),
    db: Session = Depends(get_db),
    current_user=Depends(dashboard_access_required)
):
    today = datetime.utcnow().date()
    start_date = today - timedelta(days=days - 1)

    results = []

    for i in range(days):
        current_date = start_date + timedelta(days=i)

        start_datetime = datetime.combine(
            current_date,
            datetime.min.time()
        )

        end_datetime = start_datetime + timedelta(days=1)

        event_count = db.query(SecurityEvent).filter(
            SecurityEvent.timestamp >= start_datetime,
            SecurityEvent.timestamp < end_datetime
        ).count()

        critical_event_count = db.query(SecurityEvent).filter(
            SecurityEvent.timestamp >= start_datetime,
            SecurityEvent.timestamp < end_datetime,
            SecurityEvent.severity == "Critical"
        ).count()

        alert_count = db.query(Alert).filter(
            Alert.created_at >= start_datetime,
            Alert.created_at < end_datetime
        ).count()

        results.append({
            "date": current_date.isoformat(),
            "events": event_count,
            "alerts": alert_count,
            "critical_events": critical_event_count
        })

    return results


@router.get("/alert-trends")
def alert_trends(
    days: int = Query(default=7, ge=1, le=90),
    db: Session = Depends(get_db),
    current_user=Depends(dashboard_access_required)
):
    today = datetime.utcnow().date()
    start_date = today - timedelta(days=days - 1)

    results = []

    for i in range(days):
        current_date = start_date + timedelta(days=i)

        start_datetime = datetime.combine(
            current_date,
            datetime.min.time()
        )

        end_datetime = start_datetime + timedelta(days=1)

        open_alerts = db.query(Alert).filter(
            Alert.created_at >= start_datetime,
            Alert.created_at < end_datetime,
            Alert.status == "Open"
        ).count()

        investigating_alerts = db.query(Alert).filter(
            Alert.created_at >= start_datetime,
            Alert.created_at < end_datetime,
            Alert.status == "Investigating"
        ).count()

        resolved_alerts = db.query(Alert).filter(
            Alert.created_at >= start_datetime,
            Alert.created_at < end_datetime,
            Alert.status == "Resolved"
        ).count()

        results.append({
            "date": current_date.isoformat(),
            "open_alerts": open_alerts,
            "investigating_alerts": investigating_alerts,
            "resolved_alerts": resolved_alerts
        })

    return results