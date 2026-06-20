import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Badge } from '../../components/Badge';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { EmptyState, ErrorState, LoadingState } from '../../components/StateView';
import { colors } from '../../constants/colors';
import { trackerService } from '../../services/trackerService';
import { ApplicationTracker } from '../../types/api';

export default function ApplicationsScreen() {
  const [trackers, setTrackers] = useState<ApplicationTracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrackers();
  }, []);

  const fetchTrackers = async () => {
    setLoading(true);
    setError(null);
    try {
      setTrackers(await trackerService.getTrackers());
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Screen><LoadingState /></Screen>;
  if (error) return <Screen><ErrorState message={error} onRetry={fetchTrackers} /></Screen>;
  if (trackers.length === 0) return <Screen><EmptyState title="No Applications" message="Track your first scholarship from a scholarship detail page." /></Screen>;

  return (
    <Screen scroll={false}>
      <SectionHeader title="Applications" subtitle={`${trackers.length} tracked`} />
      <FlatList
        data={trackers}
        keyExtractor={(t) => String(t.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Badge label={item.status} tone={item.status === 'AWARDED' ? 'success' : item.status === 'REJECTED' ? 'danger' : item.status === 'SUBMITTED' ? 'info' : 'neutral'} />
            <Text style={styles.name}>{item.scholarshipName}</Text>
            <Text style={styles.provider}>{item.scholarshipProvider}</Text>
            <Text style={styles.deadline}>Deadline: {item.scholarshipDeadline} ({item.deadlineCountdown} days)</Text>
            {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
    padding: 14,
  },
  name: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  provider: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  deadline: { color: colors.warning, fontSize: 13, fontWeight: '600' },
  notes: { color: colors.muted, fontSize: 13, lineHeight: 19 },
});
