import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { AppButton } from '../components/AppButton';
import { Badge } from '../components/Badge';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { EmptyState, ErrorState, LoadingState } from '../components/StateView';
import { colors } from '../constants/colors';
import { documentTypes } from '../constants/options';
import { documentService } from '../services/documentService';
import { DisclaimerStatus, DocumentUpload } from '../types/api';

export default function DocumentsScreen() {
  const [docs, setDocs] = useState<DocumentUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disclaimer, setDisclaimer] = useState<DisclaimerStatus | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('Transcript');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [documents, disc] = await Promise.all([
        documentService.getDocuments(),
        documentService.getDisclaimerStatus(),
      ]);
      setDocs(documents);
      setDisclaimer(disc);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const acceptDisclaimer = async () => {
    try {
      await documentService.acceptDisclaimer();
      setDisclaimer((prev) => (prev ? { ...prev, disclaimer_accepted: true } : prev));
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not accept disclaimer');
    }
  };

  const upload = async () => {
    // expo-document-picker must be installed to use this feature
    let DocumentPicker: typeof import('expo-document-picker');
    try {
      DocumentPicker = require('expo-document-picker');
    } catch {
      Alert.alert('Not Available', 'Document picker is not installed. Please install expo-document-picker.');
      return;
    }

    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.length) return;
    const file = result.assets[0];

    Alert.alert(
      'Document Type',
      'Select the type of document',
      documentTypes.map((dt) => ({
        text: dt,
        onPress: async () => {
          setUploading(true);
          try {
            const uploaded = await documentService.uploadDocument(file, dt);
            setDocs((prev) => [uploaded, ...prev]);
          } catch (e: any) {
            Alert.alert('Upload Failed', e?.message ?? 'Could not upload');
          } finally {
            setUploading(false);
          }
        },
      })),
    );
  };

  const getStatusIcon = (status: string) => {
    if (status === 'VERIFIED') return 'checkmark-circle';
    if (status === 'SUSPICIOUS' || status === 'REJECTED') return 'warning';
    return 'time';
  };

  const getStatusColors = (status: string) => {
    if (status === 'VERIFIED') return { bg: '#a0f399', text: '#005312', icon: '#217128', border: '#1b6d24' };
    if (status === 'SUSPICIOUS' || status === 'REJECTED') return { bg: '#ffdad6', text: '#93000a', icon: '#ba1a1a', border: '#ba1a1a' };
    return { bg: '#ffdbca', text: '#723610', icon: '#d8885c', border: '#ffb690' };
  };

  const filteredDocs = docs.filter(doc => doc.document_type.toLowerCase() === activeTab.toLowerCase());

  if (loading) return <Screen scroll={false}><LoadingState /></Screen>;
  if (error) return <Screen scroll={false}><ErrorState message={error} onRetry={fetchAll} /></Screen>;

  if (disclaimer && !disclaimer.disclaimer_accepted) {
    return (
      <Screen>
        <SectionHeader title="Document Disclaimer" subtitle="By uploading documents, you agree that AI verification will be used to confirm document authenticity." />
        <AppButton title="I understand and agree" onPress={acceptDisclaimer} />
      </Screen>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Document Upload</Text>
        <Pressable style={styles.iconButton}>
          <Ionicons name="share-outline" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introBox}>
          <MaterialIcons name="verified-user" size={24} color="#003366" />
          <Text style={styles.introText}>
            Your documents are protected with bank-grade encryption. We use AI verification to speed up your scholarship eligibility checks.
          </Text>
        </View>

        {/* Document Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Document Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
            {['Transcript', 'CV', 'Statement'].map((tab) => (
              <Pressable 
                key={tab} 
                style={[styles.tabBtn, activeTab === tab ? styles.tabBtnActive : styles.tabBtnInactive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabBtnText, activeTab === tab ? styles.tabBtnTextActive : styles.tabBtnTextInactive]}>
                  {tab}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Upload Area */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.uploadArea} onPress={upload} disabled={uploading} activeOpacity={0.8}>
            <View style={styles.uploadIconContainer}>
              <Ionicons name={uploading ? "reload" : "cloud-upload"} size={32} color={colors.primary} />
            </View>
            <Text style={styles.uploadTitle}>{uploading ? "Uploading..." : "Tap to upload files here"}</Text>
            <Text style={styles.uploadSubtitle}>PDF, JPG, or PNG (Max 5MB)</Text>
          </TouchableOpacity>
        </View>

        {/* Uploaded Documents List */}
        <View style={styles.section}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Recent Uploads</Text>
            <Pressable>
              <Text style={styles.viewAllText}>View All</Text>
            </Pressable>
          </View>

          {filteredDocs.length === 0 ? (
            <EmptyState title={`No ${activeTab}s`} message={`Upload your first ${activeTab.toLowerCase()} to get started.`} />
          ) : (
            <View style={styles.docsList}>
              {filteredDocs.map((item) => {
                const statusColors = getStatusColors(item.verification_status);
                
                return (
                  <View key={item.id} style={styles.docCard}>
                    <View style={styles.docCardHeader}>
                      <View style={styles.docInfo}>
                        <View style={[styles.docIconBg, { backgroundColor: statusColors.bg }]}>
                          <Ionicons name="checkmark-circle" size={16} color={statusColors.icon} />
                        </View>
                        <View style={styles.docTextInfo}>
                          <Text style={styles.docFilename} numberOfLines={1}>{item.filename}</Text>
                          <Text style={styles.docType}>{item.document_type}</Text>
                        </View>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                        <Ionicons name={getStatusIcon(item.verification_status)} size={12} color={statusColors.text} />
                        <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>
                          {item.verification_status}
                        </Text>
                      </View>
                    </View>

                    {item.verification_notes ? (
                      <View style={[styles.aiInsightBox, { borderLeftColor: statusColors.border }]}>
                        <Ionicons name="checkmark-circle" size={16} color="#005312" style={{ marginRight: 4 }} />
                        <Text style={[styles.aiInsightText, item.verification_status === 'SUSPICIOUS' && { color: statusColors.icon }]}>
                          <Text style={{ fontWeight: '700' }}>AI Insight: </Text>
                          {item.verification_notes}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Area */}
      <View style={styles.bottomActionArea}>
        <Pressable style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Submit for Verification</Text>
          <Ionicons name="send" size={18} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 18,
    color: colors.primary,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100, // Room for bottom action
  },
  introBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 51, 102, 0.1)', // primary-container/10
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(195, 198, 209, 0.3)',
    gap: 12,
    marginBottom: 24,
  },
  introText: {
    flex: 1,
    fontFamily: 'BeVietnamPro_400Regular',
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 18,
    color: colors.primary,
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabBtnInactive: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
  tabBtnText: {
    fontFamily: 'BeVietnamPro_600SemiBold',
    fontSize: 12,
  },
  tabBtnTextActive: {
    color: '#ffffff',
  },
  tabBtnTextInactive: {
    color: colors.muted,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: 'rgba(195, 198, 209, 0.8)',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#ffffff', // surface-container-lowest
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(0, 51, 102, 0.1)',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: colors.ink,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontFamily: 'BeVietnamPro_600SemiBold',
    fontSize: 12,
    color: colors.muted,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: 'BeVietnamPro_600SemiBold',
    fontSize: 12,
    color: colors.primary,
  },
  docsList: {
    gap: 16,
  },
  docCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  docCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  docInfo: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  docIconBg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  docTextInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  docFilename: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: colors.ink,
    marginBottom: 2,
  },
  docType: {
    fontFamily: 'BeVietnamPro_600SemiBold',
    fontSize: 10,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusBadgeText: {
    fontFamily: 'BeVietnamPro_600SemiBold',
    fontSize: 10,
    textTransform: 'capitalize',
  },
  aiInsightBox: {
    backgroundColor: '#f4f3f8', // surface-container-low
    padding: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  aiInsightText: {
    flex: 1,
    fontFamily: 'BeVietnamPro_400Regular',
    fontSize: 12,
    color: colors.muted,
    lineHeight: 18,
  },
  bottomActionArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32, // extra padding for safe area
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 20,
  },
  submitButton: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
});
