import { router } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../constants/colors";
import { useAuth } from "../hooks/useAuth";
import { UserAvatar } from "../components/UserAvatar";

const SETTINGS_ITEMS = [
  { id: 'personal', title: 'Personal Information', icon: 'person-outline' },
  { id: 'vault', title: 'Document Vault', icon: 'folder-open-outline' },
  { id: 'notifications', title: 'Notification Settings', icon: 'notifications-outline', route: '/notifications' },
  { id: 'security', title: 'Security & Password', icon: 'lock-closed-outline' },
];

export default function ProfileSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    // Redirect handled by root layout
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <Pressable style={styles.iconButton} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <UserAvatar size={128} style={styles.avatar} />
            <Pressable style={styles.editAvatarButton}>
              <Ionicons name="pencil" size={16} color="#ffffff" />
            </Pressable>
          </View>
          
          <Text style={styles.userName}>{user?.username || user?.email || "Student"}</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color={colors.muted} />
            <Text style={styles.locationText}>Location not set</Text>
          </View>

          <Pressable style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </Pressable>
        </View>

        {/* Premium Status Card */}
        <View style={styles.premiumCard}>
          <View style={styles.premiumHeader}>
            <View style={styles.premiumTextContainer}>
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>SCHOLARLINK PLUS</Text>
              </View>
              <Text style={styles.premiumTitle}>Unlock AI Essay Review</Text>
              <Text style={styles.premiumSubtitle}>
                Get personalized feedback on your applications and scholarship essays.
              </Text>
            </View>
            <View style={styles.premiumIconContainer}>
              <Ionicons name="sparkles" size={24} color="#ffffff" />
            </View>
          </View>

          <View style={styles.premiumFooter}>
            <View>
              <Text style={styles.premiumStatusLabel}>STATUS</Text>
              <Text style={styles.premiumStatusValue}>Active</Text>
            </View>
            <Pressable style={styles.premiumButton}>
              <Text style={styles.premiumButtonText}>VIEW BENEFITS</Text>
            </Pressable>
          </View>
        </View>

        {/* Settings List */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT SETTINGS</Text>
          <View style={styles.card}>
            {SETTINGS_ITEMS.map((item, index) => (
              <Pressable
                key={item.id}
                style={[
                  styles.settingsItem,
                  index < SETTINGS_ITEMS.length - 1 && styles.borderBottom
                ]}
                onPress={() => {
                  if (item.route) {
                    router.push(item.route as any);
                  }
                }}
              >
                <View style={styles.settingsItemLeft}>
                  <View style={styles.settingsIconContainer}>
                    <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.settingsItemText}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.border} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SUPPORT</Text>
          <View style={styles.card}>
            <Pressable style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <View style={styles.settingsIconContainer}>
                  <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
                </View>
                <Text style={styles.settingsItemText}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.border} />
            </Pressable>
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
          <Text style={styles.versionText}>ScholarLink GH v2.4.0</Text>
        </View>

      </ScrollView>
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
    height: 56,
    backgroundColor: colors.surface,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 20,
    color: colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: "#d5e3ff",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  userName: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 24,
    color: colors.primary,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
  },
  locationText: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 14,
    color: colors.muted,
  },
  editProfileButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: "100%",
    maxWidth: 240,
    alignItems: "center",
  },
  editProfileText: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 18,
    color: "#ffffff",
  },
  premiumCard: {
    backgroundColor: "#003366", // primary-container
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  premiumHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  premiumTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  premiumBadge: {
    backgroundColor: "#a0f399", // secondary-container
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  premiumBadgeText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 10,
    color: "#005312",
  },
  premiumTitle: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 18,
    color: "#ffffff",
    marginBottom: 4,
  },
  premiumSubtitle: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  premiumIconContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 8,
  },
  premiumFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 16,
  },
  premiumStatusLabel: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
  },
  premiumStatusValue: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 18,
    color: "#ffffff",
  },
  premiumButton: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  premiumButtonText: {
    fontFamily: "BeVietnamPro_700Bold",
    fontSize: 12,
    color: "#003366",
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
    color: colors.muted,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: colors.surface,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceMuted,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  settingsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsItemText: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 18,
    color: colors.ink,
  },
  logoutSection: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  logoutButton: {
    height: 48,
    borderWidth: 1,
    borderColor: "rgba(186, 26, 26, 0.2)",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 18,
    color: colors.danger,
  },
  versionText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
    marginTop: 24,
  },
});
