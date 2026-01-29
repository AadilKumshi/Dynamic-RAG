import os

# workaround for OMP: Error #15: Initializing libomp.dylib, but found libomp.dylib already initialized.
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

from fastapi import FastAPI

from app.rag import chat
from app.routers import assistants, admin, authentication
from app.database import models
from app.database.database import engine
from fastapi.responses import RedirectResponse

app = FastAPI(title="RAG Tool Backend API", version="1.0.0")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(authentication.router)
app.include_router(admin.router)
app.include_router(assistants.router)
app.include_router(chat.router)


models.Base.metadata.create_all(bind=engine)

@app.get("/", include_in_schema=False)
def health_check():
    return {"status": "API is running"}


