import db from '../db.js';
import bcrypt from 'bcryptjs';

export const seedData = () => {
  // Helper to upsert staff/admin user
  const ensureUser = (email: string, passwordPlain: string, name: string, role: string, phone: string = '', login_id: string = '') => {
    const cleanEmail = email.trim().toLowerCase();
    let u: any = db.prepare('SELECT * FROM users WHERE LOWER(TRIM(email)) = ?').get(cleanEmail);
    if (!u) {
      const hashedPassword = bcrypt.hashSync(passwordPlain, 10);
      const res = db.prepare('INSERT INTO users (email, password, name, role, phone, login_id) VALUES (?, ?, ?, ?, ?, ?)').run(
        cleanEmail, hashedPassword, name, role, phone, login_id || null
      );
      u = { id: res.lastInsertRowid, email: cleanEmail, name, role, phone, login_id };
    }
    return u;
  };

  // Seed only Staff / Admin Accounts so projects and investors start clean for fresh uploads
  ensureUser('admin@redhillinfra.com', 'admin123', 'Super Admin', 'super_admin');
  ensureUser('admin@redhill.in', 'admin123', 'Super Admin', 'super_admin');
  ensureUser('sitemanager@redhillinfra.com', 'site123', 'Site Engineer', 'site_manager');
  ensureUser('finance@redhillinfra.com', 'finance123', 'Financial Officer', 'financial_officer');
  ensureUser('support@redhillinfra.com', 'support123', 'Support Agent', 'support_agent');

  console.log('Admin accounts verified. Projects and investor records kept clean for fresh uploads.');
};
