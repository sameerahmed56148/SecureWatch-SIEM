from fastapi import FastAPI

from app.database import Base, engine
from app.routers import auth_router
from app.routers import user_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SecureWatch SIEM")

app.include_router(auth_router.router)
app.include_router(user_router.router)


@app.get("/")
def home():
    return {
        "message": "SecureWatch SIEM Backend Running"
    }