from fastapi import FastAPI

from app.rag import chat
from routers import assistants, admin, authentication
from app.database import models
from app.database.database import engine
from fastapi.responses import RedirectResponse

app = FastAPI(title="RAG Tool Backend API", version="1.0.0")

app.include_router(authentication.router)
app.include_router(admin.router)
app.include_router(assistants.router)
app.include_router(chat.router)


models.Base.metadata.create_all(bind=engine)

@app.get("/", include_in_schema=False)
def health_check():
    return {"status": "API is running"}


