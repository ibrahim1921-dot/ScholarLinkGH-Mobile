import { useEffect, useState } from 'react';
import { Alert, FlatList, Linking, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { Badge } from '../../components/Badge';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { EmptyState, ErrorState, LoadingState } from '../../components/StateView';
import { colors } from '../../constants/colors';
import { jobService } from '../../services/jobService';
import { aiService } from '../../services/aiService';
import { JobListing } from '../../types/api';

export default function CareerScreen() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<number | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await jobService.getJobs();
      setJobs(result.content);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (job: JobListing) => {
    setApplyingId(job.id);
    try {
      let coverLetter: string | undefined;
      try {
        coverLetter = await aiService.generateCoverLetter(job.title, job.company, job.description);
      } catch {
        // proceed without cover letter
      }
      await jobService.applyToJob(job.id, coverLetter);
      Alert.alert('Applied!', `Your application for ${job.title} has been submitted.`);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not apply');
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) return <Screen><LoadingState /></Screen>;
  if (error) return <Screen><ErrorState message={error} onRetry={loadJobs} /></Screen>;
  if (jobs.length === 0) return <Screen><EmptyState title="No Jobs" message="Check back later for new opportunities." /></Screen>;

  return (
    <Screen scroll={false}>
      <SectionHeader title="Career" subtitle="Jobs & internships matching your profile" />
      <FlatList
        data={jobs}
        keyExtractor={(j) => String(j.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardInfo}>
                <Text style={styles.jobTitle}>{item.title}</Text>
                <Text style={styles.company}>{item.company}</Text>
              </View>
              <Badge label={item.requiredEducationLevel} />
            </View>
            <Text style={styles.loc}>{item.location} • {item.fieldOfStudy}</Text>
            {item.salaryRange ? <Text style={styles.salary}>{item.salaryRange}</Text> : null}
            <Text style={styles.deadline}>Deadline: {item.applicationDeadline}</Text>
            <View style={styles.actions}>
              <AppButton
                title="Apply"
                onPress={() => handleApply(item)}
                loading={applyingId === item.id}
                style={styles.actionBtn}
              />
              {item.applicationUrl ? (
                <AppButton
                  title="View Online"
                  onPress={() => Linking.openURL(item.applicationUrl!)}
                  variant="secondary"
                  style={styles.actionBtn}
                />
              ) : null}
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12, paddingBottom: 12 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 14,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  cardInfo: { flex: 1, gap: 2, marginRight: 10 },
  jobTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  company: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  loc: { color: colors.muted, fontSize: 13 },
  salary: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  deadline: { color: colors.warning, fontSize: 13, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  actionBtn: { flex: 1 },
});
