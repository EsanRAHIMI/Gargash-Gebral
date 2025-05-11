# /ai/app/routers/chat.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import os
import openai
import io
import tempfile
from ..auth import get_current_user

# Initialize router
router = APIRouter()

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_KEY")

# Request models
class MessageItem(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[MessageItem]] = None

# Response model
class ChatResponse(BaseModel):
    response: str

@router.post("", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Send a message to the AI and get a response.
    """
    try:
        # Prepare conversation history
        messages = []
        
        # Add system message
        messages.append({
            "role": "system", 
            "content": "You are Gebral AI, a helpful intelligent assistant for automotive users. You provide concise, accurate, and friendly responses."
        })
        
        # Add conversation history if provided
        if request.history:
            for msg in request.history:
                messages.append({
                    "role": msg.role,
                    "content": msg.content
                })
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": request.message
        })
        
        # Call OpenAI Chat API with GPT-4o
        completion = openai.ChatCompletion.create(
            model="gpt-4o",  # Use GPT-4o model
            messages=messages,
            max_tokens=1000,
            temperature=0.7,
        )
        
        # Extract and return the response
        ai_response = completion.choices[0].message.content.strip()
        return ChatResponse(response=ai_response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error communicating with OpenAI: {str(e)}")

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...), user: Dict[str, Any] = Depends(get_current_user)):
    """
    Transcribe audio to text using OpenAI's Whisper model.
    """
    try:
        # Create a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
            # Write uploaded file content to the temp file
            temp_file.write(await file.read())
            temp_filename = temp_file.name
        
        # Transcribe using OpenAI Whisper API
        with open(temp_filename, "rb") as audio_file:
            transcript = openai.Audio.transcribe(
                model="whisper-1",
                file=audio_file
            )
        
        # Delete the temp file
        os.unlink(temp_filename)
        
        # Return the transcribed text
        return {"text": transcript.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error transcribing audio: {str(e)}")

@router.post("/synthesize")
async def synthesize_speech(request: dict, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Convert text to speech using OpenAI's TTS API.
    """
    try:
        text = request.get("text")
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")
        
        # Convert text to speech using OpenAI TTS API
        response = openai.Audio.create(
            model="tts-1",
            voice="shimmer",
            input=text
        )
        
        # Return streaming response with audio data
        return StreamingResponse(
            io.BytesIO(response.content), 
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=response.mp3"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating speech: {str(e)}")