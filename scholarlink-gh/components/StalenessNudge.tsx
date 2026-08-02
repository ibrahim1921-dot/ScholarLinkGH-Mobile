import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

interface StalenessNudgeProps {
  matchedAt?: string | Date;
}

function getDaysSince(date: Date): number {
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function getRelativeTime(days: number): string {
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

export function StalenessNudge({ matchedAt }: StalenessNudgeProps) {
  const date = useMemo(() => {
    if (!matchedAt) return new Date();
    return typeof matchedAt === 'string' ? new Date(matchedAt) : matchedAt;
  }, [matchedAt]);

  const daysSince = useMemo(() => getDaysSince(date), [date]);
  
  const isFresh = daysSince < 3;
  const isModeratelyOld = daysSince >= 3 && daysSince <= 21;
  const isOld = daysSince > 21;

  if (isFresh) {
    return (
      <View style={styles.containerFresh}>
        <Text style={styles.textFresh}>Matched {getRelativeTime(daysSince)}</Text>
      </View>
    );
  }

  if (isModeratelyOld) {
    return (
      <View style={styles.containerModerate}>
        <Ionicons name="time-outline" size={14} color={colors.muted} />
        <Text style={styles.textModerate}>
          Matched {getRelativeTime(daysSince)}. New scholarships may be available.
        </Text>
      </View>
    );
  }

  // Old
  return (
    <View style={styles.containerOld}>
      <Ionicons name="alert-circle" size={16} color="#8a5300" />
      <View style={{ flex: 1 }}>
        <Text style={styles.textOldTitle}>Your matches are over 3 weeks old</Text>
        <Text style={styles.textOldDesc}>Refresh to see new opportunities you might qualify for.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerFresh: {
    paddingVertical: 4,
  },
  textFresh: {
    fontFamily: 'BeVietnamPro_400Regular',
    fontSize: 12,
    color: colors.muted,
  },
  containerModerate: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 6,
  },
  textModerate: {
    fontFamily: 'BeVietnamPro_400Regular',
    fontSize: 13,
    color: colors.muted,
    flex: 1,
  },
  containerOld: {
    flexDirection: 'row',
    backgroundColor: '#fff3cd', // Light amber
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffe69c',
    gap: 8,
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  textOldTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: '#8a5300', // Dark amber text
    marginBottom: 2,
  },
  textOldDesc: {
    fontFamily: 'BeVietnamPro_400Regular',
    fontSize: 12,
    color: '#8a5300', // Dark amber text
  }
});
