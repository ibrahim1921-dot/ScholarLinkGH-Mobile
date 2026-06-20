import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import { Scholarship, ScholarshipMatch } from '../types/api';
import { Badge } from './Badge';

type Props = {
  scholarship?: Scholarship;
  match?: ScholarshipMatch;
  onPress: () => void;
};

export function ScholarshipCard({ scholarship, match, onPress }: Props) {
  const title = scholarship?.name ?? match?.scholarshipName ?? '';
  const provider = scholarship?.provider ?? match?.provider ?? '';
  const deadline = scholarship?.deadline ?? match?.deadline;
  const country = scholarship?.destinationCountry ?? match?.destinationCountry;
  const days = scholarship?.daysUntilDeadline;
  const score = match?.matchScore;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.row}>
        <Badge label={scholarship?.verified ? 'Verified' : score ? `${score}% match` : country ?? 'Scholarship'} tone={score && score >= 80 ? 'success' : 'info'} />
        {typeof days === 'number' ? <Badge label={`${days} days left`} tone={days <= 7 ? 'danger' : days <= 30 ? 'warning' : 'neutral'} /> : null}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.meta}>{provider}{country ? ` - ${country}` : ''}</Text>
      <Text style={styles.detail}>{scholarship?.fundingCoverage ?? match?.fundingCoverage}</Text>
      {deadline ? <Text style={styles.deadline}>Deadline: {deadline}</Text> : null}
      {match?.matchExplanation ? <Text style={styles.explain}>{match.matchExplanation}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 9,
    padding: 16,
  },
  pressed: { opacity: 0.86 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  title: { color: colors.ink, fontSize: 17, fontWeight: '800', lineHeight: 23 },
  meta: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  detail: { color: colors.ink, fontSize: 14, lineHeight: 20 },
  deadline: { color: colors.warning, fontSize: 13, fontWeight: '800' },
  explain: { color: colors.muted, fontSize: 13, lineHeight: 19 },
});
