import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppTextInput } from '../../components/AppTextInput';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../services/apiClient';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Login Failed', getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <SectionHeader title="Welcome Back" subtitle="Sign in to continue" />
      <AppTextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
      <AppTextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
      <AppButton title="Sign In" onPress={submit} loading={loading} />
      <View style={styles.row}>
        <Text style={styles.text}>New here? </Text>
        <Link href="/(auth)/register" style={styles.link}>Create an account</Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: 14 },
  text: { color: colors.muted, fontSize: 14 },
  link: { color: colors.primary, fontSize: 14, fontWeight: '700' },
});
