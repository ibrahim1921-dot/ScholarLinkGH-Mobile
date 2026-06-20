import { ApiResponse, ProfilePayload, StudentProfile } from '../types/api';
import { apiClient } from './apiClient';

export const profileService = {
  async getProfile(): Promise<StudentProfile> {
    try {
      const response = await apiClient.get<StudentProfile>('/api/v1/profile');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      throw new Error(message);
    }
  },

  async updateProfile(payload: ProfilePayload): Promise<ApiResponse> {
    try {
      const response = await apiClient.put<ApiResponse>('/api/v1/profile', payload);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      throw new Error(message);
    }
  },

  async registerFcmToken(token: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/api/v1/profile/fcm-token', { token });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      throw new Error(message);
    }
  },
};
