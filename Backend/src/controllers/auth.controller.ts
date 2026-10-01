import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import config from '../config/env.js';

export const login = (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;
  
  const rawIdentifier = (email || '').trim();
  const cleanIdentifier = rawIdentifier.toLowerCase();
  const rawPassword = typeof password === 'string' ? password : '';

  if (!rawIdentifier || !rawPassword) {
    return res.status(400).json({ error: 'Please enter your email, Login ID, or phone number and password' });
  }

  // 1. Try matching by email or login_id (case-insensitive & trimmed)
  let user: any = db.prepare(
    'SELECT * FROM users WHERE LOWER(TRIM(email)) = ? OR LOWER(TRIM(login_id)) = ?'
  ).get(cleanIdentifier, cleanIdentifier);

  // 2. If not found, try matching by phone number digits (last 10 digits)
  if (!user) {
    const digits = rawIdentifier.replace(/\D/g, '');
    if (digits.length >= 10) {
      const last10 = digits.slice(-10);
      const allUsersWithPhone = db.prepare('SELECT * FROM users WHERE phone IS NOT NULL AND phone != ""').all() as any[];
      user = allUsersWithPhone.find(u => (u.phone || '').replace(/\D/g, '').slice(-10) === last10);
    }
  }

  if (!user || !bcrypt.compareSync(rawPassword, user.password)) {
    return res.status(401).json({ error: 'Invalid email/ID or password. Please try again.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN as any }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: config.IS_PROD,
    sameSite: config.IS_PROD ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone || '',
    login_id: user.login_id || '',
    token
  });
};

export const signup = (req: AuthRequest, res: Response) => {
  const { name, email, password, phone } = req.body;

  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPhone = (phone || '').trim();
  const rawPassword = typeof password === 'string' ? password : '';

  if (!cleanName || !cleanEmail || !rawPassword) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  if (rawPassword.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters long' });
  }

  const existingUser = db.prepare('SELECT * FROM users WHERE LOWER(TRIM(email)) = ?').get(cleanEmail);
  if (existingUser) {
    return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
  }

  const hashedPassword = bcrypt.hashSync(rawPassword, 10);
  const phoneDigits = cleanPhone.replace(/\D/g, '');
  const login_id = (
    cleanName.substring(0, 2).toLowerCase() + 
    (phoneDigits.slice(-3) || Math.floor(100 + Math.random() * 900)) + 
    Math.floor(10 + Math.random() * 90)
  );

  try {
    const result = db.prepare('INSERT INTO users (email, password, name, role, phone, login_id) VALUES (?, ?, ?, ?, ?, ?)').run(
      cleanEmail, hashedPassword, cleanName, 'investor', cleanPhone, login_id
    );

    const user = {
      id: Number(result.lastInsertRowid),
      email: cleanEmail,
      name: cleanName,
      role: 'investor',
      phone: cleanPhone,
      login_id: login_id
    };

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN as any }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: config.IS_PROD,
      sameSite: config.IS_PROD ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(201).json({ ...user, token });
  } catch (e: any) {
    console.error('Signup error:', e);
    res.status(400).json({ error: e.message || 'Failed to create account' });
  }
};

export const logout = (_req: AuthRequest, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.IS_PROD,
    sameSite: config.IS_PROD ? 'none' : 'lax',
  });
  res.json({ message: 'Logged out' });
};

export const getMe = (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const dbUser: any = db.prepare('SELECT id, email, name, role, phone, login_id FROM users WHERE id = ?').get(req.user.id);
  if (!dbUser) {
    return res.status(401).json({ error: 'User not found' });
  }
  res.json(dbUser);
};

