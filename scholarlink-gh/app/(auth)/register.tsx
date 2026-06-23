import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View, Image, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../../components/AppButton";
import { AppTextInput } from "../../components/AppTextInput";
import { colors } from "../../constants/colors";
import { educationLevels } from "../../constants/options";
import { getErrorMessage } from "../../services/apiClient";
import { useAuth } from "../../hooks/useAuth";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = () => {
    if (password.length === 0) return { label: "WEAK", color: colors.danger, width: "0%" };
    if (password.length < 6) return { label: "WEAK", color: colors.danger, width: "25%" };
    if (password.length < 10) return { label: "MEDIUM", color: "#d8885c", width: "60%" };
    return { label: "STRONG", color: colors.success, width: "100%" };
  };

  const strength = getPasswordStrength();

  const submit = async () => {
    if (
      !email.trim() ||
      !phone.trim() ||
      !educationLevel ||
      !password
    ) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await register({
        username: email.split('@')[0], // Use email prefix as username since it's removed from UI
        email: email.trim(),
        phoneNumber: phone.trim(),
        educationLevel: educationLevel as any,
        password,
      });
      router.push({
        pathname: "/(auth)/verify-otp",
        params: { email: email.trim() },
      });
    } catch (e) {
      Alert.alert("Registration Failed", getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ScholarLink GH</Text>
        <View style={styles.headerIconContainer}>
          <Ionicons name="person" size={20} color={colors.primary} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        {/* Intro */}
        <View style={styles.introContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the community bridging achievement and opportunity in Ghana.</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>SELECT EDUCATION LEVEL</Text>
            <View style={styles.educationToggleContainer}>
              {educationLevels.map((lvl) => {
                const isSelected = educationLevel === lvl.value;
                return (
                  <AppButton
                    key={lvl.value}
                    title={lvl.label}
                    variant={isSelected ? "primary" : "ghost"}
                    onPress={() => setEducationLevel(lvl.value)}
                    style={[
                      styles.eduBtn,
                      isSelected ? styles.eduBtnSelected : styles.eduBtnUnselected
                    ]}
                  />
                );
              })}
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <AppTextInput
              label=""
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="name@example.com"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>PHONE NUMBER</Text>
            <AppTextInput
              label=""
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="20 123 4567"
            />
          </View>

          <View style={styles.fieldContainer}>
            <View style={styles.passwordHeader}>
              <Text style={styles.label}>PASSWORD</Text>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
            </View>
            <AppTextInput
              label=""
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
            />
            {/* Strength Indicator */}
            <View style={styles.strengthBarBg}>
              <View style={[styles.strengthBarFill, { width: strength.width as any, backgroundColor: strength.color }]} />
            </View>
          </View>

          <View style={styles.actionContainer}>
            <AppButton 
              title="Register" 
              onPress={submit} 
              loading={loading} 
              icon={<Ionicons name="arrow-forward" size={20} color="#ffffff" />}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.text}>Already have an account? </Text>
            <Link href="/(auth)/login" style={styles.link}>
              Log In
            </Link>
          </View>

        </View>

        {/* Visual Anchor / Decorative */}
        <View style={styles.decorativeContainer}>
          <Image 
            source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAnb3-6m4QRJBmZVwHd0imeKPhDVsH8j9u4T4WCirbBaJhWmS88A4WXxr-CAbFsMp_RXJCsrpK9jwZNFftqzKQ1Dya4EJpY24Muf7nWbVULpNoDkfCl4v6EZbCMc6hIG5zw0bPtHGJnJ5_FeJnU6kgEoQHUNg-qGCCIWCDzAXpxTTk8dDRAd8ZpKR3Bd8yBalLKuWDP2c0TYtn_I1cbpyB-MAYQQF4PVvib5u5WT4578MzvAlZMYFqcwmm5FL4kOk7HKBMJtJqZD1Ss" }}
            style={styles.decorativeImage}
          />
          <View style={styles.decorativeOverlay} />
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 56,
    backgroundColor: "rgba(249, 249, 254, 0.8)",
  },
  headerTitle: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 18,
    color: colors.primary,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 2,
    borderColor: "#d5e3ff",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 80,
  },
  introContainer: {
    marginBottom: 32,
  },
  title: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 32,
    color: colors.primary,
    marginBottom: 8,
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 16,
    color: colors.muted,
    lineHeight: 24,
  },
  formContainer: { 
    gap: 16 
  },
  fieldContainer: {
    gap: 4,
  },
  label: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
    color: colors.ink,
    letterSpacing: 0.5,
  },
  educationToggleContainer: {
    flexDirection: "row",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  eduBtn: {
    flex: 1,
    height: 48,
  },
  eduBtnSelected: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: "rgba(195, 198, 209, 0.3)",
  },
  eduBtnUnselected: {
    backgroundColor: "transparent",
  },
  eduBtnTextSelected: {
    color: colors.primary,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  eduBtnTextUnselected: {
    color: colors.muted,
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  strengthLabel: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 10,
  },
  strengthBarBg: {
    height: 4,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 4,
  },
  strengthBarFill: {
    height: "100%",
  },
  actionContainer: { 
    marginTop: 16,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  text: { 
    color: colors.muted, 
    fontSize: 14,
    fontFamily: "BeVietnamPro_400Regular",
  },
  link: { 
    color: colors.primary, 
    fontSize: 14, 
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  decorativeContainer: {
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 32,
    position: "relative",
  },
  decorativeImage: {
    width: "100%",
    height: "100%",
    opacity: 0.5,
  },
  decorativeOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%",
    backgroundColor: "rgba(249, 249, 254, 0.3)", // fade gradient simulation
  },
});
