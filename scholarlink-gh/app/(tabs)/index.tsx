import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { ScholarshipCard } from '../../components/ScholarshipCard';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { EmptyState, ErrorState, LoadingState } from '../../components/StateView';
import { colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { aiService } from '../../services/aiService';
import { trackerService } from '../../services/trackerService';
import { ApplicationTracker, ScholarshipMatch } from '../../types/api';

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const [matches, setMatches] = useState<ScholarshipMatch[]>([]);
  const [trackers, setTrackers] = useState<ApplicationTracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, t] = await Promise.all([
        aiService.getScholarshipMatches().catch(() => []),
        trackerService.getTrackers().catch(() => []),
      ]);
      setMatches(m);
      setTrackers(t);
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Screen><LoadingState /></Screen>;
  if (error) return <Screen><ErrorState message={error} onRetry={fetchData} /></Screen>;

  return (
    <Screen scroll={false}>
      <SectionHeader title={`Hello, ${user?.username ?? 'Student'}`} subtitle="Here's your scholarship overview" />

      <View style={styles.statsRow}>
        <Stat value={String(matches.length)} label="Matches" />
        <Stat value={String(trackers.length)} label="Applications" />
        <Stat value={String(trackers.filter((t) => t.status === 'AWARDED').length)} label="Awarded" />
      </View>

      <View style={styles.quickActions}>
        <AppButton title="Documents" onPress={() => router.push('/documents')} variant="secondary" style={styles.quickBtn} />
        <AppButton title="Sign Out" onPress={signOut} variant="ghost" style={styles.quickBtn} />
      </View>

      <SectionHeader title="Your Matches" />
      {matches.length === 0 ? (
        <EmptyState title="No matches yet" message="Complete your profile to get AI-matched scholarships." />
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(m) => String(m.matchId)}
          renderItem={({ item }) => (
            <ScholarshipCard
              match={item}
              onPress={() => router.push({ pathname: '/scholarship/[id]', params: { id: String(item.scholarshipId) } })}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: 10 },
  stat: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 2,
    paddingVertical: 14,
  },
  statValue: { color: colors.primary, fontSize: 22, fontWeight: '900' },
  statLabel: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  quickActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  quickBtn: { flex: 1 },
  list: { gap: 12, paddingBottom: 12 },
});
