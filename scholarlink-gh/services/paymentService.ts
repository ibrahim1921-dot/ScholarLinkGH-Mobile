import { apiClient } from './apiClient';

export interface InitializePaymentResponse {
  authorizationUrl: string;
  reference: string;
}

export interface PaymentStatusResponse {
  reference: string;
  status: string;
  type: string;
  amountPesewas: number;
  creditsGranted?: number;
}

export interface PaymentTransaction {
  id: number;
  reference: string;
  amountPesewas: number;
  type: string;
  status: string;
  createdAt: string;
}

export const paymentService = {
  async initializeAiCreditPurchase(callbackUrl?: string): Promise<InitializePaymentResponse> {
    try {
      const response = await apiClient.post<InitializePaymentResponse>('/api/v1/payments/ai-credits/initialize', { callbackUrl });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to initialize payment';
      throw new Error(message);
    }
  },

  async initializeAssistedApplicationFee(listingType: string, listingId: number, callbackUrl?: string): Promise<InitializePaymentResponse> {
    try {
      const response = await apiClient.post<InitializePaymentResponse>('/api/v1/payments/assisted-application/initialize', {
        listingType,
        listingId,
        callbackUrl,
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to initialize payment';
      throw new Error(message);
    }
  },

  async getPaymentStatus(reference: string): Promise<PaymentStatusResponse> {
    try {
      const response = await apiClient.get<PaymentStatusResponse>(`/api/v1/payments/${reference}/status`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to get payment status';
      throw new Error(message);
    }
  },

  async getMyTransactions(): Promise<PaymentTransaction[]> {
    try {
      const response = await apiClient.get<any>('/api/v1/payments/my-transactions');
      return response.data.content || [];
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch transactions';
      throw new Error(message);
    }
  },
};
