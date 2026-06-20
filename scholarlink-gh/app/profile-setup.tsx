import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { AppTextInput } from '../components/AppTextInput';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { colors } from '../constants/colors';
import { educationLevels } from '../constants/options';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';

export default function ProfileSetupScreen() {
  const { user } = useAuth();
  const [educationLevel, setEducationLevel] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [institution, setInstitution] = useState('');
  const [gpa, setGpa] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!educationLevel || !fieldOfStudy || !institution) {
      Alert.alert('Missing Fields', 'Please fill in the required fields.');
      return;
    }

    setLoading(true);
    try {
      await profileService.updateProfile({
        education_level: educationLevel as any,
        field_of_study: fieldOfStudy,
        institution,
        gpa: gpa ? parseFloat(gpa) : undefined,
        bio: bio || undefined,
      });
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <SectionHeader title="Set Up Profile" subtitle="Tell us about yourself to get matched with the best scholarships." />

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

      <AppTextInput label="Field of Study" value={fieldOfStudy} onChangeText={setFieldOfStudy} placeholder="e.g. Computer Science" />
      <AppTextInput label="Institution" value={institution} onChangeText={setInstitution} placeholder="e.g. University of Ghana" />
      <AppTextInput label="GPA (optional)" value={gpa} onChangeText={setGpa} placeholder="e.g. 3.6" keyboardType="decimal-pad" />
      <AppTextInput label="Short Bio (optional)" value={bio} onChangeText={setBio} placeholder="Tell us a bit about yourself…" multiline numberOfLines={4} />

      <AppButton title="Continue" onPress={handleSubmit} loading={loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  educationRow: { flexDirection: 'row', gap: 10 },
  eduBtn: { flex: 1 },
});
