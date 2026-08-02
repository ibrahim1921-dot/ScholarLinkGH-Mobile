import React from 'react';
import { Modal, View, Text, Pressable, ScrollView, TextInput, ActivityIndicator, SafeAreaView, Linking, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { useScholarshipApplyFlow } from '../hooks/useScholarshipApplyFlow';
import { OutOfCreditsModal } from './OutOfCreditsModal';

type ScholarshipApplyModalsProps = ReturnType<typeof useScholarshipApplyFlow>;

export function ScholarshipApplyModals({
  applyModalVisible, setApplyModalVisible,
  selectedScholarship,
  applyMethodSheetVisible, setApplyMethodSheetVisible,
  applyingId,
  openAssistedFlow,
  handleFinalSubmit,
  paymentLoading,
  renderPaymentResult
}: ScholarshipApplyModalsProps) {
  const insets = useSafeAreaInsets();

  return (
    <>
      {renderPaymentResult()}
      <Modal visible={applyMethodSheetVisible} animationType="slide" transparent>
        <View style={styles.sheetOverlay}>
          <View style={[styles.sheetContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Choose Application Method</Text>
              <Pressable onPress={() => setApplyMethodSheetVisible(false)}>
                <Ionicons name="close" size={24} color={colors.ink} />
              </Pressable>
            </View>
            <Text style={styles.sheetSubtitle}>How would you like to apply for this scholarship?</Text>

            <Pressable 
              style={[styles.sheetItem, !selectedScholarship?.officialLink && { opacity: 0.5 }]}
              disabled={!selectedScholarship?.officialLink}
              onPress={() => {
                setApplyMethodSheetVisible(false);
                if (selectedScholarship?.officialLink) {
                  const url = selectedScholarship.officialLink.startsWith('http') ? selectedScholarship.officialLink : `https://${selectedScholarship.officialLink}`;
                  Linking.openURL(url).catch(() => Alert.alert('Error', "Couldn't open link"));
                }
              }}
            >
              <Ionicons name="open-outline" size={24} color={!selectedScholarship?.officialLink ? colors.muted : colors.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.sheetItemText, !selectedScholarship?.officialLink && { color: colors.muted }]}>Apply Directly (External Portal)</Text>
                <Text style={styles.sheetItemSubtext}>
                  {!selectedScholarship?.officialLink ? "Not available for this scholarship" : "Takes you to the company's website"}
                </Text>
              </View>
            </Pressable>

            <Pressable 
              style={[styles.sheetItem, { borderBottomWidth: 0 }]}
              onPress={() => {
                setApplyMethodSheetVisible(false);
                if (selectedScholarship) openAssistedFlow(selectedScholarship);
              }}
            >
              <Ionicons name="sparkles-outline" size={24} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.sheetItemText}>Apply via ScholarLink GH</Text>
                <Text style={styles.sheetItemSubtext}>Assisted Application with AI features</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Assisted Application Modal */}
      <Modal
        visible={applyModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setApplyModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Apply: {selectedScholarship?.name}</Text>
            <Pressable onPress={() => setApplyModalVisible(false)} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={24} color={colors.ink} />
            </Pressable>
          </View>
          <View style={[styles.modalContent, styles.modalContentInner, { justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="document-text-outline" size={64} color={colors.primary} style={{ marginBottom: 16 }} />
            <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 18, color: colors.ink, textAlign: 'center', marginBottom: 8 }}>
              Ready to Submit?
            </Text>
            <Text style={{ fontFamily: 'BeVietnamPro_400Regular', fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 22 }}>
              Your profile information and vault documents (including your personal statement) will be securely shared with the scholarship provider.
            </Text>
          </View>
          <View style={styles.modalFooter}>
            {selectedScholarship?.sponsored ? (
              <View style={{ backgroundColor: 'rgba(27, 109, 36, 0.1)', padding: 12, borderRadius: 8, marginBottom: 12, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'BeVietnamPro_600SemiBold', fontSize: 13, color: '#1b6d24' }}>
                  Free to Apply — Sponsored by {selectedScholarship.sponsorName || selectedScholarship.provider}
                </Text>
              </View>
            ) : selectedScholarship?.assistedApplicationFee && selectedScholarship.assistedApplicationFee > 0 ? (
              <View style={{ backgroundColor: '#f4f3f8', padding: 12, borderRadius: 8, marginBottom: 12, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'BeVietnamPro_600SemiBold', fontSize: 13, color: colors.ink }}>
                  This service costs ₵{selectedScholarship.assistedApplicationFee} — you'll be asked to pay before submitting.
                </Text>
              </View>
            ) : null}
            <Pressable 
              style={[styles.btnPrimaryLg, (applyingId === selectedScholarship?.id || paymentLoading) && { opacity: 0.7 }]} 
              onPress={handleFinalSubmit}
              disabled={applyingId === selectedScholarship?.id || paymentLoading}
            >
              {paymentLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.btnPrimaryLgText}>Submit Application</Text>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(195, 198, 209, 0.3)',
  },
  modalTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 18,
    color: colors.ink,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
  },
  modalContentInner: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: colors.primary,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(195, 198, 209, 0.3)',
    marginVertical: 16,
  },
  docsList: {
    gap: 8,
    marginBottom: 16,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(195, 198, 209, 0.4)',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  docItemActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 51, 102, 0.05)',
  },
  docItemTextWrap: {
    marginLeft: 12,
    flex: 1,
  },
  docItemTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: colors.ink,
  },
  docItemSubtitle: {
    fontFamily: 'BeVietnamPro_400Regular',
    fontSize: 12,
    color: colors.muted,
  },
  emptyDocsText: {
    fontFamily: 'BeVietnamPro_400Regular',
    fontSize: 14,
    color: colors.muted,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  subsectionSubtitle: {
    fontFamily: 'BeVietnamPro_400Regular',
    fontSize: 13,
    color: colors.muted,
    flex: 1,
  },
  btnSmallGenerate: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnSmallGenerateText: {
    fontFamily: 'BeVietnamPro_600SemiBold',
    fontSize: 12,
    color: '#ffffff',
  },
  coverLetterInput: {
    borderWidth: 1,
    borderColor: 'rgba(195, 198, 209, 0.5)',
    borderRadius: 8,
    padding: 16,
    minHeight: 200,
    fontFamily: 'BeVietnamPro_400Regular',
    fontSize: 14,
    color: colors.ink,
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(195, 198, 209, 0.3)',
    backgroundColor: '#ffffff',
  },
  btnPrimaryLg: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryLgText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: '#ffffff',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sheetTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: colors.ink,
  },
  sheetSubtitle: {
    fontFamily: 'BeVietnamPro_400Regular',
    fontSize: 14,
    color: colors.muted,
    marginBottom: 16,
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(195, 198, 209, 0.3)',
  },
  sheetItemText: {
    fontFamily: 'BeVietnamPro_600SemiBold',
    fontSize: 14,
    color: colors.ink,
  },
  sheetItemSubtext: {
    fontFamily: 'BeVietnamPro_400Regular',
    fontSize: 12,
    color: colors.muted,
  },
});
