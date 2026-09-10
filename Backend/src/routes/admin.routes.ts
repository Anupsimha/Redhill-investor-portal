import { Router } from 'express';
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getInvestors,
  createInvestor,
  deleteInvestor,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  updateCctv,
  assignInvestor,
  updateAssignment,
  getAssignments,
  getLedger,
  addSubInvestment,
  getMilestones,
  getMilestonesWithInvestors,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  logDailyProgress,
  manualNotifyMilestone,
  getNotifications,
  createUpdate,
  uploadFile,
  getAnalytics,
  getPayments,
  addPayment
} from '../controllers/admin.controller.js';
import { authenticateToken, isAdmin } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

// Admin Management (Staff)
router.get('/admin/users', authenticateToken, isAdmin, getAdmins);
router.post('/admin/users', authenticateToken, isAdmin, createAdmin);
router.patch('/admin/users/:id', authenticateToken, isAdmin, updateAdmin);
router.delete('/admin/users/:id', authenticateToken, isAdmin, deleteAdmin);

// Analytics
router.get('/admin/analytics', authenticateToken, isAdmin, getAnalytics);

// Investor Management
router.get('/admin/investors', authenticateToken, isAdmin, getInvestors);
router.post('/admin/investors', authenticateToken, isAdmin, createInvestor);
router.delete('/admin/investors/:id', authenticateToken, isAdmin, deleteInvestor);

// Project Management
router.get('/admin/projects', authenticateToken, isAdmin, getProjects);
router.post('/admin/projects', authenticateToken, isAdmin, createProject);
router.put('/admin/projects/:id', authenticateToken, isAdmin, updateProject);
router.delete('/admin/projects/:id', authenticateToken, isAdmin, deleteProject);
router.patch('/admin/projects/:id/cctv', authenticateToken, isAdmin, updateCctv);

// Assignment & Financial Management
router.post('/admin/assign', authenticateToken, isAdmin, assignInvestor);
router.patch('/admin/investor-project/:userId/:projectId', authenticateToken, isAdmin, updateAssignment);
router.get('/admin/investor-projects', authenticateToken, isAdmin, getAssignments);
router.get('/admin/ledger', authenticateToken, isAdmin, getLedger);
router.post('/admin/ledger/sub-investment', authenticateToken, isAdmin, addSubInvestment);

// Milestones & Targeted Investor Progress
router.get('/admin/projects/:id/milestones', authenticateToken, isAdmin, getMilestones);
router.get('/admin/projects/:id/milestones-with-investors', authenticateToken, isAdmin, getMilestonesWithInvestors);
router.post('/admin/milestones', authenticateToken, isAdmin, createMilestone);
router.patch('/admin/milestones/:id', authenticateToken, isAdmin, updateMilestone);
router.delete('/admin/milestones/:id', authenticateToken, isAdmin, deleteMilestone);
router.post('/admin/milestones/:id/daily-progress', authenticateToken, isAdmin, logDailyProgress);
router.post('/admin/milestones/:id/notify', authenticateToken, isAdmin, manualNotifyMilestone);

// Automated Messages / Notification Logs
router.get('/admin/notifications', authenticateToken, isAdmin, getNotifications);

// Updates
router.post('/admin/updates', authenticateToken, isAdmin, createUpdate);

// Uploads
router.post('/admin/upload', authenticateToken, isAdmin, upload.single('file'), uploadFile);

// Payments
router.get('/admin/payments/:projectId/:userId', authenticateToken, isAdmin, getPayments);
router.post('/admin/payments', authenticateToken, isAdmin, addPayment);

export default router;
