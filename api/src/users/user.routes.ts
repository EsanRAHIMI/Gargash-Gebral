// /api/src/users/user.routes.ts
import { Router } from 'express';
import * as userController from './user.controller';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();

// All user routes are protected
router.use(authMiddleware);

// Get current user's profile
router.get('/me', userController.getCurrentUser);

export default router;