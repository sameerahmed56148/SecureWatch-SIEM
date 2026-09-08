from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.audit_log import AuditLog
from app.auth.permissions import admin_required
from app.schemas.user import UpdateRole


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    current_user=Depends(admin_required)
):
    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
        for user in users
    ]


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role_data: UpdateRole,
    db: Session = Depends(get_db),
    current_user=Depends(admin_required)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Prevent an Admin from changing their own role
    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot change your own role"
        )

    old_role = user.role
    new_role = role_data.role.value

    user.role = new_role

    # Create audit log for the role change
    audit_log = AuditLog(
        user_email=current_user.email,
        action="ROLE_CHANGE",
        entity_type="User",
        entity_id=user.id,
        old_value=old_role,
        new_value=new_role,
        description=(
            f"User role changed from "
            f"{old_role} to {new_role}"
        )
    )

    db.add(audit_log)

    db.commit()
    db.refresh(user)

    return {
        "message": "User role updated successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role
        }
    }