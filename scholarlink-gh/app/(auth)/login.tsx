import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../../components/AppButton";
import { AppTextInput } from "../../components/AppTextInput";
import { Screen } from "../../components/Screen";
import { SectionHeader } from "../../components/SectionHeader";
import { colors } from "../../constants/colors";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../services/apiClient";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/(tabs)");
    } catch (e) {
      Alert.alert("Login Failed", getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.headerContainer}>
        <View style={styles.logoContainer}>
          <Image 
            source={require("../../assets/images/scholarlink_logo.png")} 
            style={styles.logo} 
            resizeMode="contain" 
          />
        </View>
        <SectionHeader
          title="Welcome Back"
          subtitle="Continue your journey to academic and professional excellence."
        />
      </View>
      <View style={styles.formContainer}>
        <AppTextInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder=" "
        />
        <AppTextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder=" "
        />
        <View style={styles.forgotPasswordContainer}>
          <Link href="/(auth)/register" style={styles.forgotPasswordLink}>
            Forgot Password?
          </Link>
        </View>
      </View>
      <View style={styles.actionContainer}>
        <AppButton title="Login" onPress={submit} loading={loading} />
        
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <AppButton 
          title="Sign in with Google" 
          onPress={() => {}} 
          variant="secondary"
          icon={<Ionicons name="logo-google" size={18} color={colors.primary} />}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to ScholarLink? </Text>
          <Link href="/(auth)/register" style={styles.footerLink}>
            Register
          </Link>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerContainer: { 
    marginTop: 40, 
    marginBottom: 32,
    alignItems: "center",
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#d5e3ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logo: {
    width: 64,
    height: 64,
  },
  formContainer: { gap: 16 },
  forgotPasswordContainer: {
    alignItems: "flex-end",
  },
  forgotPasswordLink: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: "BeVietnamPro_600SemiBold",
  },
  actionContainer: { marginTop: 32, gap: 16 },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: 12,
    color: colors.muted,
    fontSize: 12,
    fontFamily: "BeVietnamPro_600SemiBold",
  },
  footer: { 
    alignItems: "center", 
    flexDirection: "row", 
    justifyContent: "center",
    marginTop: 16,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(195, 198, 209, 0.3)",
  },
  footerText: {
    color: colors.muted,
    fontSize: 14,
    fontFamily: "BeVietnamPro_400Regular",
  },
  footerLink: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
});
