# /ai/app/main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv
from .routers import chat
from .auth import get_current_user

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Gargash AI Chat Service",
    docs_url="/ai/docs",
    openapi_url="/ai/openapi.json",
    redoc_url="/ai/redoc"
)

# Configure CORS
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/ai", tags=["chat"])

@app.get("/ai")
async def ai_root():
    return {"status": "AI Chat Service is running 🚀"}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5003))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)