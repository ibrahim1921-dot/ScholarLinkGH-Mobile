import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors } from '../constants/colors';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  style?: ViewStyle;
};

export function AppButton({ title, onPress, loading, variant = 'primary', style }: Props) {
  const textStyles = {
    primary: styles.primaryText,
    secondary: styles.secondaryText,
    ghost: styles.ghostText,
    danger: styles.dangerText,
  };

  return (
    <Pressable
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        loading && styles.disabled,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} /> : <Text style={[styles.text, textStyles[variant]]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surfaceMuted },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.danger },
  text: { fontSize: 15, fontWeight: '700' },
  primaryText: { color: '#fff' },
  secondaryText: { color: colors.primaryDark },
  ghostText: { color: colors.primary },
  dangerText: { color: '#fff' },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.6 },
});
