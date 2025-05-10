// /api/src/users/user.controller.ts
import { Request, Response } from 'express';

export const getCurrentUser = (req: Request, res: Response) => {
  // The user is already attached to the request by the auth middleware
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