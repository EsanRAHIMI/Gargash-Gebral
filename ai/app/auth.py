# /ai/app/auth.py
import os
import httpx
from fastapi import Header, HTTPException, Depends
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Auth service URL
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:5002/api/auth")

async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    Verify JWT token with auth service and return user information.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    token = authorization.replace("Bearer ", "")
    
    # Call auth service to verify token
    async with httpx.AsyncClient() as client:
        headers = {"Cookie": f"token={token}"}
        try:
            response = await client.get(f"{AUTH_SERVICE_URL}/verify", headers=headers)
            
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid or expired token")
            
            return response.json()
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Auth service unavailable")