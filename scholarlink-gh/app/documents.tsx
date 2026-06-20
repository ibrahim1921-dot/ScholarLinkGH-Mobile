import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

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
    <Screen scroll={false}>
      <SectionHeader title="My Documents" subtitle={`${docs.length} document${docs.length !== 1 ? 's' : ''} uploaded`} />
      <AppButton title={uploading ? 'Uploading…' : 'Upload Document'} onPress={upload} loading={uploading} style={styles.uploadBtn} />

      {docs.length === 0 ? (
        <EmptyState title="No Documents" message="Upload your first document to get started." />
      ) : (
        <FlatList
          data={docs}
          keyExtractor={(d) => String(d.id)}
          renderItem={({ item }) => (
            <View style={styles.docCard}>
              <Text style={styles.docName}>{item.filename}</Text>
              <View style={styles.docMeta}>
                <Badge label={item.document_type} />
                <Badge
                  label={item.verification_status}
                  tone={
                    item.verification_status === 'VERIFIED'
                      ? 'success'
                      : item.verification_status === 'REJECTED'
                      ? 'danger'
                      : item.verification_status === 'SUSPICIOUS'
                      ? 'warning'
                      : 'neutral'
                  }
                />
              </View>
              {item.verification_notes ? <Text style={styles.docNotes}>{item.verification_notes}</Text> : null}
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  uploadBtn: { marginBottom: 16 },
  list: { gap: 10 },
  docCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  docName: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  docMeta: { flexDirection: 'row', gap: 8 },
  docNotes: { color: colors.muted, fontSize: 13, lineHeight: 19 },
});
