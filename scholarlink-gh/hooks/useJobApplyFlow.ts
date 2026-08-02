import { useState } from 'react';
import { Alert } from 'react-native';
import { jobService } from '../services/jobService';
import { documentService } from '../services/documentService';
import { JobListing, DocumentUpload } from '../types/api';
import { usePayment } from './usePayment';
import { paymentService } from '../services/paymentService';
import { isOutOfCreditsError, BUNDLE_CREDITS, BUNDLE_PRICE_GHS } from '../utils/creditUtils';

export function useJobApplyFlow() {
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [applyMethodSheetVisible, setApplyMethodSheetVisible] = useState(false);
  const [applyingId, setApplyingId] = useState<number | null>(null);

  const { paymentLoading, processPayment, renderPaymentResult } = usePayment();

  const openAssistedFlow = async (job: JobListing) => {
    setSelectedJob(job);
    setApplyModalVisible(true);
  };

  const handleApply = (job: JobListing) => {
    setSelectedJob(job);
    setApplyMethodSheetVisible(true);
  };

  const handleFinalSubmit = async () => {
    if (!selectedJob) return;
    setApplyingId(selectedJob.id);
    
    try {
      if (!selectedJob.sponsored && (selectedJob.assistedApplicationFee ?? 0) > 0) {
        const result = await processPayment((callbackUrl) => paymentService.initializeAssistedApplicationFee('JOB', selectedJob.id, callbackUrl), 'FEE');
        if (result !== 'SUCCESS') {
          if (result === 'TIMEOUT') {
            Alert.alert('Payment Timeout', 'We are waiting for payment confirmation. If successful, your application will be processed.');
          }
          setApplyingId(null);
          return; // Stop submission process
        }
      }

      setApplyModalVisible(false);
      await jobService.applyToJob(selectedJob.id);
      Alert.alert('Applied!', `Your application for ${selectedJob.title} has been submitted.`);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not apply');
    } finally {
      setApplyingId(null);
    }
  };

  return {
    applyModalVisible, setApplyModalVisible,
    selectedJob, setSelectedJob,
    applyMethodSheetVisible, setApplyMethodSheetVisible,
    applyingId, setApplyingId,
    paymentLoading,
    openAssistedFlow,
    handleApply,
    handleFinalSubmit,
    renderPaymentResult
  };
}
