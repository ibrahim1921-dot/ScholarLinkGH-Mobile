import { useState } from 'react';
import { Alert } from 'react-native';
import { scholarshipService } from '../services/scholarshipService';
import { trackerService } from '../services/trackerService';
import { documentService } from '../services/documentService';
import { Scholarship, DocumentUpload } from '../types/api';
import { usePayment } from './usePayment';
import { paymentService } from '../services/paymentService';
import { isOutOfCreditsError, BUNDLE_CREDITS, BUNDLE_PRICE_GHS } from '../utils/creditUtils';

export function useScholarshipApplyFlow() {
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [applyMethodSheetVisible, setApplyMethodSheetVisible] = useState(false);
  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  
  const { paymentLoading, processPayment, renderPaymentResult } = usePayment();

  const openAssistedFlow = async (scholarship: Scholarship) => {
    setSelectedScholarship(scholarship);
    setApplyModalVisible(true);
  };

  const handleApply = (scholarship: Scholarship) => {
    setSelectedScholarship(scholarship);
    setApplyMethodSheetVisible(true);
  };

  const handleFinalSubmit = async () => {
    if (!selectedScholarship) return;
    setApplyingId(selectedScholarship.id);
    
    try {
      if (!selectedScholarship.sponsored && (selectedScholarship.assistedApplicationFee ?? 0) > 0) {
        const result = await processPayment((callbackUrl) => paymentService.initializeAssistedApplicationFee('SCHOLARSHIP', selectedScholarship.id, callbackUrl), 'FEE');
        if (result !== 'SUCCESS') {
          if (result === 'TIMEOUT') {
            Alert.alert('Payment Timeout', 'We are waiting for payment confirmation. If successful, your application will be processed.');
          }
          setApplyingId(null);
          return; // Stop submission process
        }
      }

      setApplyModalVisible(false);
      // Backend does not currently store documents/personal statement for scholarships.
      // We start tracking the application as IN_PROGRESS via ASSISTED mode.
      await trackerService.createTracker(selectedScholarship.id, 'IN_PROGRESS', 'ASSISTED');
      Alert.alert('Applied!', `Your application for ${selectedScholarship.name} has been submitted.`);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not apply');
    } finally {
      setApplyingId(null);
    }
  };

  return {
    applyModalVisible, setApplyModalVisible,
    selectedScholarship, setSelectedScholarship,
    applyMethodSheetVisible, setApplyMethodSheetVisible,
    applyingId, setApplyingId,
    paymentLoading,
    openAssistedFlow,
    handleApply,
    handleFinalSubmit,
    renderPaymentResult
  };
}
