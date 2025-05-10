// /api/src/auth/auth.routes.ts
import { Router } from 'express';
import * as authController from './auth.controller';
import { authMiddleware } from './auth.middleware';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected route to verify token
router.get('/verify', authMiddleware, authController.verifyToken);

export default router;