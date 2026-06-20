import { EligibilityResult, Page, Scholarship } from '../types/api';
import { apiClient } from './apiClient';

export type ScholarshipFilters = {
  page?: number;
  size?: number;
  category?: string;
  country?: string;
  field?: string;
  deadline?: string;
};

export const scholarshipService = {
  async getScholarships(filters: ScholarshipFilters = {}): Promise<Page<Scholarship>> {
    try {
      const response = await apiClient.get<Page<Scholarship>>('/api/v1/scholarships', {
        params: { page: 0, size: 20, ...filters },
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      throw new Error(message);
    }
  },

  async getScholarship(id: number): Promise<Scholarship> {
    try {
      const response = await apiClient.get<Scholarship>(`/api/v1/scholarships/${id}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      throw new Error(message);
    }
  },

  async reportScholarship(id: number): Promise<any> {
    try {
      const response = await apiClient.post(`/api/v1/scholarships/${id}/report`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      throw new Error(message);
    }
  },

  async checkEligibility(id: number): Promise<EligibilityResult> {
    try {
      const response = await apiClient.get<EligibilityResult>(`/api/v1/scholarships/${id}/eligibility`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      throw new Error(message);
    }
  },
};
