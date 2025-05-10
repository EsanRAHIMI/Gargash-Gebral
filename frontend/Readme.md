# Gargash AI Hackathon - Frontend

This is the frontend application for the Gargash AI Hackathon project. It's built with React, TypeScript, and Vite.

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```
   VITE_BACKEND_URL=http://localhost:5002/api
   VITE_CHAT_URL=http://localhost:5003/ai
   VITE_AUTH_URL=http://localhost:5002/api/auth
   ```

   In production, replace `localhost` with your actual domain.

## Running the Application

### Development Mode
```bash
npm run dev
```
The application will run on port 3000: http://localhost:3000

### Production Build
```bash
npm run build
npm run preview
```

## Features

- Home page with login/register options
- Protected Dashboard page
- Protected Chat page to interact with AI
- Authentication with JWT stored in HttpOnly cookies

## Folder Structure

- `src/main.tsx` - Entry point
- `src/App.tsx` - Main component with router setup
- `src/pages/` - Page components (Home, Dashboard, Chat)
- `src/components/` - Reusable UI components
- `src/hooks/` - Custom hooks (useAuth, useChat)
- `src/styles/` - CSS and Tailwind configuration

## Authentication

Authentication is managed through the `useAuth` hook, which communicates with the auth service. JWT tokens are stored in HttpOnly cookies for security.