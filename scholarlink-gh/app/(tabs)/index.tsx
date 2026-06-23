import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View, Image, ScrollView, Pressable, Platform } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { AppButton } from "../../components/AppButton";
import { Screen } from "../../components/Screen";
import { ErrorState, LoadingState } from "../../components/StateView";
import { colors } from "../../constants/colors";
import { useAuth } from "../../hooks/useAuth";
import { aiService } from "../../services/aiService";
import { trackerService } from "../../services/trackerService";
import { ApplicationTracker, ScholarshipMatch } from "../../types/api";

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const [matches, setMatches] = useState<ScholarshipMatch[]>([]);
  const [trackers, setTrackers] = useState<ApplicationTracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, t] = await Promise.all([
        aiService.getScholarshipMatches().catch(() => []),
        trackerService.getTrackers().catch(() => []),
      ]);
      setMatches(m);
      setTrackers(t);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Screen scroll={false}><LoadingState /></Screen>;
  if (error) return <Screen scroll={false}><ErrorState message={error} onRetry={fetchData} /></Screen>;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRvtmHQiTXOAImqwe-ahJGbitOf0G8Se8v_0QVzxezn4DnNmnaHjFW0i2WfILemzft2jmVmjA3R1Y01ur4uZkvs2mgXeO_TS-Z0rwT3BRxIOOIW76XzEnP8-XUroiw6ESLQ9_GCQrstGgPfYmOX0hPaxckpwcIL4DupQ9SNnFdsdNOtQ2nzi3xgi8HyAl6QETHTp_vndDlyC3rloFdun9x88g0XCHtMJWm-8B6pT5V9dqlyGDaTX3G-XgTmNtx7WDic_oWSAyn_3Py" }} 
            style={styles.avatar} 
          />
          <View>
            <Text style={styles.greeting}>Hello, {user?.username ?? "Student"}!</Text>
            <Text style={styles.greetingSub}>Your career journey continues.</Text>
          </View>
        </View>
        <Pressable style={styles.iconBtn} onPress={() => router.push("/notifications")}>
          <Ionicons name="notifications-outline" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* AI Profile Score Card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreBgIcon}>
            <MaterialCommunityIcons name="brain" size={100} color="rgba(0,0,0,0.03)" />
          </View>
          <View style={styles.scoreContent}>
            <View style={styles.scoreRingContainer}>
              {/* Circular Progress Placeholder */}
              <View style={styles.scoreRingBg}>
                <View style={styles.scoreRingFill} />
                <View style={styles.scoreRingInner}>
                  <Text style={styles.scoreText}>95%</Text>
                </View>
              </View>
            </View>
            <View style={styles.scoreTextContainer}>
              <Text style={styles.scoreTitle}>Profile Strength</Text>
              <Text style={styles.scoreDesc}>Complete your profile for better scholarship matches.</Text>
              <Pressable style={styles.scoreAction} onPress={() => router.push("/profile-setup")}>
                <Text style={styles.scoreActionText}>Complete Profile</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Top Matches (Horizontal) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Matches</Text>
            <Pressable onPress={() => router.push("/(tabs)/scholarships")}>
              <Text style={styles.viewAllText}>View All</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {matches.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No matches yet. Complete your profile.</Text>
              </View>
            ) : (
              matches.slice(0, 5).map((match) => (
                <Pressable 
                  key={match.matchId} 
                  style={styles.matchCard}
                  onPress={() => router.push(`/scholarship/${match.scholarshipId}`)}
                >
                  <View style={styles.matchCardTop}>
                    <View style={styles.matchBadge}>
                      <Text style={styles.matchBadgeText}>{match.matchScore}% AI Match</Text>
                    </View>
                    <Ionicons name="bookmark-outline" size={20} color={colors.muted} />
                  </View>
                  <Text style={styles.matchTitle} numberOfLines={2}>{match.scholarshipName || `Scholarship #${match.scholarshipId}`}</Text>
                  <View style={styles.matchDetails}>
                    <Ionicons name="cash-outline" size={16} color={colors.muted} />
                    <Text style={styles.matchDetailsText}>Match Details</Text>
                  </View>
                  <View style={styles.matchCardBottom}>
                    <View style={styles.deadlineBadge}>
                      <Text style={styles.deadlineBadgeText}>Check deadline</Text>
                    </View>
                    <View style={styles.detailsBtn}>
                      <Text style={styles.detailsBtnText}>Details</Text>
                      <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>

        {/* Urgent Deadlines (Vertical) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Applications</Text>
          <View style={styles.verticalList}>
            {trackers.length === 0 ? (
              <Text style={styles.emptyText}>No applications tracked yet.</Text>
            ) : (
              trackers.slice(0, 3).map((tracker) => (
                <View key={tracker.id} style={styles.trackerCard}>
                  <View style={styles.trackerLeft}>
                    <View style={[styles.trackerIconBox, tracker.status === 'AWARDED' ? styles.trackerIconSuccess : tracker.status === 'REJECTED' ? styles.trackerIconDanger : styles.trackerIconWarning]}>
                      <Ionicons 
                        name={tracker.status === 'AWARDED' ? "trophy" : tracker.status === 'REJECTED' ? "close-circle" : "time"} 
                        size={24} 
                        color={tracker.status === 'AWARDED' ? "#005312" : tracker.status === 'REJECTED' ? "#ba1a1a" : "#723610"} 
                      />
                    </View>
                    <View>
                      <Text style={styles.trackerTitle}>Scholarship #{tracker.scholarshipId}</Text>
                      <View style={styles.trackerStatusRow}>
                        <Ionicons name="information-circle" size={14} color={colors.muted} />
                        <Text style={styles.trackerStatusText}>{tracker.status}</Text>
                      </View>
                    </View>
                  </View>
                  <Pressable style={styles.trackerArrow}>
                    <Ionicons name="arrow-forward" size={20} color={colors.primary} />
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Academic & Achievement Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Ready for your next step?</Text>
            <Text style={styles.bannerDesc}>Our AI coach is ready to help you prep for your scholarship interviews.</Text>
            <Pressable style={styles.bannerBtn} onPress={() => router.push("/ai-essay")}>
              <Text style={styles.bannerBtnText}>Start Coaching</Text>
            </Pressable>
          </View>
          <Image 
            source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwvVpPYIcVDTRuB8Ct0vNvt3gLpY1ec1QQchPVzfzHPos_Xhwuf0mBlh4hNt7hEevynqDsBfCgqeH9b-HyQoiu4yhAEclsQcr1OezAZRMz29Rszp0PQQ1ScEdjHJ7x39tBaM7pE4MdEqf14DAja0Jul04JRQfwwrkIDu0tvS0NsCSI9k1QL-sWk8jWAkFtgyWGvOIkqgZAzChsfi1FU-BTsvAi-Q14LJw_s3p8NjOJdYzcxnYby1vaRhpXEbXepD9WS6jI1qs7gfcT" }} 
            style={styles.bannerImg} 
          />
        </View>
        
        {/* Temporary Signout for testing */}
        <AppButton title="Sign Out" onPress={signOut} variant="ghost" style={{ marginTop: 24 }} />
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
    backgroundColor: colors.surface,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#d5e3ff",
  },
  greeting: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 20,
    color: colors.primary,
  },
  greetingSub: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
    color: colors.muted,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Room for bottom tabs
  },
  scoreCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    position: "relative",
    overflow: "hidden",
  },
  scoreBgIcon: {
    position: "absolute",
    right: -10,
    top: -10,
  },
  scoreContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    zIndex: 1,
  },
  scoreRingContainer: {
    width: 64,
    height: 64,
  },
  scoreRingBg: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
    backgroundColor: "#e2e2e7",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreRingFill: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 32,
    borderWidth: 6,
    borderColor: "#1b6d24",
    borderRightColor: "transparent",
    transform: [{ rotate: "45deg" }],
  },
  scoreRingInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreText: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 18,
    color: colors.primary,
  },
  scoreTextContainer: {
    flex: 1,
  },
  scoreTitle: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 18,
    color: colors.primary,
    marginBottom: 4,
  },
  scoreDesc: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 14,
    color: colors.muted,
    marginBottom: 8,
  },
  scoreAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scoreActionText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
    color: colors.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 20,
    color: colors.primary,
  },
  viewAllText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
    color: "#1b6d24", // secondary color
  },
  horizontalList: {
    gap: 16,
    paddingBottom: 8,
  },
  emptyCard: {
    width: 280,
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 14,
    color: colors.muted,
  },
  matchCard: {
    width: 280,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderTopWidth: 4,
    borderTopColor: colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    justifyContent: "space-between",
  },
  matchCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  matchBadge: {
    backgroundColor: "#a0f399", // secondary-container
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchBadgeText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
    color: "#005312",
  },
  matchTitle: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 18,
    color: colors.primary,
    minHeight: 48,
    marginBottom: 8,
  },
  matchDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
  },
  matchDetailsText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
    color: colors.muted,
  },
  matchCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  deadlineBadge: {
    backgroundColor: "#ffdad6", // error-container
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deadlineBadgeText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
    color: "#93000a",
  },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  detailsBtnText: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 14,
    color: colors.primary,
  },
  verticalList: {
    gap: 16,
  },
  trackerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  trackerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  trackerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  trackerIconWarning: { backgroundColor: "#ffdbca" },
  trackerIconDanger: { backgroundColor: "#ffdad6" },
  trackerIconSuccess: { backgroundColor: "#a0f399" },
  trackerTitle: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 18,
    color: colors.primary,
    marginBottom: 2,
  },
  trackerStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trackerStatusText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
    color: colors.muted,
  },
  trackerArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerContainer: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  bannerContent: {
    flex: 1,
    zIndex: 2,
  },
  bannerTitle: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 20,
    color: "#ffffff",
    marginBottom: 8,
  },
  bannerDesc: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 24,
  },
  bannerBtn: {
    backgroundColor: "#1b6d24", // secondary
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 24,
    alignSelf: "flex-start",
  },
  bannerBtnText: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 14,
    color: "#ffffff",
  },
  bannerImg: {
    width: 96,
    height: 120,
    zIndex: 2,
    resizeMode: "contain",
  },
});
