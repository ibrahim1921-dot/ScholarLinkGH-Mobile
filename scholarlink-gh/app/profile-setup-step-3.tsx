import { router, Stack } from "expo-router";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../constants/colors";
import { profileService } from "../services/profileService";
import { useQueryClient } from "@tanstack/react-query";

const TESTS = ["WASSCE", "IELTS", "SAT", "GRE"];

export default function ProfileSetupStep3Screen() {
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const [selectedTests, setSelectedTests] = useState<string[]>(["IELTS"]);
  const [languageLevel, setLanguageLevel] = useState("Fluent");
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await profileService.getProfile();
        if (profile.languageProficiency) {
          const eng = profile.languageProficiency.split(',').find(l => l.startsWith('English:'));
          if (eng) setLanguageLevel(eng.split(':')[1]);
        }
      } catch (e) {
        // Ignore if profile doesn't exist
      } finally {
        setFetching(false);
      }
    };
    loadProfile();
  }, []);

  const toggleTest = (test: string) => {
    if (selectedTests.includes(test)) {
      setSelectedTests(selectedTests.filter((t) => t !== test));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await profileService.updateProfile({
        language_proficiency: `English:${languageLevel}`,
      });
      queryClient.invalidateQueries({ queryKey: ['profileCompleteness'] });
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {fetching && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 100, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', color: colors.primary }}>Loading...</Text>
        </View>
      )}
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.replace("/(tabs)")} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.primary} />
          </Pressable>
        </View>
        <Text style={styles.headerCenter}>ScholarLink GH</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressStep}>Step 3 of 3</Text>
            <Text style={styles.progressPercent}>95% complete</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: "95%" }]} />
          </View>
        </View>

        {/* Robot Celebration Element */}
        <View style={styles.celebrationBox}>
          <View style={styles.robotIcon}>
            <Ionicons name="hardware-chip-outline" size={28} color="#ffffff" />
          </View>
          <View style={styles.celebrationTextContainer}>
            <Text style={styles.celebrationTitle}>Almost done!</Text>
            <Text style={styles.celebrationText}>You're doing great, let's wrap this up.</Text>
          </View>
        </View>

        {/* Headline */}
        <View style={styles.headlineContainer}>
          <Text style={styles.headline}>Final details</Text>
          <Text style={styles.subhead}>You're almost there! Just a few more details to unlock your matches.</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Language Proficiency */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Language Proficiency</Text>
            
            <View style={styles.languageCard}>
              <View style={styles.languageInfo}>
                <Ionicons name="language-outline" size={24} color={colors.muted} />
                <View style={styles.languageTextContainer}>
                  <Text style={styles.languageName}>English</Text>
                  <Text style={styles.languageLevel}>Primary Language</Text>
                </View>
              </View>
              <Pressable style={styles.languageSelect} onPress={() => setLanguageLevel(languageLevel === "Fluent" ? "Intermediate" : "Fluent")}>
                <Text style={styles.languageSelectText}>{languageLevel}</Text>
                <Ionicons name="chevron-down" size={16} color={colors.primary} />
              </Pressable>
            </View>

            <View style={styles.languageCard}>
              <View style={styles.languageInfo}>
                <Ionicons name="globe-outline" size={24} color={colors.muted} />
                <View style={styles.languageTextContainer}>
                  <Text style={styles.languageName}>French</Text>
                </View>
              </View>
              <Pressable style={styles.languageSelect}>
                <Text style={styles.languageSelectText}>Basic</Text>
                <Ionicons name="chevron-down" size={16} color={colors.primary} />
              </Pressable>
            </View>

            <Pressable style={styles.addLanguageButton}>
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text style={styles.addLanguageText}>Add another language</Text>
            </Pressable>
          </View>

          {/* Standardized Tests */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Standardized Tests</Text>
            <View style={styles.testsGrid}>
              {TESTS.map((test) => {
                const isSelected = selectedTests.includes(test);
                return (
                  <Pressable
                    key={test}
                    style={styles.testItem}
                    onPress={() => toggleTest(test)}
                  >
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                      {isSelected && <Ionicons name="checkmark" size={16} color="#ffffff" />}
                    </View>
                    <Text style={styles.testItemText}>{test}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* File Upload */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Upload CV/Transcript</Text>
            <Pressable style={styles.uploadZone}>
              <View style={styles.uploadIconContainer}>
                <Ionicons name="cloud-upload-outline" size={28} color={colors.primary} />
              </View>
              <Text style={styles.uploadTitle}>Tap to select files</Text>
              <Text style={styles.uploadSubtitle}>PDF, DOCX up to 5MB</Text>
            </Pressable>

            {/* Uploaded File Preview */}
            <View style={styles.filePreview}>
              <View style={styles.fileInfo}>
                <Ionicons name="document-text" size={24} color={colors.primary} />
                <View style={styles.fileTextContainer}>
                  <Text style={styles.fileName} numberOfLines={1}>Aba_Mensah_CV_2024.pdf</Text>
                  <Text style={styles.fileStatus}>READY TO UPLOAD</Text>
                </View>
              </View>
              <Pressable style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </Pressable>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Footer Nav */}
      <View style={[styles.footerNav, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable style={styles.navButtonSecondary} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text style={styles.navButtonSecondaryText}>Back</Text>
        </Pressable>
        <Pressable
          style={[styles.navButtonFinish, loading && { opacity: 0.7 }]}
          onPress={handleFinish}
          disabled={loading}
        >
          <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
          <Text style={styles.navButtonFinishText}>{loading ? 'Saving...' : 'Finish'}</Text>
        </Pressable>
      </View>
      </KeyboardAvoidingView>
    </View>
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
    minHeight: 56,
    backgroundColor: colors.surface,
  },
  headerLeft: {
    width: 40,
  },
  closeButton: {
    padding: 4,
  },
  headerCenter: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 20,
    color: colors.primary,
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  progressStep: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  progressPercent: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 14,
    color: colors.success,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.success,
  },
  celebrationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(160, 243, 153, 0.2)", // secondary-container/20
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(27, 109, 36, 0.1)", // secondary/10
    marginBottom: 24,
    gap: 16,
  },
  robotIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  celebrationTextContainer: {
    flex: 1,
  },
  celebrationTitle: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 18,
    color: colors.primary,
    marginBottom: 2,
  },
  celebrationText: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 14,
    color: colors.muted,
  },
  headlineContainer: {
    marginBottom: 24,
  },
  headline: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 32,
    color: colors.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subhead: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 16,
    color: colors.muted,
  },
  formContainer: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 18,
    color: colors.primary,
    marginBottom: 4,
  },
  languageCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    padding: 16,
  },
  languageInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  languageTextContainer: {
    justifyContent: "center",
  },
  languageName: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 16,
    color: colors.primary,
  },
  languageLevel: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  languageSelect: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  languageSelectText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 14,
    color: colors.primary,
  },
  addLanguageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
  },
  addLanguageText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 14,
    color: colors.primary,
  },
  testsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  testItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  testItemText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 14,
    color: colors.primary,
  },
  uploadZone: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
  },
  uploadIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadTitle: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 16,
    color: colors.primary,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 12,
    color: colors.muted,
  },
  filePreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 51, 102, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(0, 51, 102, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  fileTextContainer: {
    flex: 1,
  },
  fileName: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 14,
    color: colors.primary,
  },
  fileStatus: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 10,
    color: colors.muted,
    textTransform: "uppercase",
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  footerNav: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
    gap: 16,
  },
  navButtonSecondary: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
  },
  navButtonSecondaryText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
  },
  navButtonFinish: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    backgroundColor: colors.success,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtonFinishText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
    color: "#ffffff",
    marginTop: 2,
  },
});
