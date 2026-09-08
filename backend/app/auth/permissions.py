from fastapi import Depends, HTTPException
from app.auth.dependencies import get_current_user


def admin_required(current_user=Depends(get_current_user)):
    if current_user.role != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user


def analyst_required(current_user=Depends(get_current_user)):
    if current_user.role not in ["Admin", "Analyst"]:
        raise HTTPException(
            status_code=403,
            detail="Analyst access required"
        )

    return current_user