# /ai/app/routers/chat.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks, Request
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
async def chat_with_ai(request: Request, chat_request: ChatRequest, user: Dict[str, Any] = Depends(get_current_user)):
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
        if chat_request.history:
            for msg in chat_request.history:
                messages.append({
                    "role": msg.role,
                    "content": msg.content
                })
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": chat_request.message
        })
        
        # Use try-except specifically for OpenAI API call
        try:
            # Call OpenAI Chat API (using the updated client syntax)
            response = openai.ChatCompletion.create(
                model="gpt-4",  # Or fallback to gpt-3.5-turbo if needed
                messages=messages,
                max_tokens=1000,
                temperature=0.7,
            )
            
            # Extract and return the response
            ai_response = response.choices[0].message.content.strip()
        except Exception as openai_error:
            print(f"OpenAI API error: {str(openai_error)}")
            # Fallback to a simpler call or default message
            ai_response = "I'm having trouble connecting to my knowledge base. Please try again in a moment."
        
        return ChatResponse(response=ai_response)
    except Exception as e:
        print(f"General error in chat_with_ai: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@router.post("/synthesize")
async def synthesize_speech(
    request: Request, 
    request_data: dict, 
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Convert text to speech using OpenAI's TTS API.
    """
    try:
        text = request_data.get("text")
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")
        
        # Determine OpenAI API version and use appropriate method
        openai_version = getattr(openai, "__version__", "0.0.0")
        print(f"Using OpenAI version: {openai_version}")
        
        try:
            # New API format for OpenAI >= 1.0.0
            if hasattr(openai, "audio") and hasattr(openai.audio, "speech"):
                print("Using new OpenAI API format")
                response = openai.audio.speech.create(
                    model="tts-1",
                    voice="shimmer",
                    input=text
                )
                audio_data = response.content
            # Legacy API format
            else:
                print("Using legacy OpenAI API format")
                response = openai.Audio.create(
                    model="tts-1",
                    voice="shimmer",
                    input=text
                )
                audio_data = response.content
                
            # For debugging, output data type and size
            print(f"Audio data type: {type(audio_data)}, size: {len(audio_data)} bytes")
            
            # Return streaming response with audio data and CORS headers
            return StreamingResponse(
                io.BytesIO(audio_data), 
                media_type="audio/mpeg",
                headers={
                    "Content-Disposition": "attachment; filename=response.mp3",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "POST, OPTIONS"
                }
            )
        except (AttributeError, TypeError) as api_error:
            print(f"OpenAI API structure error: {str(api_error)}")
            # Attempt direct OpenAI API call as last resort
            import requests
            
            headers = {
                "Authorization": f"Bearer {openai.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": "tts-1",
                "voice": "shimmer",
                "input": text
            }
            
            api_response = requests.post(
                "https://api.openai.com/v1/audio/speech",
                headers=headers,
                json=payload
            )
            
            if api_response.status_code == 200:
                audio_data = api_response.content
                return StreamingResponse(
                    io.BytesIO(audio_data),
                    media_type="audio/mpeg",
                    headers={"Content-Disposition": "attachment; filename=response.mp3"}
                )
            else:
                raise HTTPException(
                    status_code=api_response.status_code, 
                    detail=f"OpenAI API error: {api_response.text}"
                )
    except Exception as e:
        print(f"Speech synthesis error: {str(e)}")
        # Return a user-friendly error with more details
        error_message = f"Error generating speech: {str(e)}"
        raise HTTPException(status_code=500, detail=error_message)

@router.post("/transcribe")
async def transcribe_audio(
    request: Request, 
    file: UploadFile = File(...), 
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Transcribe audio to text using OpenAI's Whisper model.
    """
    try:
        # Create a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
            # Write uploaded file content to the temp file
            temp_file.write(await file.read())
            temp_filename = temp_file.name
        
        # Determine OpenAI API version and use appropriate method
        openai_version = getattr(openai, "__version__", "0.0.0")
        print(f"Using OpenAI version for transcription: {openai_version}")
        
        try:
            # Transcribe using OpenAI Whisper API - new API format
            if hasattr(openai, "audio") and hasattr(openai.audio, "transcriptions"):
                print("Using new OpenAI API format for transcription")
                with open(temp_filename, "rb") as audio_file:
                    transcript = openai.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file
                    )
                    transcribed_text = transcript.text
            # Legacy API format
            else:
                print("Using legacy OpenAI API format for transcription")
                with open(temp_filename, "rb") as audio_file:
                    transcript = openai.Audio.transcribe(
                        model="whisper-1",
                        file=audio_file
                    )
                    transcribed_text = transcript.text
        except (AttributeError, TypeError) as api_error:
            print(f"OpenAI API structure error for transcription: {str(api_error)}")
            # Attempt direct OpenAI API call as last resort
            import requests
            
            headers = {
                "Authorization": f"Bearer {openai.api_key}"
            }
            
            with open(temp_filename, "rb") as audio_file:
                files = {
                    "file": ("audio.webm", audio_file, "audio/webm"),
                    "model": (None, "whisper-1")
                }
                
                api_response = requests.post(
                    "https://api.openai.com/v1/audio/transcriptions",
                    headers=headers,
                    files=files
                )
                
                if api_response.status_code == 200:
                    transcribed_text = api_response.json().get("text", "")
                else:
                    raise HTTPException(
                        status_code=api_response.status_code, 
                        detail=f"OpenAI API error: {api_response.text}"
                    )
        
        # Delete the temp file
        os.unlink(temp_filename)
        
        # Return the transcribed text
        print(f"Transcribed text: {transcribed_text}")
        return {"text": transcribed_text}
    except Exception as e:
        print(f"Transcription error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error transcribing audio: {str(e)}")
