import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View, Pressable, ScrollView, Platform, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Screen } from "../../components/Screen";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/StateView";
import { UserAvatar } from "../../components/UserAvatar";
import { colors } from "../../constants/colors";
import { trackerService } from "../../services/trackerService";
import { ApplicationTracker } from "../../types/api";

type TabKey = 'in-progress' | 'submitted' | 'interview' | 'awarded';

export default function ApplicationsScreen() {
  const [trackers, setTrackers] = useState<ApplicationTracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('in-progress');

  useEffect(() => {
    fetchTrackers();
  }, []);

  const fetchTrackers = async () => {
    setLoading(true);
    setError(null);
    try {
      setTrackers(await trackerService.getTrackers());
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTrackers = () => {
    return trackers.filter((t) => {
      const status = t.status || "RESEARCHING";
      switch (activeTab) {
        case 'in-progress':
          return status === 'RESEARCHING' || status === 'IN_PROGRESS';
        case 'submitted':
          return status === 'SUBMITTED' || status === 'REJECTED';
        case 'interview':
          return status === 'INTERVIEW';
        case 'awarded':
          return status === 'AWARDED';
        default:
          return false;
      }
    });
  };

  const getStatusColor = (status: ApplicationTracker['status']) => {
    switch (status) {
      case 'SUBMITTED': return { bg: '#d5e3ff', text: '#001b3c' };
      case 'IN_PROGRESS': return { bg: '#ffdbca', text: '#341100' };
      case 'AWARDED': return { bg: '#a3f69c', text: '#002204' };
      case 'INTERVIEW': return { bg: '#e8e8ed', text: '#1a1c1f' };
      case 'REJECTED': return { bg: '#ffdad6', text: '#93000a' };
      default: return { bg: '#f4f3f8', text: '#43474f' };
    }
  };

  if (loading && trackers.length === 0) return <Screen scroll={false}><LoadingState /></Screen>;
  if (error && trackers.length === 0) return <Screen scroll={false}><ErrorState message={error} onRetry={fetchTrackers} /></Screen>;

  const filtered = getFilteredTrackers();

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="menu" size={24} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>Scholarship Tracker</Text>
        </View>
        <UserAvatar size={32} style={styles.avatar} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBarWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
          {(['in-progress', 'submitted', 'interview', 'awarded'] as TabKey[]).map(tab => (
            <Pressable key={tab} style={styles.tabBtn} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
                {tab === 'in-progress' ? 'In Progress' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              {activeTab === tab && <View style={styles.activeTabIndicator} />}
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="add-circle-outline" size={48} color={colors.muted} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptyText}>Explore scholarships to add to this list.</Text>
          </View>
        ) : (
          filtered.map(tracker => {
            const status = tracker.status || "DRAFT";
            const name = tracker.scholarshipName || `Scholarship #${tracker.scholarshipId}`;
            const provider = tracker.scholarshipProvider || "Provider unknown";
            const days = tracker.deadlineCountdown;
            
            if (activeTab === 'awarded') {
              return (
                <View key={tracker.id} style={styles.awardedCard}>
                  <View style={styles.awardedCardHeader}>
                    <View style={styles.awardedBadge}>
                      <Text style={styles.awardedBadgeText}>CONGRATULATIONS!</Text>
                    </View>
                    <Ionicons name="star" size={20} color="#1b6d24" />
                  </View>
                  <View style={styles.awardedCardBody}>
                    <Text style={styles.cardTitle}>{name}</Text>
                    <Text style={styles.cardSubtitle}>{provider}</Text>
                    
                    <View style={styles.awardedAmountBox}>
                      <View>
                        <Text style={styles.awardedAmountLabel}>AMOUNT AWARDED</Text>
                        <Text style={styles.awardedAmountText}>Review Terms</Text>
                      </View>
                      <Ionicons name="cash" size={32} color="#1b6d24" style={{ opacity: 0.4 }} />
                    </View>
                    
                    <Pressable style={styles.btnPrimary}>
                      <Text style={styles.btnPrimaryText}>Next Steps</Text>
                    </Pressable>
                  </View>
                </View>
              );
            }

            if (activeTab === 'interview') {
              return (
                <View key={tracker.id} style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.cardHeaderLeft}>
                      <Text style={styles.cardTitle}>{name}</Text>
                      <Text style={styles.cardSubtitle}>{provider}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: '#ffdbca', borderColor: '#ffb690' }]}>
                      <Text style={[styles.badgeText, { color: '#723610' }]}>Interview Scheduled</Text>
                    </View>
                  </View>
                  
                  <View style={styles.interviewDetailsBox}>
                    <View style={styles.interviewDateBox}>
                      <Text style={styles.interviewDateMonth}>TBD</Text>
                      <Text style={styles.interviewDateDay}>-</Text>
                    </View>
                    <View>
                      <Text style={styles.interviewTimeText}>Pending Info</Text>
                      <Text style={styles.interviewViaText}>Awaiting schedule</Text>
                    </View>
                  </View>
                  
                  <Pressable style={[styles.btnPrimary, { backgroundColor: '#003366' }]} onPress={() => router.push("/ai-essay")}>
                    <Ionicons name="hardware-chip" size={20} color="#ffffff" />
                    <Text style={styles.btnPrimaryText}>Prep with AI Coach</Text>
                  </Pressable>
                </View>
              );
            }

            if (activeTab === 'submitted') {
              return (
                <View key={tracker.id} style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.cardHeaderLeft}>
                      <Text style={styles.cardTitle}>{name}</Text>
                      <Text style={styles.cardSubtitle}>{provider}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: status === 'REJECTED' ? '#ffdad6' : '#d5e3ff' }]}>
                      <Text style={[styles.badgeText, { color: status === 'REJECTED' ? '#ba1a1a' : '#1f477b' }]}>
                        {status === 'REJECTED' ? 'Rejected' : 'Reviewing'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.submittedDateBox}>
                    <Ionicons name="calendar-outline" size={18} color={colors.muted} style={{ marginRight: 8 }} />
                    <Text style={styles.submittedDateText}>Updated recently</Text>
                  </View>
                  
                  <Pressable style={styles.viewDetailsBtn} onPress={() => router.push({ pathname: '/scholarship/[id]', params: { id: String(tracker.scholarshipId) } })}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <Ionicons name="arrow-forward" size={18} color="#003366" />
                  </Pressable>
                </View>
              );
            }

            // In Progress
            return (
              <View key={tracker.id} style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={styles.cardTitle}>{name}</Text>
                    <Text style={styles.cardSubtitle}>{provider}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: 'rgba(89, 35, 0, 0.1)', borderColor: 'rgba(89, 35, 0, 0.2)' }]}>
                    <Text style={[styles.badgeText, { color: '#592300' }]}>{typeof days === 'number' ? `${days} days left` : 'Unknown deadline'}</Text>
                  </View>
                </View>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressTextRow}>
                    <Text style={styles.progressPercent}>In Progress</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: '50%' }]} />
                  </View>
                </View>
                
                <Pressable style={styles.btnPrimary} onPress={() => router.push({ pathname: '/scholarship/[id]', params: { id: String(tracker.scholarshipId) } })}>
                  <Ionicons name="pencil" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.btnPrimaryText}>Edit Application</Text>
                </Pressable>
              </View>
            );
          })
        )}

        {/* Dynamic Empty Content Placeholder */}
        {activeTab === 'in-progress' && filtered.length > 0 && (
          <View style={styles.discoverCard}>
            <Ionicons name="school" size={64} color="rgba(0, 51, 102, 0.4)" style={{ marginBottom: 8 }} />
            <Text style={styles.discoverTitle}>Discover New Opportunities</Text>
            <Text style={styles.discoverSubtitle}>Based on your profile, we found new scholarship matches for you.</Text>
            <Pressable style={styles.exploreBtn} onPress={() => router.push('/(tabs)/scholarships')}>
              <Text style={styles.exploreBtnText}>Explore matches</Text>
              <Ionicons name="arrow-forward" size={16} color="#003366" />
            </Pressable>
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 10,
    backgroundColor: "rgba(249, 249, 254, 0.85)", // glass-header effect
    zIndex: 40,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(195, 198, 209, 0.3)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 20,
    color: colors.primary,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#003366",
  },
  tabBarWrapper: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(195, 198, 209, 0.2)",
    zIndex: 30,
  },
  tabBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 12,
  },
  tabBtn: {
    position: "relative",
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  tabBtnText: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 16,
    color: "rgba(67, 71, 79, 0.6)", // on-surface-variant/60
  },
  tabBtnTextActive: {
    color: colors.primary,
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#003366",
    borderRadius: 99,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100, // Room for bottom tabs
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(195, 198, 209, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flex: 1,
    paddingRight: 12,
  },
  cardTitle: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 18,
    color: colors.primary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 14,
    color: colors.muted,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  badgeText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
  },
  progressContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressPercent: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 14,
    color: colors.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#e2e2e7",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#003366",
    borderRadius: 4,
  },
  btnPrimary: {
    height: 48,
    backgroundColor: "#001e40", // primary
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 16,
    color: "#ffffff",
  },
  submittedDateBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(195, 198, 209, 0.2)",
    marginTop: 16,
    marginBottom: 16,
  },
  submittedDateText: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 14,
    color: colors.muted,
  },
  viewDetailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewDetailsText: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 16,
    color: "#003366",
  },
  interviewDetailsBox: {
    backgroundColor: "#eeedf2", // surface-container
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  interviewDateBox: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(195, 198, 209, 0.4)",
  },
  interviewDateMonth: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 12,
    color: "#ba1a1a",
    textTransform: "uppercase",
  },
  interviewDateDay: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 24,
    color: colors.primary,
  },
  interviewTimeText: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 14,
    color: colors.primary,
  },
  interviewViaText: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 12,
    color: colors.muted,
  },
  awardedCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#a0f399", // secondary-container
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  awardedCardHeader: {
    backgroundColor: "rgba(160, 243, 153, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  awardedBadge: {
    backgroundColor: "#1b6d24", // secondary
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  awardedBadgeText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
    color: "#ffffff",
  },
  awardedCardBody: {
    padding: 16,
  },
  awardedAmountBox: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    backgroundColor: "rgba(226, 226, 231, 0.3)", // surface-variant/30
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 16,
  },
  awardedAmountLabel: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 10,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  awardedAmountText: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 24,
    color: "#1b6d24", // secondary
  },
  discoverCard: {
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#f4f3f8", // surface-container-low
    borderWidth: 1,
    borderColor: "rgba(195, 198, 209, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  discoverTitle: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 18,
    color: colors.primary,
    marginBottom: 4,
    textAlign: "center",
  },
  discoverSubtitle: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    maxWidth: 280,
    marginBottom: 16,
  },
  exploreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  exploreBtnText: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 14,
    color: "#003366",
  },
  emptyCard: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(195, 198, 209, 0.5)",
    borderStyle: "dashed",
    borderRadius: 16,
    marginTop: 24,
  },
  emptyTitle: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 18,
    color: colors.primary,
    marginBottom: 4,
  },
  emptyText: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
  },
});
