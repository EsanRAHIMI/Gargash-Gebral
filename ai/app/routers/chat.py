# /ai/app/routers/chat.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import os
import openai
from typing import Dict, Any
from ..auth import get_current_user

# Initialize router
router = APIRouter()

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_KEY")

# Request model
class ChatRequest(BaseModel):
    message: str

# Response model
class ChatResponse(BaseModel):
    response: str

@router.post("", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Send a message to the AI and get a response.
    """
    try:
        # Call OpenAI API
        completion = openai.Completion.create(
            engine="text-davinci-003",  # or any other appropriate engine
            prompt=request.message,
            max_tokens=1000,
            temperature=0.7,
        )
        
        # Extract and return the response
        ai_response = completion.choices[0].text.strip()
        return ChatResponse(response=ai_response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error communicating with OpenAI: {str(e)}")