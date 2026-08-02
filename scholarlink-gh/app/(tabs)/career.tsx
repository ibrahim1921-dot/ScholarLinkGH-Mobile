import { router } from 'expo-router';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert, FlatList, Linking, StyleSheet, Text, View, Pressable, TextInput, ScrollView, Platform, ImageBackground, Modal, ActivityIndicator, SafeAreaView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../../components/Screen';
import { EmptyState, ErrorState, LoadingState } from '../../components/StateView';
import { UserAvatar } from '../../components/UserAvatar';
import { BaseScholarshipCard } from '../../components/BaseScholarshipCard';
import { AppTextInput } from '../../components/AppTextInput';
import { colors } from '../../constants/colors';
import { jobService } from '../../services/jobService';
import { aiService } from '../../services/aiService';
import { documentService } from '../../services/documentService';
import { useSavedJobs, useToggleSaveJob } from '../../hooks/useJob';
import { getCountdownLabel, formatDeadline } from '../../utils/date';
import { JobListing } from '../../types/api';

export default function CareerScreen() {
  const insets = useSafeAreaInsets();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Roles');

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingDocs, setCheckingDocs] = useState(false);
  const [customAlertVisible, setCustomAlertVisible] = useState(false);

  const { data: savedJobs } = useSavedJobs();
  const toggleSaveMutation = useToggleSaveJob();

  const filters = ['All Roles', 'Saved', 'Internships', 'Entry Level', 'Graduate Roles', 'Remote'];

  const activeFilterRef = useRef(activeFilter);
  activeFilterRef.current = activeFilter;
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadJobs = useCallback(async (pageNumber = 0, overrideFilter?: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    if (pageNumber === 0) setLoading(true);
    setError(null);
    try {
      const currentFilter = overrideFilter !== undefined ? overrideFilter : activeFilterRef.current;
      if (currentFilter === 'Saved') {
        setLoading(false);
        return;
      }

      const filters: any = { page: pageNumber, size: 20, signal: abortController.signal };
      
      if (searchQuery.trim()) filters.search = searchQuery.trim();

      if (currentFilter === 'Internships') filters.employmentType = 'INTERNSHIP';
      if (currentFilter === 'Entry Level') filters.experienceLevel = 'ENTRY_LEVEL';
      if (currentFilter === 'Graduate Roles') filters.experienceLevel = 'GRADUATE';
      if (currentFilter === 'Remote') filters.workMode = 'REMOTE';

      const result = await jobService.getJobs(filters);
      if (pageNumber === 0) {
        setJobs(result.content);
      } else {
        setJobs(prev => [...prev, ...result.content]);
      }
      setHasMore(!result.last);
      setPage(pageNumber);
    } catch (e: any) {
      if (e.name === 'CanceledError' || e.message === 'canceled') return;
      setError(e?.message ?? 'Failed to load');
    } finally {
      if (abortControllerRef.current === abortController) {
        setLoading(false);
      }
    }
  }, [searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadJobs(0);
    setRefreshing(false);
  }, [loadJobs]);

  useEffect(() => {
    loadJobs(0);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => loadJobs(0), 400);
    return () => clearTimeout(id);
  }, [searchQuery]);

  useEffect(() => {
    loadJobs(0, activeFilter);
  }, [activeFilter]);

  const filteredSavedJobs = useMemo(() => {
    if (activeFilter !== 'Saved') return [];
    const list = savedJobs || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((j) =>
      j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q)
    );
  }, [activeFilter, savedJobs, searchQuery]);

  const displayData = activeFilter === 'Saved' ? filteredSavedJobs : jobs;

  const handleGenerateCV = async () => {
    setCheckingDocs(true);
    try {
      const docs = await documentService.getDocuments();
      const hasCV = docs.some(d => 
        d.document_type?.toUpperCase() === 'CV' || 
        d.document_type?.toUpperCase() === 'RESUME' ||
        d.filename?.toLowerCase().includes('cv') ||
        d.filename?.toLowerCase().includes('resume')
      );

      if (hasCV) {
        setCustomAlertVisible(true);
      } else {
        router.push('/(tabs)/assistant?action=generateCv');
      }
    } catch (e) {
      // If document check fails, fallback to just navigating
      router.push('/(tabs)/assistant?action=generateCv');
    } finally {
      setCheckingDocs(false);
    }
  };

  if (loading && displayData.length === 0) return <Screen scroll={false}><LoadingState /></Screen>;
  if (error && displayData.length === 0) return <Screen scroll={false}><ErrorState message={error} onRetry={() => loadJobs(0)} /></Screen>;

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <ImageBackground
        source={require("../../assets/images/header-career.jpg")}
        style={[styles.header, { paddingTop: insets.top + 10, gap: 12 }]}
        imageStyle={{ resizeMode: "cover" }}
      >
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary, opacity: 0.65 }]} />
        
        {/* Avatar */}
        <Pressable onPress={() => router.push("/profile-summary")}>
          <UserAvatar size={32} style={[styles.avatar, { borderColor: '#ffffff', borderWidth: 1 }]} />
        </Pressable>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { flex: 1, marginBottom: 0 }]}>
          <Ionicons name="search" size={20} color={colors.muted} style={styles.searchIcon} />
          <AppTextInput
            label=""
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search roles or companies..."
            style={styles.searchInput}
          />
        </View>

        {/* Bell Icon */}
        <Pressable style={{ padding: 4 }} onPress={() => router.push("/notifications")}>
          <Ionicons name="notifications-outline" size={24} color="#ffffff" />
        </Pressable>
      </ImageBackground>

      <FlatList
        data={displayData}
        keyExtractor={(j) => String(j.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <>
            {/* Search & Filter Section */}
            <View style={styles.searchFilterSection}>
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
                <Text style={styles.aiCardTitle}>Generate Your Profile CV</Text>
                <Text style={styles.aiCardSubtitle}>Our AI can instantly generate a custom CV to boost your applications.</Text>
              </View>
              <Pressable style={styles.aiCardBtn} onPress={handleGenerateCV} disabled={checkingDocs}>
                {checkingDocs ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 4 }} />
                ) : (
                  <Ionicons name="color-wand" size={16} color={colors.primary} style={{ marginRight: 4 }} />
                )}
                <Text style={styles.aiCardBtnText}>{checkingDocs ? "Checking..." : "Generate CV"}</Text>
              </Pressable>
            </View>

            {displayData.length === 0 && (
              <EmptyState title="No Jobs Found" message={activeFilter === 'Saved' ? "You haven't saved any jobs yet." : "Try adjusting your filters or search query."} />
            )}
          </>
        }
        renderItem={({ item }) => {
          const daysUntilDeadline = item.applicationDeadline ? Math.ceil((new Date(item.applicationDeadline).getTime() - new Date().getTime()) / 86400000) : null;
          const isSaved = savedJobs?.some(s => s.id === item.id);
          
          return (
            <View style={{ marginBottom: 16 }}>
              <BaseScholarshipCard
                variant="compact"
                title={item.title}
                provider={item.company}
                deadline={item.applicationDeadline ? formatDeadline(item.applicationDeadline) : undefined}
                country={item.location}
                field={item.fieldOfStudy}
                countdownLabel={getCountdownLabel(daysUntilDeadline)}
                imageUrl={item.imageUrl}
                applicationUrl={item.applicationUrl}
                sponsored={item.sponsored}
                fee={item.assistedApplicationFee}
                onPress={() => router.push(`/job/${item.id}` as any)}
              >
                <View style={styles.jobActions}>
                  <Pressable 
                    style={styles.btnBookmark}
                    onPress={() => toggleSaveMutation.mutate(item.id)}
                  >
                    <Ionicons 
                      name={isSaved ? "bookmark" : "bookmark-outline"} 
                      size={20} 
                      color={isSaved ? colors.primary : colors.muted} 
                    />
                  </Pressable>
                </View>
              </BaseScholarshipCard>
            </View>
          );
        }}
        ListFooterComponent={
          hasMore && activeFilter !== 'Saved' ? (
            <View style={styles.paginationBox}>
              <Pressable style={styles.btnLoadMore} onPress={() => loadJobs(page + 1)}>
                <Text style={styles.btnLoadMoreText}>View more roles</Text>
              </Pressable>
            </View>
          ) : null
        }
      />

      {/* Custom Alert Modal */}
      <Modal visible={customAlertVisible} animationType="fade" transparent>
        <View style={styles.customAlertOverlay}>
          <View style={styles.customAlertCard}>
            <View style={styles.customAlertIconContainer}>
              <Ionicons name="document-text" size={32} color={colors.primary} />
              <View style={styles.customAlertCheckBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              </View>
            </View>
            <Text style={styles.customAlertTitle}>CV Already Exists</Text>
            <Text style={styles.customAlertMessage}>
              We found an existing CV in your vault. Would you like to review it, or generate a brand new one?
            </Text>
            <View style={styles.customAlertButtons}>
              <Pressable
                style={[styles.customAlertBtn, styles.customAlertBtnPrimary]}
                onPress={() => {
                  setCustomAlertVisible(false);
                  router.push('/documents' as any);
                }}
              >
                <Text style={styles.customAlertBtnTextPrimary}>Review It</Text>
              </Pressable>
              <Pressable
                style={[styles.customAlertBtn, styles.customAlertBtnSecondary]}
                onPress={() => {
                  setCustomAlertVisible(false);
                  router.push('/(tabs)/assistant?action=generateCv');
                }}
              >
                <Text style={styles.customAlertBtnTextSecondary}>Generate New</Text>
              </Pressable>
              <Pressable
                style={[styles.customAlertBtn, styles.customAlertBtnCancel]}
                onPress={() => setCustomAlertVisible(false)}
              >
                <Text style={styles.customAlertBtnTextCancel}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: 14,
    zIndex: 1,
  },
  searchInput: {
    paddingLeft: 48,
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
  jobActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
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
  customAlertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  customAlertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  customAlertIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f4ff', // light primary tint
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  customAlertCheckBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customAlertTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 20,
    color: colors.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  customAlertMessage: {
    fontFamily: 'BeVietnamPro_400Regular',
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  customAlertButtons: {
    width: '100%',
    gap: 12,
  },
  customAlertBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customAlertBtnPrimary: {
    backgroundColor: colors.primary,
  },
  customAlertBtnSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  customAlertBtnCancel: {
    backgroundColor: 'transparent',
  },
  customAlertBtnTextPrimary: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  customAlertBtnTextSecondary: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: colors.primary,
  },
  customAlertBtnTextCancel: {
    fontFamily: 'BeVietnamPro_600SemiBold',
    fontSize: 14,
    color: colors.muted,
  },
});
