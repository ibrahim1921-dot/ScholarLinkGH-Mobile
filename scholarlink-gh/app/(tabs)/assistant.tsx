import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppTextInput } from '../../components/AppTextInput';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { colors } from '../../constants/colors';
import { aiService } from '../../services/aiService';

export default function AssistantScreen() {
  const [essayText, setEssayText] = useState('');
  const [review, setReview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReview = async () => {
    if (!essayText.trim()) return;
    setLoading(true);
    try {
      const result = await aiService.reviewEssay(essayText.trim());
      setReview(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not review');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePs = async () => {
    setLoading(true);
    try {
      const ps = await aiService.generatePersonalStatement();
      setReview(ps);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCv = async () => {
    setLoading(true);
    try {
      const cv = await aiService.generateCv();
      setReview(cv);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <SectionHeader title="AI Assistant" subtitle="Get help with essays, CVs, and personal statements." />

      <View style={styles.quickRow}>
        <AppButton title="Generate CV" onPress={handleGenerateCv} variant="secondary" style={styles.quickBtn} loading={loading} />
        <AppButton title="Personal Statement" onPress={handleGeneratePs} variant="secondary" style={styles.quickBtn} loading={loading} />
      </View>

      <AppTextInput
        label="Paste your essay for review"
        value={essayText}
        onChangeText={setEssayText}
        placeholder="Paste or type your essay here…"
        multiline
        numberOfLines={6}
      />
      <AppButton title="Review Essay" onPress={handleReview} loading={loading} />

      {review && (
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>AI Response</Text>
          <Text style={styles.resultText}>{review}</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  quickRow: { flexDirection: 'row', gap: 10 },
  quickBtn: { flex: 1 },
  resultBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    gap: 8,
    marginTop: 10,
    padding: 16,
  },
  resultLabel: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  resultText: { color: colors.ink, fontSize: 14, lineHeight: 22 },
});
