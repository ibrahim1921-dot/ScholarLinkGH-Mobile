import { router, Stack } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../constants/colors";
import { UserAvatar } from "../components/UserAvatar";

export default function AIEssayScreen() {
  const insets = useSafeAreaInsets();
  const [promptText, setPromptText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </Pressable>
          <UserAvatar size={32} style={{ marginRight: 4 }} />
          <Text style={styles.headerTitle}>ScholarLink GH</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        {/* Header Info */}
        <View style={styles.headerInfo}>
          <Text style={styles.pageTitle}>AI Essay Assistant</Text>
          <Text style={styles.pageSubtitle}>Draft powerful scholarship essays tailored to your profile in seconds.</Text>
        </View>

        {/* Input Prompts Area */}
        <View style={styles.inputArea}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>SCHOLARSHIP PROMPT</Text>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Paste the essay question here..."
              placeholderTextColor={colors.muted}
              value={promptText}
              onChangeText={setPromptText}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>KEY POINTS TO INCLUDE</Text>
            <View style={styles.tagsContainer}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Leadership Experience</Text>
                <Ionicons name="close" size={14} color="#003366" />
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Financial Need</Text>
                <Ionicons name="close" size={14} color="#003366" />
              </View>
              <Pressable style={styles.addTagButton}>
                <Ionicons name="add" size={14} color={colors.muted} />
                <Text style={styles.addTagText}>Add point</Text>
              </Pressable>
            </View>
          </View>

          <Pressable style={styles.generateButton} onPress={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Ionicons name="reload" size={20} color="#ffffff" style={styles.spinIcon} />
                <Text style={styles.generateButtonText}>Thinking...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#ffffff" />
                <Text style={styles.generateButtonText}>Generate Draft</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* AI Draft Section */}
        <View style={styles.draftSection}>
          <View style={styles.draftHeader}>
            <Text style={styles.draftTitle}>Generated Draft</Text>
            <View style={styles.aiBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#005312" />
              <Text style={styles.aiBadgeText}>AI Optimized</Text>
            </View>
          </View>

          <View style={styles.editorContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.editorToolbar}>
              <Pressable style={styles.toolbarButton}>
                <Ionicons name="color-wand-outline" size={18} color={colors.muted} />
                <Text style={styles.toolbarText}>Refine Tone</Text>
              </Pressable>
              <Pressable style={styles.toolbarButton}>
                <Ionicons name="checkmark-done-outline" size={18} color={colors.muted} />
                <Text style={styles.toolbarText}>Grammar</Text>
              </Pressable>
              <Pressable style={styles.toolbarButton}>
                <Ionicons name="contract-outline" size={18} color={colors.muted} />
                <Text style={styles.toolbarText}>Shorten</Text>
              </Pressable>
              <Pressable style={styles.toolbarButton}>
                <Ionicons name="expand-outline" size={18} color={colors.muted} />
                <Text style={styles.toolbarText}>Lengthen</Text>
              </Pressable>
            </ScrollView>

            <View style={styles.editorContent}>
              <Text style={styles.draftParagraph}>
                Throughout my academic journey in Ghana, I have consistently sought opportunities to lead and inspire my peers. As the President of the Science Club, I spearheaded a community outreach program that introduced STEM concepts to local junior high school students...
              </Text>
              <Text style={styles.draftParagraph}>
                My financial situation has presented challenges, but it has only strengthened my resolve to succeed. Coming from a household where education is highly valued but resources are scarce, I have learned the importance of perseverance and strategic planning...
              </Text>
              <Text style={styles.draftParagraph}>
                I am confident that this scholarship will not only alleviate my financial burden but also provide the necessary platform to grow into a leader who gives back to the Ghanaian community.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Final Action */}
      <View style={styles.footerAction}>
        <Pressable style={styles.saveButton}>
          <Ionicons name="folder-open" size={20} color="#ffffff" />
          <Text style={styles.saveButtonText}>Save to Document Vault</Text>
        </Pressable>
      </View>
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
    paddingHorizontal: 16,
    minHeight: 56,
    backgroundColor: colors.surface,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backButton: {
    padding: 4,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#d5e3ff", // primary-fixed
    overflow: "hidden",
    marginRight: 4,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  headerTitle: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 18,
    color: colors.primary,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100, // Make room for fixed bottom action
  },
  headerInfo: {
    marginBottom: 24,
  },
  pageTitle: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 24,
    color: colors.primary,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 14,
    color: colors.muted,
  },
  inputArea: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 10,
    color: colors.primary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  textInput: {
    minHeight: 100,
    backgroundColor: colors.surfaceMuted,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 14,
    color: colors.ink,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#003366", // primary-container
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  tagText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
    color: "#ffffff", // on-primary-container
  },
  addTagButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  addTagText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
    color: colors.muted,
  },
  generateButton: {
    height: 48,
    backgroundColor: "#3a5f94", // surface-tint (used to simulate gradient)
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  generateButtonText: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 16,
    color: "#ffffff",
  },
  spinIcon: {
    // In a real app we'd use Animated.loop but for now a static icon
  },
  draftSection: {
    marginBottom: 24,
  },
  draftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  draftTitle: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 18,
    color: colors.primary,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#a0f399", // secondary-container
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  aiBadgeText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 10,
    color: "#005312", // on-secondary-container
  },
  editorContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  editorToolbar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 16,
  },
  toolbarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  toolbarText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
    color: colors.muted,
  },
  editorContent: {
    padding: 16,
    minHeight: 250,
  },
  draftParagraph: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 16,
    color: colors.ink,
    lineHeight: 24,
    marginBottom: 16,
  },
  footerAction: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(249, 249, 254, 0.9)", // slightly transparent surface
  },
  saveButton: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 16,
    color: "#ffffff",
  },
});
