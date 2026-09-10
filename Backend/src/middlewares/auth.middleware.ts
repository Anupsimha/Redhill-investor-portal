import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    name: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, config.JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const adminRoles = ['admin', 'super_admin', 'senior_admin', 'site_manager', 'financial_officer', 'marketing_manager', 'support_agent'];
  if (!req.user || !adminRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
