import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import config from '../config/env.js';
import { sendEmail, generatePasswordResetOtpHtml } from '../services/email.service.js';

const maskEmail = (email: string): string => {
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const [local, domain] = parts;
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  const visibleStart = local.slice(0, 2);
  const visibleEnd = local.slice(-1);
  return `${visibleStart}***${visibleEnd}@${domain}`;
};

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

export const forgotPassword = async (req: AuthRequest, res: Response) => {
  const { email } = req.body;
  const rawIdentifier = (email || '').trim();
  const cleanIdentifier = rawIdentifier.toLowerCase();

  if (!rawIdentifier) {
    return res.status(400).json({ error: 'Please enter your registered email, Login ID, or phone number' });
  }

  // 1. Try matching by email or login_id
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

  if (!user || !user.email) {
    return res.status(404).json({ error: 'No account found matching this identifier. Please verify and try again.' });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

  try {
    // Invalidate previous active OTPs for this email
    db.prepare('UPDATE password_resets SET used = 1 WHERE LOWER(TRIM(email)) = ? AND used = 0').run(user.email.toLowerCase().trim());

    // Save new OTP
    db.prepare('INSERT INTO password_resets (email, otp, expires_at, used) VALUES (?, ?, ?, 0)').run(
      user.email.toLowerCase().trim(),
      otp,
      expiresAt
    );

    // Send reset OTP email
    const htmlContent = generatePasswordResetOtpHtml({
      userName: user.name || 'Investor',
      otp,
      expiryMinutes: 10
    });

    const emailSent = await sendEmail({
      to: user.email,
      subject: `[Redhill Infra] Password Reset Verification Code: ${otp}`,
      html: htmlContent
    });

    if (!emailSent) {
      console.warn(`[Forgot Password] Email send returned false for ${user.email}`);
    }

    return res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${maskEmail(user.email)}.`,
      email: user.email,
      maskedEmail: maskEmail(user.email)
    });
  } catch (error: any) {
    console.error('Error generating password reset OTP:', error);
    return res.status(500).json({ error: 'Failed to generate password reset code. Please try again later.' });
  }
};

export const resetPassword = async (req: AuthRequest, res: Response) => {
  const { email, otp, newPassword } = req.body;

  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanOtp = (otp || '').trim();
  const rawPassword = typeof newPassword === 'string' ? newPassword : '';

  if (!cleanEmail || !cleanOtp || !rawPassword) {
    return res.status(400).json({ error: 'Email, OTP code, and new password are required' });
  }

  if (rawPassword.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters long' });
  }

  // Find latest active OTP record
  const resetRecord: any = db.prepare(`
    SELECT * FROM password_resets 
    WHERE LOWER(TRIM(email)) = ? AND otp = ? AND used = 0 
    ORDER BY id DESC LIMIT 1
  `).get(cleanEmail, cleanOtp);

  if (!resetRecord) {
    return res.status(400).json({ error: 'Invalid or already used verification code. Please request a new code.' });
  }

  const isExpired = new Date(resetRecord.expires_at).getTime() < Date.now();
  if (isExpired) {
    return res.status(400).json({ error: 'This verification code has expired. Please request a new code.' });
  }

  // Find user
  const user: any = db.prepare('SELECT * FROM users WHERE LOWER(TRIM(email)) = ?').get(cleanEmail);
  if (!user) {
    return res.status(404).json({ error: 'User account not found' });
  }

  // Hash new password and update user
  const hashedPassword = bcrypt.hashSync(rawPassword, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, user.id);

  // Mark reset code as used
  db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').run(resetRecord.id);

  // Automatically sign in the user
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

  return res.json({
    message: 'Password reset successful! Logging you in...',
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone || '',
    login_id: user.login_id || '',
    token
  });
};


