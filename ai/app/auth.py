# /ai/app/auth.py
import os
import httpx
from fastapi import Header, HTTPException, Depends, Cookie, Request
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Auth service URL
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:5002/api/auth")

async def get_current_user(
    request: Request,
    authorization: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """
    Verify JWT token with auth service and return user information.
    Token can be provided either via Authorization header or cookies.
    """
    token = None
    
    # Check Authorization header first
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
    
    # If no token in header, check cookies
    if not token:
        token = request.cookies.get("token")
    
    # If still no token, authentication fails
    if not token:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
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