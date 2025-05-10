# AI Hackathon 2025 Iran Website

A bilingual (English/Persian) website for the AI Hackathon 2025 in Iran, featuring modern design, responsive layout, and user registration/team management capabilities.

![AI Hackathon 2025 Iran](./screenshots/hero-preview.png)

## Features

- **Bilingual Support**: Full English/Persian (Farsi) language switch with RTL/LTR layout change
- **User Authentication**: Registration, login, profile management
- **Team Management**: Create/join teams, manage team members, submit projects
- **Track Selection**: Choose from various challenge tracks
- **Responsive Design**: Mobile-first approach, works on all device sizes
- **Modern UI**: Glass-morphism design, animations, interactive components

## Tech Stack

### Frontend
- HTML5 + CSS3 + JavaScript
- Tailwind CSS for styling
- Particles.js for background animations
- ClipboardJS for copy-to-clipboard functionality

### Backend
- Node.js + Express.js
- MongoDB (with Mongoose ODM)
- JWT for authentication
- Multer for file uploads
- Nodemailer for email notifications

## Project Structure
ai-hackathon-iran/
├── backend/                 # Backend API
│   ├── middleware/          # Middleware functions
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── utils/               # Utility functions
│   ├── .env                 # Environment variables (create from .env.example)
│   ├── .env.example         # Example environment variables
│   └── server.js            # Main server file
└── frontend/                # Frontend static files
├── public/              # Static assets
├── src/                 # Source files
│   ├── components/      # UI components
│   ├── context/         # Context providers
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utility functions
│   └── styles/          # CSS styles
├── .env                 # Frontend environment variables
├── index.html           # Main HTML file
├── main.js              # Main JavaScript file
└── tailwind.config.js   # Tailwind configuration

## Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend

Install dependencies:
bashnpm install

Create a .env file based on .env.example:
bashcp .env.example .env

Update the .env file with your configuration:
PORT=5001
NODE_ENV=development
API_BASE_PATH=/api
MONGODB_URI=mongodb://localhost:27017/ai-hackathon-iran
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_EMAIL=your-email@example.com
SMTP_PASSWORD=your-password
FROM_NAME=AI Hackathon Iran
FROM_EMAIL=no-reply@hackathoniran.ir
CORS_ORIGINS=http://localhost:3000,https://hackathoniran.ir
DISCORD_INVITE_URL=discord.gg/hackathoniran
GITHUB_ORG_URL=github.com/hackathoniran

Start the backend server:
bashnpm run dev


Frontend Setup

Navigate to the frontend directory:
bashcd frontend

Install dependencies:
bashnpm install

Create a .env file:
bashtouch .env

Add the API URL to the .env file:
VITE_API_URL=http://localhost:5001/api

Start the frontend development server:
bashnpm run dev

Open your browser and go to:
http://localhost:3000


------------------------------
- **Frontend**: React application with TypeScript, Vite, and Tailwind CSS
- **Auth Service**: Express.js API with JWT authentication and MongoDB
- **Chat Service**: FastAPI service that integrates with OpenAI's API

```
/
├── frontend/            # React front-end application
├── auth-service/        # Authentication API (Express + TypeScript)
└── chat-service/        # AI chat API (FastAPI + Python)
```

## Installation and Setup

Each service has its own README with detailed setup instructions. Here's a quick overview:

### 1. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
The frontend will run on port 3000: http://localhost:3000

### 2. Auth Service

```bash
cd auth-service
npm install
cp .env.example .env  # Configure your MongoDB connection
npm run start:dev
```
The auth service will run on port 5002: http://localhost:5002

### 3. Chat Service

```bash
cd chat-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Add your OpenAI API key
uvicorn app.main:app --reload --port 5003
```
The chat service will run on port 5003: http://localhost:5003

## Features

- User registration and authentication with JWT
- Protected routes that require authentication
- Real-time chat with AI using OpenAI's API
- Clean, responsive UI built with Tailwind CSS

## Security

- Passwords are hashed using bcrypt
- Authentication uses JWT tokens stored in HttpOnly cookies
- All services implement CORS protection
- The chat service verifies authentication by communicating with the auth service

## Development

The project uses TypeScript for both the frontend and auth service to provide type safety. 
The chat service is built with Python and FastAPI for efficient AI integration.

## Deployment

Each service can be deployed independently. The frontend and services communicate through
environment variables, which should be updated for production environments.


Project Structure
/
├── frontend/                  # React frontend (Vite+React+TypeScript)
│   ├── .env.example           # Environment variables
│   ├── package.json           # Dependencies and scripts
│   ├── src/                   # Source code
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   └── vite.config.ts         # Vite configuration
│
├── api/                       # Authentication service (Express+TypeScript)
│   ├── .env.example           # Environment variables
│   ├── package.json           # Dependencies and scripts
│   └── src/                   # Source code with auth and user modules
│
└── ai/                        # AI Chat service (FastAPI+Python)
    ├── .env.example           # Environment variables
    ├── requirements.txt       # Python dependencies
    └── app/                   # FastAPI application
