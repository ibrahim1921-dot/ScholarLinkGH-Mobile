import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { InitializePaymentResponse, paymentService } from '../services/paymentService';
import { PaymentResultModal, PaymentResultType } from '../components/PaymentResultModal';

WebBrowser.maybeCompleteAuthSession();

export type PaymentResult = 'SUCCESS' | 'FAILED' | 'TIMEOUT';

export function usePayment() {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [resultType, setResultType] = useState<PaymentResultType>(null);
  const [lastInitializeFn, setLastInitializeFn] = useState<((callbackUrl: string) => Promise<InitializePaymentResponse>) | null>(null);
  const [lastPaymentType, setLastPaymentType] = useState<'CREDITS' | 'FEE'>('CREDITS');

  const processPayment = async (
    initializeFn: (callbackUrl: string) => Promise<InitializePaymentResponse>,
    paymentType: 'CREDITS' | 'FEE' = 'CREDITS'
  ): Promise<PaymentResult> => {
    setLastInitializeFn(() => initializeFn);
    setLastPaymentType(paymentType);
    setPaymentLoading(true);
    let finalResult: PaymentResult = 'FAILED';
    try {
      // Ensure redirect URL is set up correctly (e.g. scholarlink-gh://payment-callback)
      const returnUrl = makeRedirectUri({
        scheme: 'scholarlink-gh',
        path: 'payment-callback'
      });

      // 1. Initialize payment to get authorization URL and reference
      const { authorizationUrl, reference } = await initializeFn(returnUrl);

      // 2. Open Paystack hosted checkout in in-app browser
      const result = await WebBrowser.openAuthSessionAsync(authorizationUrl, returnUrl);
      
      // Even if user closed the browser (type === 'cancel'), we should still check the status 
      // just in case the payment went through right before they closed it.

      // 3. Poll for status
      finalResult = await pollPaymentStatus(reference);

    } catch (error) {
      console.error('Payment process error:', error);
      finalResult = 'FAILED';
    } finally {
      setPaymentLoading(false);
      if (finalResult === 'SUCCESS') {
        setResultType(paymentType === 'CREDITS' ? 'SUCCESS_CREDITS' : 'SUCCESS_FEE');
      } else if (finalResult === 'FAILED') {
        setResultType('FAILED');
      }
    }
    return finalResult;
  };

  const pollPaymentStatus = async (reference: string, maxAttempts = 15): Promise<PaymentResult> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const statusResponse = await paymentService.getPaymentStatus(reference);
        if (statusResponse.status === 'SUCCESS') {
          return 'SUCCESS';
        } else if (statusResponse.status === 'FAILED') {
          return 'FAILED';
        }
        // If PENDING, continue polling
      } catch (error) {
        console.error('Error polling payment status:', error);
      }
      
      // Wait 2 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    return 'TIMEOUT';
  };

  const renderPaymentResult = () => (
    <PaymentResultModal 
      type={resultType} 
      onDismiss={() => setResultType(null)}
      onRetry={lastInitializeFn ? () => {
        setResultType(null);
        processPayment(lastInitializeFn, lastPaymentType);
      } : undefined}
    />
  );

  return { paymentLoading, processPayment, renderPaymentResult };
}
