import { Project, Milestone, ProgressUpdate, Announcement, Query } from '../types';
import { apiClient } from './client';

export const investorApi = {
  getProjects: async (): Promise<Project[]> => {
    return apiClient.get('/api/investor/projects');
  },

  getProjectDetail: async (id: number | string): Promise<{
    project: Project;
    milestones: Milestone[];
    updates: ProgressUpdate[];
    announcements: Announcement[];
  }> => {
    return apiClient.get(`/api/investor/projects/${id}`);
  },

  getQueries: async (projectId: number | string): Promise<Query[]> => {
    return apiClient.get(`/api/investor/queries/${projectId}`);
  },

  sendQuery: async (data: { project_id: number; message: string; user_id?: number }): Promise<Query> => {
    return apiClient.post('/api/queries', data);
  },
};
