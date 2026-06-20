import { ApiResponse, JobListing, Page } from '../types/api';
import { apiClient } from './apiClient';

export const jobService = {
  async getJobs(page = 0): Promise<Page<JobListing>> {
    try {
      const response = await apiClient.get<Page<JobListing>>('/api/v1/jobs', {
        params: { page, size: 20 },
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      throw new Error(message);
    }
  },

  async getMatches(): Promise<any> {
    try {
      const response = await apiClient.get('/api/v1/jobs/matches');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      throw new Error(message);
    }
  },

  async applyToJob(id: number, coverLetter?: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>(`/api/v1/jobs/${id}/apply`, { coverLetter });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      throw new Error(message);
    }
  },

  async getMyApplications(): Promise<any> {
    try {
      const response = await apiClient.get('/api/v1/jobs/my-applications');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      throw new Error(message);
    }
  },

  async generateCv(): Promise<string> {
    try {
      const response = await apiClient.post<ApiResponse>('/api/v1/jobs/generate-cv');
      return response.data.message;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      throw new Error(message);
    }
  },

  async generateCoverLetter(id: number): Promise<string> {
    try {
      const response = await apiClient.post<ApiResponse>(`/api/v1/jobs/${id}/cover-letter`);
      return response.data.message;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      throw new Error(message);
    }
  },
};
