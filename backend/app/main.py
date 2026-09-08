from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

from app.models.user import User
from app.models.events import SecurityEvent
from app.models.alert import Alert
from app.models.audit_log import AuditLog

from app.routers import auth_router
from app.routers import user_router
from app.routers import events
from app.routers import alert
from app.routers import dashboard
from app.routers import audit_log


# Create database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(title="SecureWatch SIEM")


# Allow React frontend to communicate with FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include API routers
app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(events.router)
app.include_router(alert.router)
app.include_router(dashboard.router)
app.include_router(audit_log.router)


# Home endpoint
@app.get("/")
def home():
    return {
        "message": "SecureWatch SIEM Backend Running"
    }