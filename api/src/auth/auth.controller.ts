// /api/src/auth/auth.controller.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../users/user.model';

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' as 'none' | 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Generate JWT
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set JWT as HttpOnly cookie
    res.cookie('token', token, cookieOptions);

    // Return user info (without password)
    res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set JWT as HttpOnly cookie
    res.cookie('token', token, cookieOptions);

    // Return user info (without password)
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = (req: Request, res: Response) => {
  // Clear the JWT cookie
  res.clearCookie('token', {
    ...cookieOptions,
    maxAge: 0,
  });
  
  res.status(200).json({ message: 'Logged out successfully' });
};

export const verifyToken = (req: Request, res: Response) => {
  // The user data is already attached to the request by the auth middleware
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  res.status(200).json({
    id: user._id,
    name: user.name,
    email: user.email,
  });
};