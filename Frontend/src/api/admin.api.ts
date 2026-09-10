import { User, Project, Milestone, ProgressUpdate, Announcement, LedgerEntry, Role } from '../types';
import { apiClient } from './client';

export const adminApi = {
  // Staff & Admin Management
  getAdmins: async (): Promise<User[]> => {
    return apiClient.get('/api/admin/users');
  },

  createAdmin: async (data: { name: string; email: string; role: Role; password: string }): Promise<User> => {
    return apiClient.post('/api/admin/users', data);
  },

  updateAdmin: async (id: number, data: { name?: string; email?: string; role?: Role; password?: string }): Promise<{ message: string }> => {
    return apiClient.patch(`/api/admin/users/${id}`, data);
  },

  deleteAdmin: async (id: number): Promise<{ message: string }> => {
    return apiClient.delete(`/api/admin/users/${id}`);
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    return apiClient.get('/api/admin/projects');
  },

  createProject: async (data: Partial<Project>): Promise<Project> => {
    return apiClient.post('/api/admin/projects', data);
  },

  updateCctv: async (projectId: number, cctvUrl: string): Promise<void> => {
    await apiClient.patch(`/api/admin/projects/${projectId}/cctv`, { cctv_url: cctvUrl });
  },

  // Investors
  getInvestors: async (): Promise<User[]> => {
    return apiClient.get('/api/admin/investors');
  },

  createInvestor: async (data: { name: string; email: string; phone: string; password: string }): Promise<User> => {
    return apiClient.post('/api/admin/investors', data);
  },

  deleteInvestor: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/investors/${id}`);
  },

  // Assignments & Ledger
  getAssignments: async (): Promise<any[]> => {
    return apiClient.get('/api/admin/investor-projects');
  },

  assignInvestor: async (data: {
    userId: number;
    projectId: number;
    contribution: string;
    investmentAmount: number;
    allottedSqft: number;
    marketPricePerSqft: number;
    priceAtInvestment?: number;
    investmentDate?: string;
  }): Promise<void> => {
    await apiClient.post('/api/admin/assign', {
      user_id: data.userId,
      project_id: data.projectId,
      contribution: data.contribution,
      investment_amount: data.investmentAmount,
      allotted_sqft: data.allottedSqft,
      market_price_per_sqft: data.marketPricePerSqft,
      price_at_investment: data.priceAtInvestment || data.marketPricePerSqft,
      investment_date: data.investmentDate,
    });
  },

  getLedger: async (): Promise<LedgerEntry[]> => {
    return apiClient.get('/api/admin/ledger');
  },

  addSubInvestment: async (data: {
    userId: number;
    projectId: number;
    addCapital: number;
    addSqft: number;
    currentPrice: number;
    notes?: string;
    transactionDate: string;
  }): Promise<void> => {
    await apiClient.post('/api/admin/ledger/sub-investment', {
      user_id: data.userId,
      project_id: data.projectId,
      investment_amount: data.addCapital,
      allotted_sqft: data.addSqft,
      price_at_investment: data.currentPrice,
      market_price_per_sqft: data.currentPrice,
      note: data.notes,
      transaction_date: data.transactionDate,
    });
  },

  // Analytics
  getAnalytics: async (): Promise<{ totalFundsRaised: number; totalAllottedSqft: number; activeProjectsCount: number }> => {
    return apiClient.get('/api/admin/analytics');
  },

  // File Uploads
  uploadFile: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload('/api/admin/upload', formData);
  },
};
