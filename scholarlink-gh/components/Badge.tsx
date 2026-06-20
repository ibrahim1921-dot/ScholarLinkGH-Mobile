import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  return (
    <View style={[styles.badge, styles[tone]]}>
      <Text style={[styles.text, tone !== 'neutral' && styles.strongText]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  neutral: { backgroundColor: colors.surfaceMuted },
  success: { backgroundColor: '#E5F6EC' },
  warning: { backgroundColor: '#FFF4D9' },
  danger: { backgroundColor: '#FDE8E6' },
  info: { backgroundColor: '#E6F2FA' },
  text: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  strongText: { color: colors.ink },
});
