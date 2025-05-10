# Gargash AI Hackathon - Chat Service

This is the AI chat service for the Gargash AI Hackathon project. It's built with FastAPI and Python, and integrates with OpenAI's API.

## Installation

1. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   OPENAI_KEY=your_openai_api_key
   AUTH_SERVICE_URL=http://localhost:5002/api/auth
   PORT=5003
   FRONTEND_URL=http://localhost:3000
   ```

   In production, replace `localhost` with your actual domain.

## Running the Service

### Development Mode
```bash
uvicorn app.main:app --reload --port 5003
```
The service will run on port 5003: http://localhost:5003

### Production Mode
The service can be run with Docker using the provided Dockerfile.

```bash
docker build -t gargash-ai-chat .
docker run -p 5003:5003 --env-file .env gargash-ai-chat
```

## API Endpoints

### Chat

- `POST /ai` - Send a message to the AI
  - Headers: `Authorization: Bearer {token}`
  - Body: `{ "message": "Your message here" }`
  - Returns: `{ "response": "AI response here" }`

## Authentication

The service verifies JWT tokens by communicating with the auth service. Each request to the chat API must include a valid JWT token obtained from the auth service.

## API Documentation

FastAPI automatically generates API documentation:
- Swagger UI: http://localhost:5003/docs
- ReDoc: http://localhost:5003/redoc