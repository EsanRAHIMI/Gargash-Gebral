# Gargash AI Hackathon - Auth Service

This is the authentication service for the Gargash AI Hackathon project. It's built with Express and TypeScript.

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```
   MONGO_URI=mongodb://localhost:27017/gargash-ai
   JWT_SECRET=your_jwt_secret_key
   PORT=5002
   FRONTEND_URL=http://localhost:3000
   ```

   In production, replace `localhost` with your actual domain and use a strong, random JWT secret.

## Running the Service

### Development Mode
```bash
npm run start:dev
```
The service will run on port 5002: http://localhost:5002

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  - Body: `{ "name": "User Name", "email": "user@example.com", "password": "password" }`
  - Returns: User data and sets JWT in HttpOnly cookie

- `POST /api/auth/login` - Login with email and password
  - Body: `{ "email": "user@example.com", "password": "password" }`
  - Returns: User data and sets JWT in HttpOnly cookie

- `POST /api/auth/logout` - Logout (clears the JWT cookie)

- `GET /api/auth/verify` - Verify JWT token (protected route)
  - Returns: User data if authenticated

### User

- `GET /api/user/me` - Get current user profile (protected route)
  - Returns: User data if authenticated

## Security

- Passwords are hashed using bcrypt
- Authentication uses JWT tokens stored in HttpOnly cookies
- CORS is configured to only allow requests from the frontend URL