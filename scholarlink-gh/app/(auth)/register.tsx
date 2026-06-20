import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppTextInput } from '../../components/AppTextInput';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { colors } from '../../constants/colors';
import { educationLevels } from '../../constants/options';
import { getErrorMessage } from '../../services/apiClient';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!username.trim() || !email.trim() || !phone.trim() || !educationLevel || !password) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        phoneNumber: phone.trim(),
        educationLevel: educationLevel as any,
        password,
      });
      router.push({ pathname: '/(auth)/verify-otp', params: { email: email.trim() } });
    } catch (e) {
      Alert.alert('Registration Failed', getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <SectionHeader title="Create Account" subtitle="Start your scholarship journey" />
      <AppTextInput label="Username" value={username} onChangeText={setUsername} placeholder="johndoe" />
      <AppTextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
      <AppTextInput label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="0241234567" />

      <Text style={styles.label}>Education Level</Text>
      <View style={styles.educationRow}>
        {educationLevels.map((lvl) => (
          <AppButton
            key={lvl.value}
            title={lvl.label}
            variant={educationLevel === lvl.value ? 'primary' : 'secondary'}
            onPress={() => setEducationLevel(lvl.value)}
            style={styles.eduBtn}
          />
        ))}
      </View>

      <AppTextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
      <AppButton title="Create Account" onPress={submit} loading={loading} />
      <View style={styles.row}>
        <Text style={styles.text}>Already have an account? </Text>
        <Link href="/(auth)/login" style={styles.link}>Sign In</Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.ink, fontSize: 13, fontWeight: '700', marginBottom: 6 },
  educationRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  eduBtn: { flex: 1 },
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: 14 },
  text: { color: colors.muted, fontSize: 14 },
  link: { color: colors.primary, fontSize: 14, fontWeight: '700' },
});
