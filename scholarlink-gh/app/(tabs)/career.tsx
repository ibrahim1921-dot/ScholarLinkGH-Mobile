import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert, FlatList, Linking, StyleSheet, Text, View, Pressable, TextInput, ScrollView, Platform, Image, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../../components/Screen';
import { EmptyState, ErrorState, LoadingState } from '../../components/StateView';
import { UserAvatar } from '../../components/UserAvatar';
import { colors } from '../../constants/colors';
import { jobService } from '../../services/jobService';
import { aiService } from '../../services/aiService';
import { JobListing } from '../../types/api';
import { useSavedScholarships, useToggleSaveScholarship } from '../../hooks/useScholarship';

export default function CareerScreen() {
  const insets = useSafeAreaInsets();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Roles');

  const { data: savedScholarships } = useSavedScholarships();
  const toggleSaveMutation = useToggleSaveScholarship();

  const filters = ['All Roles', 'Internships', 'Entry Level', 'Graduate Roles', 'Remote'];

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await jobService.getJobs();
      setJobs(result.content);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (job: JobListing) => {
    setApplyingId(job.id);
    try {
      let coverLetter: string | undefined;
      try {
        coverLetter = await aiService.generateCoverLetter(job.title, job.company, job.description);
      } catch {
        // proceed without cover letter
      }
      await jobService.applyToJob(job.id, coverLetter);
      Alert.alert('Applied!', `Your application for ${job.title} has been submitted.`);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not apply');
    } finally {
      setApplyingId(null);
    }
  };

  const handleGenerateCV = () => {
    Alert.alert("AI CV Generation", "This feature will analyze your profile and generate a tailored CV for these roles.");
  };

  if (loading && jobs.length === 0) return <Screen scroll={false}><LoadingState /></Screen>;
  if (error && jobs.length === 0) return <Screen scroll={false}><ErrorState message={error} onRetry={loadJobs} /></Screen>;

  const filteredJobs = jobs.filter(job => {
    if (activeFilter !== 'All Roles' && !job.title.toLowerCase().includes(activeFilter.toLowerCase().replace(' roles', '')) && !job.location.toLowerCase().includes(activeFilter.toLowerCase())) {
      // Very basic filtering just for demo
      return false;
    }
    if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase()) && !job.company.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <ImageBackground
        source={require("../../assets/images/header-career.jpg")}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
        imageStyle={{ resizeMode: "cover" }}
      >
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary, opacity: 0.65 }]} />
        <View style={styles.headerLeft}>
          <Ionicons name="menu" size={24} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={[styles.headerTitle, { color: '#ffffff' }]}>Jobs & Internships</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconBtn} onPress={() => router.push("/notifications")}>
            <Ionicons name="notifications-outline" size={24} color="#ffffff" />
          </Pressable>
          <UserAvatar size={32} style={[styles.avatar, { borderColor: '#ffffff', borderWidth: 1 }]} />
        </View>
      </ImageBackground>

      <FlatList
        data={filteredJobs}
        keyExtractor={(j) => String(j.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Search & Filter Section */}
            <View style={styles.searchFilterSection}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={20} color={colors.muted} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search roles, companies, or skills..."
                  placeholderTextColor={colors.muted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                {filters.map(filter => (
                  <Pressable 
                    key={filter} 
                    style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
                    onPress={() => setActiveFilter(filter)}
                  >
                    <Text style={[styles.filterChipText, activeFilter === filter && styles.filterChipTextActive]}>
                      {filter}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* AI Quick Action Card */}
            <View style={styles.aiCard}>
              <View style={styles.aiCardLeft}>
                <Text style={styles.aiCardTitle}>Tailor Your Profile</Text>
                <Text style={styles.aiCardSubtitle}>Our AI can instantly generate a custom CV for these specific roles.</Text>
              </View>
              <Pressable style={styles.aiCardBtn} onPress={handleGenerateCV}>
                <Ionicons name="color-wand" size={16} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.aiCardBtnText}>Generate CV</Text>
              </Pressable>
            </View>

            {filteredJobs.length === 0 && (
              <EmptyState title="No Jobs Found" message="Try adjusting your filters or search query." />
            )}
          </>
        }
        renderItem={({ item, index }) => (
          <View style={styles.jobCard}>
            <View style={styles.jobCardHeader}>
              <View style={styles.jobLogoBox}>
                <Ionicons name="business" size={24} color={colors.primary} />
              </View>
              <View style={[styles.matchBadge, index % 2 === 0 ? styles.matchBadgeHigh : styles.matchBadgeMedium]}>
                <Ionicons name={index % 2 === 0 ? "checkmark-circle" : "analytics"} size={14} color={index % 2 === 0 ? "#ffffff" : colors.primary} />
                <Text style={[styles.matchBadgeText, index % 2 === 0 ? { color: '#ffffff' } : { color: colors.primary }]}>
                  {index % 2 === 0 ? '95% Match' : '88% Match'}
                </Text>
              </View>
            </View>

            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.companyLoc}>{item.company} • {item.location}</Text>

            <View style={styles.jobDetailsRow}>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={16} color={colors.muted} />
                <Text style={styles.detailText}>Closes in {item.applicationDeadline}</Text>
              </View>
              {index === 0 && (
                <View style={[styles.detailItem, { marginLeft: 16 }]}>
                  <Ionicons name="flash" size={16} color="#ba1a1a" />
                  <Text style={[styles.detailText, { color: '#ba1a1a', fontWeight: '700' }]}>Fast-Track</Text>
                </View>
              )}
            </View>

            <View style={styles.jobActions}>
              <Pressable 
                style={[styles.btnApply, applyingId === item.id && { opacity: 0.7 }]} 
                onPress={() => handleApply(item)}
                disabled={applyingId === item.id}
              >
                <Text style={styles.btnApplyText}>{applyingId === item.id ? 'Applying...' : 'Apply Now'}</Text>
              </Pressable>
              {item.applicationUrl ? (
                <Pressable style={styles.btnBookmark} onPress={() => Linking.openURL(item.applicationUrl!)}>
                  <Ionicons name="open-outline" size={20} color={colors.primary} />
                </Pressable>
              ) : (
                <Pressable 
                  style={styles.btnBookmark}
                  onPress={() => toggleSaveMutation.mutate(item.id)}
                >
                  <Ionicons 
                    name={savedScholarships?.some(s => s.id === item.id) ? "bookmark" : "bookmark-outline"} 
                    size={20} 
                    color={savedScholarships?.some(s => s.id === item.id) ? colors.primary : colors.primary} 
                  />
                </Pressable>
              )}
            </View>
          </View>
        )}
        ListFooterComponent={
          filteredJobs.length > 0 ? (
            <View style={styles.paginationBox}>
              <Pressable style={styles.btnLoadMore}>
                <Text style={styles.btnLoadMoreText}>View more roles</Text>
              </Pressable>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
        paddingBottom: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(195, 198, 209, 0.3)',
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 20,
    color: colors.primary,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(195, 198, 209, 0.5)',
  },
  listContent: {
    padding: 20,
    paddingBottom: 120, // Safe area for tabs
  },
  searchFilterSection: {
    marginBottom: 24,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f3f8', // surface-container-low
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(195, 198, 209, 0.5)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    height: 48,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'BeVietnamPro_400Regular',
    fontSize: 14,
    color: colors.ink,
    height: '100%',
  },
  filterScroll: {
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(195, 198, 209, 0.5)',
  },
  filterChipActive: {
    backgroundColor: '#003366', // primary-container
    borderColor: '#003366',
  },
  filterChipText: {
    fontFamily: 'BeVietnamPro_600SemiBold',
    fontSize: 12,
    color: '#43474f', // on-surface-variant
  },
  filterChipTextActive: {
    color: '#d5e3ff', // on-primary-container
  },
  aiCard: {
    backgroundColor: '#003366', // primary-container
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  aiCardLeft: {
    flex: 1,
    paddingRight: 16,
  },
  aiCardTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 4,
  },
  aiCardSubtitle: {
    fontFamily: 'BeVietnamPro_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  aiCardBtn: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  aiCardBtnText: {
    fontFamily: 'BeVietnamPro_600SemiBold',
    fontSize: 12,
    color: colors.primary,
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(195, 198, 209, 0.3)',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  jobLogoBox: {
    width: 48,
    height: 48,
    backgroundColor: '#f4f3f8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  matchBadgeHigh: {
    backgroundColor: '#001e40', // primary
  },
  matchBadgeMedium: {
    backgroundColor: '#a7c8ff', // primary-fixed-dim
  },
  matchBadgeText: {
    fontFamily: 'BeVietnamPro_600SemiBold',
    fontSize: 12,
  },
  jobTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 18,
    color: colors.primary,
    marginBottom: 4,
  },
  companyLoc: {
    fontFamily: 'BeVietnamPro_400Regular',
    fontSize: 14,
    color: colors.muted,
    marginBottom: 16,
  },
  jobDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontFamily: 'BeVietnamPro_600SemiBold',
    fontSize: 12,
    color: colors.muted,
  },
  jobActions: {
    flexDirection: 'row',
    gap: 8,
  },
  btnApply: {
    flex: 1,
    height: 48,
    backgroundColor: '#001e40', // primary
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnApplyText: {
    fontFamily: 'BeVietnamPro_600SemiBold',
    fontSize: 14,
    color: '#ffffff',
  },
  btnBookmark: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(195, 198, 209, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationBox: {
    marginTop: 8,
    alignItems: 'center',
  },
  btnLoadMore: {
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLoadMoreText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: colors.primary,
  },
});
