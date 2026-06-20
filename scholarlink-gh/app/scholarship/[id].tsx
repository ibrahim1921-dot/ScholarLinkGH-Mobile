import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { Badge } from '../../components/Badge';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { ErrorState, LoadingState } from '../../components/StateView';
import { colors } from '../../constants/colors';
import { scholarshipService } from '../../services/scholarshipService';
import { trackerService } from '../../services/trackerService';
import { EligibilityResult, Scholarship } from '../../types/api';

function InfoPill({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.pill}>
      <Ionicons name={icon} size={15} color={colors.primary} />
      <Text style={styles.pillText}>{text}</Text>
    </View>
  );
}

export default function ScholarshipDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scholarshipId = Number(id);

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [s, e] = await Promise.all([
          scholarshipService.getScholarship(scholarshipId),
          scholarshipService.checkEligibility(scholarshipId).catch(() => null),
        ]);
        setScholarship(s);
        setEligibility(e);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load scholarship');
      } finally {
        setLoading(false);
      }
    })();
  }, [scholarshipId]);

  const handleTrack = async () => {
    setTracking(true);
    try {
      await trackerService.createTracker(scholarshipId);
      Alert.alert('Tracked!', 'Scholarship added to your applications tracker.');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not track');
    } finally {
      setTracking(false);
    }
  };

  if (loading) return <Screen><LoadingState /></Screen>;
  if (error || !scholarship) return <Screen><ErrorState message={error ?? 'Not found'} /></Screen>;

  return (
    <Screen>
      <View style={styles.header}>
        <Badge label={scholarship.verified ? 'Verified' : scholarship.category} tone={scholarship.verified ? 'success' : 'info'} />
        <Text style={styles.title}>{scholarship.name}</Text>
        <Text style={styles.provider}>{scholarship.provider}</Text>
      </View>

      <View style={styles.infoRow}>
        <InfoPill icon="location-outline" text={scholarship.destinationCountry} />
        <InfoPill icon="calendar-outline" text={`Deadline: ${scholarship.deadline}`} />
        {scholarship.gpaRequirement > 0 && <InfoPill icon="school-outline" text={`GPA ≥ ${scholarship.gpaRequirement}`} />}
      </View>

      <SectionHeader title="Funding" />
      <Text style={styles.body}>{scholarship.fundingCoverage}</Text>

      <SectionHeader title="Eligible Fields" />
      <Text style={styles.body}>{scholarship.eligibleFields}</Text>

      <SectionHeader title="Requirements" />
      <Text style={styles.body}>{scholarship.requirements}</Text>

      <SectionHeader title="Selection Criteria" />
      <Text style={styles.body}>{scholarship.selectionCriteria}</Text>

      {scholarship.additionalNotes ? (
        <>
          <SectionHeader title="Additional Notes" />
          <Text style={styles.body}>{scholarship.additionalNotes}</Text>
        </>
      ) : null}

      {eligibility && (
        <>
          <SectionHeader title="Your Eligibility" />
          <Badge label={eligibility.meets ? 'You Qualify' : 'Partial Match'} tone={eligibility.meets ? 'success' : 'warning'} />
          {eligibility.criteria_met?.map((c, i) => <Text key={i} style={styles.criterion}>✅ {c}</Text>)}
          {eligibility.criteria_missing?.map((c, i) => <Text key={i} style={styles.criterion}>❌ {c}</Text>)}
          {eligibility.actions_required?.map((c, i) => <Text key={i} style={styles.criterion}>📌 {c}</Text>)}
        </>
      )}

      <View style={styles.actions}>
        <AppButton title="Track Application" onPress={handleTrack} loading={tracking} variant="secondary" style={styles.actionBtn} />
        <AppButton title="Apply Online" onPress={() => Linking.openURL(scholarship.officialLink)} style={styles.actionBtn} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6, marginBottom: 10 },
  title: { color: colors.ink, fontSize: 22, fontWeight: '900', lineHeight: 28 },
  provider: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pillText: { color: colors.ink, fontSize: 13, fontWeight: '600' },
  body: { color: colors.ink, fontSize: 14, lineHeight: 22 },
  criterion: { color: colors.ink, fontSize: 14, lineHeight: 22 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  actionBtn: { flex: 1 },
});
