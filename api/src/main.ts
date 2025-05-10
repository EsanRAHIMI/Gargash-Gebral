// /api/src/main.ts
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './auth/auth.routes';
import userRoutes from './users/user.routes';
import codeRouter from './code';


// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 5002;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gargash-ai')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// Configure CORS
app.use(cors({
  origin: frontendUrl,
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/code', codeRouter);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api', (req, res) => {
  res.status(200).send('🟢 Auth service is running');
});


// Start the server
app.listen(port, () => {
  console.log(`🟢 Auth service running on port ${port}`);
  console.log(`→ Try: http://localhost:${port}/api`);
  console.log(`→ Health: http://localhost:${port}/api/health`);
});
  