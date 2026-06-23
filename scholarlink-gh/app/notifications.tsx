import { router } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../constants/colors";

type NotificationType = 'alert' | 'success' | 'match' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  time: string;
  message: string;
  action?: string;
  chip?: { text: string; icon: keyof typeof Ionicons.glyphMap };
}

const NOTIFICATIONS_TODAY: Notification[] = [
  {
    id: "1",
    type: "alert",
    title: "Mastercard Foundation Scholars deadline is in 2 days!",
    time: "2h ago",
    message: "Complete your personal statement now.",
    chip: { text: "Closes in 2 days", icon: "timer-outline" },
  },
  {
    id: "2",
    type: "match",
    title: "New Scholarship Match: KNUST Merit Award",
    time: "5h ago",
    message: "Based on your 3.8 GPA, you are a strong candidate.",
  },
];

const NOTIFICATIONS_YESTERDAY: Notification[] = [
  {
    id: "3",
    type: "success",
    title: "Document Verified: Academic Transcript",
    time: "1d ago",
    message: "Your eligibility for 12 more scholarships is now confirmed.",
  },
];

const NOTIFICATIONS_EARLIER: Notification[] = [
  {
    id: "4",
    type: "info",
    title: "AI Coach: Review your CV",
    time: "2d ago",
    message: "I found a few ways to improve your leadership section.",
    action: "View Suggestions",
  },
];

const getNotificationStyle = (type: NotificationType) => {
  switch (type) {
    case 'alert':
      return {
        borderColor: colors.danger,
        iconBg: '#ffdad6', // error-container
        iconColor: colors.danger,
        iconName: 'alarm-outline' as keyof typeof Ionicons.glyphMap,
      };
    case 'success':
      return {
        borderColor: colors.success,
        iconBg: '#a0f399', // secondary-container
        iconColor: '#005312', // on-secondary-container
        iconName: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
      };
    case 'match':
      return {
        borderColor: colors.info,
        iconBg: '#d5e3ff', // primary-fixed
        iconColor: '#1f477b', // on-primary-fixed-variant
        iconName: 'sparkles-outline' as keyof typeof Ionicons.glyphMap,
      };
    case 'info':
    default:
      return {
        borderColor: '#ffb690', // tertiary-fixed-dim
        iconBg: '#ffdbca', // tertiary-fixed
        iconColor: '#723610', // on-tertiary-fixed-variant
        iconName: 'hardware-chip-outline' as keyof typeof Ionicons.glyphMap,
      };
  }
};

const NotificationCard = ({ item }: { item: Notification }) => {
  const style = getNotificationStyle(item.type);

  return (
    <Pressable style={({ pressed }) => [
      styles.card,
      { borderLeftColor: style.borderColor },
      pressed && styles.cardPressed
    ]}>
      <View style={[styles.iconContainer, { backgroundColor: style.iconBg }]}>
        <Ionicons name={style.iconName} size={24} color={style.iconColor} />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardTime}>{item.time}</Text>
        </View>
        <Text style={styles.cardMessage}>{item.message}</Text>
        
        {item.chip && (
          <View style={styles.chip}>
            <Ionicons name={item.chip.icon} size={14} color="#ffffff" />
            <Text style={styles.chipText}>{item.chip.text}</Text>
          </View>
        )}
        
        {item.action && (
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionText}>{item.action}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Today */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>New</Text>
            </View>
          </View>
          <View style={styles.list}>
            {NOTIFICATIONS_TODAY.map(item => <NotificationCard key={item.id} item={item} />)}
          </View>
        </View>

        {/* Yesterday */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yesterday</Text>
          <View style={styles.list}>
            {NOTIFICATIONS_YESTERDAY.map(item => <NotificationCard key={item.id} item={item} />)}
          </View>
        </View>

        {/* Earlier This Week */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earlier This Week</Text>
          <View style={styles.list}>
            {NOTIFICATIONS_EARLIER.map(item => <NotificationCard key={item.id} item={item} />)}
          </View>
        </View>

        {/* Motivation Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>You're on track!</Text>
          <Text style={styles.bannerText}>
            Complete 2 more applications this week to increase your chances by 40%.
          </Text>
          <Pressable style={styles.bannerButton} onPress={() => router.push("/(tabs)/applications")}>
            <Text style={styles.bannerButtonText}>Go to Applications</Text>
          </Pressable>
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
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: colors.surface,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 20,
    color: colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 18,
    color: colors.muted,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: "#d5e3ff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
    color: colors.primary,
  },
  list: {
    gap: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  cardTitle: {
    flex: 1,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 14,
    color: colors.ink,
    marginRight: 8,
  },
  cardTime: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 10,
    color: colors.muted,
  },
  cardMessage: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 14,
    color: colors.muted,
    marginBottom: 8,
  },
  chip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  chipText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
    color: "#ffffff",
  },
  actionButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  actionText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
    color: colors.primary,
  },
  banner: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 24,
    marginTop: 8,
  },
  bannerTitle: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 24,
    color: "#ffffff",
    marginBottom: 8,
  },
  bannerText: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 14,
    color: "#a7c8ff",
    marginBottom: 16,
  },
  bannerButton: {
    backgroundColor: colors.primaryDark,
    alignSelf: "flex-start",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  bannerButtonText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 14,
    color: "#ffffff",
  },
});
