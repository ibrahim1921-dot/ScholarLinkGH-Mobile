import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, ScrollView, Pressable, Modal, ImageBackground, ActivityIndicator } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";


import { Screen } from "../../components/Screen";
import { ErrorState, LoadingState } from "../../components/StateView";
import { UserAvatar } from "../../components/UserAvatar";
import { CircularProgress } from "../../components/CircularProgress";
import { colors } from "../../constants/colors";
import { useAuth } from "../../hooks/useAuth";
import { aiService } from "../../services/aiService";
import { trackerService } from "../../services/trackerService";
import { profileService } from "../../services/profileService";
import { ApplicationTracker, ScholarshipMatch } from "../../types/api";
import { useQuery } from "@tanstack/react-query";
import { useSavedScholarships, useToggleSaveScholarship } from "../../hooks/useScholarship";

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  // Extract first name from username (take first word), fall back to "Student"
  const displayName = (() => {
    const username = user?.username;
    if (username) {
      return username.split(' ')[0];
    }
    return 'Student';
  })();
  const [matches, setMatches] = useState<ScholarshipMatch[]>([]);
  const [trackers, setTrackers] = useState<ApplicationTracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [matchCooldown, setMatchCooldown] = useState(0);
  const [matchError, setMatchError] = useState<string | null>(null);

  const { data: savedScholarships } = useSavedScholarships();
  const toggleSaveMutation = useToggleSaveScholarship();

  const { data: completenessData } = useQuery({
    queryKey: ['profileCompleteness'],
    queryFn: profileService.getProfileCompleteness,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const completenessScore = completenessData?.completeness ?? 0;
  const nextStep = completenessData?.nextStep ?? "/profile-setup";

  const handleProfilePress = () => {
    if (menuVisible) setMenuVisible(false);
    if (completenessScore === 100) {
      router.push("/profile-summary");
    } else {
      router.push(nextStep as any);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (matchCooldown > 0) {
      const timer = setTimeout(() => setMatchCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [matchCooldown]);

  const handleFindMatches = async () => {
    if (isMatching || matchCooldown > 0) return;
    setIsMatching(true);
    setMatchError(null);
    try {
      const m = await aiService.getScholarshipMatches();
      setMatches(m);
      setMatchCooldown(30);
    } catch (e: any) {
      setMatchError(e?.message ?? "Failed to find matches");
    } finally {
      setIsMatching(false);
    }
  };

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
      <ImageBackground
        source={require("../../assets/images/header-home.jpg")}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
        imageStyle={{ resizeMode: "cover" }}
      >
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary, opacity: 0.65 }]} />
        <View style={styles.headerLeft}>
          <UserAvatar size={48} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { color: '#ffffff' }]} numberOfLines={1} ellipsizeMode="tail">Hello, {displayName}!</Text>
            <Text style={[styles.greetingSub, { color: 'rgba(255, 255, 255, 0.8)' }]}>Your career journey continues.</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconBtn} onPress={() => router.push("/notifications")}>
            <Ionicons name="notifications-outline" size={24} color="#ffffff" />
          </Pressable>
          <Pressable style={[styles.profileIcon, { borderColor: '#ffffff' }]} onPress={() => setMenuVisible(true)}>
            <Ionicons name="person-outline" size={20} color="#ffffff" />
          </Pressable>
        </View>
      </ImageBackground>

      {/* Profile Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuContainer, { top: insets.top + 60 }]}>
            <Pressable
              style={styles.menuItem}
              onPress={() => { setMenuVisible(false); router.push("/profile-settings"); }}
            >
              <Ionicons name="person-outline" size={20} color={colors.primary} />
              <Text style={styles.menuItemText}>View Profile</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable
              style={styles.menuItem}
              onPress={handleProfilePress}
            >
              <Ionicons name="create-outline" size={20} color={colors.primary} />
              <Text style={styles.menuItemText}>Complete Profile</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable
              style={styles.menuItem}
              onPress={() => { setMenuVisible(false); router.push("/profile-settings"); }}
            >
              <Ionicons name="settings-outline" size={20} color={colors.primary} />
              <Text style={styles.menuItemText}>Settings</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable
              style={styles.menuItem}
              onPress={() => { setMenuVisible(false); signOut(); }}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.danger} />
              <Text style={[styles.menuItemText, { color: colors.danger }]}>Sign Out</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Priority Zone */}
        {(() => {
          const urgentTracker = trackers
            .filter(t => t.deadlineCountdown >= 0 && t.deadlineCountdown <= 14 && (t.status === 'RESEARCHING' || t.status === 'IN_PROGRESS'))
            .sort((a, b) => a.deadlineCountdown - b.deadlineCountdown)[0];

          if (completenessScore < 100) {
            return (
              <Pressable style={[styles.priorityCard, styles.priorityIncomplete]} onPress={handleProfilePress}>
                <View style={styles.priorityContent}>
                  <Text style={styles.priorityTitle}>Complete your profile</Text>
                  <Text style={styles.priorityDesc}>Your profile is {completenessScore}% complete. Finish it to get accurate scholarship matches.</Text>
                  <View style={styles.priorityAction}>
                    <Text style={styles.priorityActionText}>Continue Setup</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                  </View>
                </View>
                <CircularProgress
                  percentage={completenessScore}
                  size={64}
                  strokeWidth={6}
                  color={colors.primary}
                  backgroundColor="rgba(27, 109, 36, 0.1)"
                >
                  <View style={styles.scoreRingInner}>
                    <Text style={styles.scoreText}>{completenessScore}%</Text>
                  </View>
                </CircularProgress>
              </Pressable>
            );
          }

          if (urgentTracker) {
            return (
              <Pressable 
                style={[styles.priorityCard, styles.priorityUrgent]} 
                onPress={() => router.push({ pathname: '/application/[trackerId]' as any, params: { trackerId: String(urgentTracker.id) } })}
              >
                <View style={styles.priorityIconBg}>
                  <Ionicons name="warning" size={32} color="#ba1a1a" />
                </View>
                <View style={styles.priorityContent}>
                  <Text style={styles.priorityTitle}>Deadline Approaching</Text>
                  <Text style={styles.priorityDesc}>
                    <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }}>{urgentTracker.scholarshipName || `Scholarship #${urgentTracker.scholarshipId}`}</Text> closes in {urgentTracker.deadlineCountdown} days. Finish your application!
                  </Text>
                  <View style={styles.priorityAction}>
                    <Text style={[styles.priorityActionText, { color: '#ba1a1a' }]}>Resume Application</Text>
                    <Ionicons name="arrow-forward" size={16} color="#ba1a1a" />
                  </View>
                </View>
              </Pressable>
            );
          }

          return (
            <View style={[styles.priorityCard, styles.priorityCaughtUp]}>
              <View style={styles.priorityIconBgSuccess}>
                <Ionicons name="checkmark-circle" size={32} color="#005312" />
              </View>
              <View style={styles.priorityContent}>
                <Text style={styles.priorityTitle}>You're all caught up</Text>
                <Text style={styles.priorityDesc}>Your profile is complete and you have no urgent deadlines. Keep exploring!</Text>
              </View>
            </View>
          );
        })()}

        {/* Quick Stats Row */}
        <View style={styles.quickStatsRow}>
          <Text style={styles.quickStatsText}>
            {matches.length} Matches  ·  {trackers.filter(t => t.status === 'RESEARCHING' || t.status === 'IN_PROGRESS').length} In Progress  ·  {savedScholarships?.length ?? 0} Saved
          </Text>
        </View>

        {/* Top Matches (Horizontal) */}
        {(matches.length > 0 || completenessScore === 100) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Matches</Text>
              {matches.length > 0 && (
                <Pressable onPress={() => router.push("/(tabs)/scholarships")}>
                  <Text style={styles.viewAllText}>View All</Text>
                </Pressable>
              )}
            </View>

            {matches.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                {matches.slice(0, 5).map((match) => (
                  <Pressable
                    key={match.matchId}
                    style={styles.matchCard}
                    onPress={() => router.push(`/scholarship/${match.scholarshipId}`)}
                  >
                    <View style={styles.matchCardTop}>
                      <View style={styles.matchBadge}>
                        <Text style={styles.matchBadgeText}>{match.matchScore}% AI Match</Text>
                      </View>
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleSaveMutation.mutate(match.scholarshipId);
                        }}
                        hitSlop={10}
                      >
                        <Ionicons
                          name={savedScholarships?.some(s => s.id === match.scholarshipId) ? "bookmark" : "bookmark-outline"}
                          size={20}
                          color={savedScholarships?.some(s => s.id === match.scholarshipId) ? colors.primary : colors.muted}
                        />
                      </Pressable>
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
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyMatchesContainer}>
                <Ionicons name="search-outline" size={48} color={colors.muted} style={{ marginBottom: 16 }} />
                <Text style={styles.emptyMatchesTitle}>No matches yet</Text>
                <Text style={styles.emptyMatchesDesc}>We couldn't find any fresh matches for you. Try searching now.</Text>
                <Pressable 
                  style={[styles.findMatchesBtn, (isMatching || matchCooldown > 0) && styles.findMatchesBtnDisabled]} 
                  onPress={handleFindMatches}
                  disabled={isMatching || matchCooldown > 0}
                >
                  {isMatching ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.findMatchesBtnText}>
                      {matchCooldown > 0 ? `Try again in ${matchCooldown}s` : "Find My Matches"}
                    </Text>
                  )}
                </Pressable>
                {matchError ? <Text style={styles.matchErrorText}>{matchError}</Text> : null}
              </View>
            )}
          </View>
        )}

        {/* Urgent Deadlines (Vertical) */}
        {trackers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Applications</Text>
            <View style={styles.verticalList}>
              {trackers.slice(0, 3).map((tracker) => (
                <Pressable
                  key={tracker.id}
                  style={({ pressed }) => [styles.trackerCard, pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }]}
                  onPress={() => router.push({ pathname: '/application/[trackerId]' as any, params: { trackerId: String(tracker.id) } })}
                >
                  <View style={styles.trackerLeft}>
                    <View style={[styles.trackerIconBox, tracker.status === 'AWARDED' ? styles.trackerIconSuccess : tracker.status === 'REJECTED' ? styles.trackerIconDanger : styles.trackerIconWarning]}>
                      <Ionicons
                        name={tracker.status === 'AWARDED' ? "trophy" : tracker.status === 'REJECTED' ? "close-circle" : "time"}
                        size={24}
                        color={tracker.status === 'AWARDED' ? "#005312" : tracker.status === 'REJECTED' ? "#ba1a1a" : "#723610"}
                      />
                    </View>
                    <View>
                      <Text style={styles.trackerTitle}>{tracker.scholarshipName || `Scholarship #${tracker.scholarshipId}`}</Text>
                      <View style={styles.trackerStatusRow}>
                        <Ionicons name="information-circle" size={14} color={colors.muted} />
                        <Text style={styles.trackerStatusText}>{tracker.status}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.trackerArrow}>
                    <Ionicons name="arrow-forward" size={20} color={colors.primary} />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Compact AI Coach Banner */}
        <Pressable style={styles.aiCoachSmallCard} onPress={() => router.push("/ai-essay")}>
          <View style={styles.aiCoachIconBg}>
            <MaterialCommunityIcons name="brain" size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiCoachTitle}>AI Essay Coach</Text>
            <Text style={styles.aiCoachDesc}>Practice your interview & essay</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </Pressable>

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
    paddingBottom: 10,
    backgroundColor: colors.surface,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  menuContainer: {
    position: "absolute",
    right: 20,
    width: 220,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemText: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 15,
    color: colors.ink,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.surfaceMuted,
    marginHorizontal: 16,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120, // Room for bottom tabs
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
  // Priority Zone Styles
  priorityCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  priorityIncomplete: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(27, 109, 36, 0.2)",
  },
  priorityUrgent: {
    backgroundColor: "#fff0ec", // very light red/amber
    borderWidth: 1,
    borderColor: "#ffdad6",
  },
  priorityCaughtUp: {
    backgroundColor: "#f4fdf4", // very light green
    borderWidth: 1,
    borderColor: "#a0f399",
  },
  priorityContent: {
    flex: 1,
    paddingRight: 16,
  },
  priorityTitle: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 18,
    color: colors.ink,
    marginBottom: 6,
  },
  priorityDesc: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 14,
    color: colors.muted,
    marginBottom: 12,
    lineHeight: 20,
  },
  priorityAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priorityActionText: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 14,
    color: colors.primary,
  },
  priorityIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ffdad6",
    alignItems: "center",
    justifyContent: "center",
  },
  priorityIconBgSuccess: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#a0f399",
    alignItems: "center",
    justifyContent: "center",
  },
  
  // Quick Stats Row
  quickStatsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
    paddingVertical: 8,
  },
  quickStatsText: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 13,
    color: colors.muted,
    letterSpacing: 0.5,
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
    backgroundColor: "#ffdbca", // warning-container (amber)
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deadlineBadgeText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
    color: "#723610", // on-warning-container
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
  // Compact AI Coach Banner
  aiCoachSmallCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    marginTop: 8,
  },
  aiCoachIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(27, 109, 36, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  aiCoachTitle: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 16,
    color: colors.primary,
    marginBottom: 2,
  },
  aiCoachDesc: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 13,
    color: colors.muted,
  },
  // Empty Matches State
  emptyMatchesContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  emptyMatchesTitle: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 18,
    color: colors.ink,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyMatchesDesc: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  findMatchesBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    minWidth: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  findMatchesBtnDisabled: {
    backgroundColor: colors.muted,
  },
  findMatchesBtnText: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 15,
    color: "#ffffff",
  },
  matchErrorText: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 13,
    color: colors.danger,
    marginTop: 12,
    textAlign: "center",
  },
});
