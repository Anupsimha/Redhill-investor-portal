import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  name: string;
}

export interface AuthRequest<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: AuthUser;
  cookies: any;
  file?: any;
  files?: any;
  body: ReqBody;
  params: P;
  query: ReqQuery;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;
  const token = req.cookies?.token || bearerToken;

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
