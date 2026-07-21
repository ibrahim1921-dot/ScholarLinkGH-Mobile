import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlatList, StyleSheet, View, Text, Pressable, ScrollView, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppTextInput } from '../../components/AppTextInput';
import { ScholarshipCard } from '../../components/ScholarshipCard';
import { Screen } from '../../components/Screen';
import { EmptyState, ErrorState, LoadingState } from '../../components/StateView';
import { FilterBottomSheet } from '../../components/FilterBottomSheet';
import { FiltersSheet, ActiveFilter } from '../../components/FiltersSheet';
import { colors } from '../../constants/colors';
import { scholarshipService, ScholarshipFilters } from '../../services/scholarshipService';
import { Scholarship } from '../../types/api';
import { useSavedScholarships } from '../../hooks/useScholarship';

// Status filter display labels
const STATUS_OPTIONS = ['OPEN', 'CLOSING_SOON', 'CLOSED', 'FULL'];
const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  CLOSING_SOON: 'Closing Soon',
  CLOSED: 'Closed',
  FULL: 'Full',
};

/**
 * Case-insensitive substring match against a scholarship's name, provider, and eligibleFields.
 * Reused for both server-result display and client-side saved-list filtering (Task 2).
 */
function matchesSearch(scholarship: Scholarship, term: string): boolean {
  if (!term.trim()) return true;
  const q = term.toLowerCase();
  return (
    (scholarship.name?.toLowerCase().includes(q) ?? false) ||
    (scholarship.provider?.toLowerCase().includes(q) ?? false) ||
    (scholarship.eligibleFields?.toLowerCase().includes(q) ?? false)
  );
}

export default function ScholarshipsScreen() {
  const insets = useSafeAreaInsets();

  // ── Data state ──
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // ── Filter state (mutual exclusivity enforced via single ActiveFilter) ──
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(null);

  // ── Lookup data for filter sheets ──
  const [countries, setCountries] = useState<string[]>([]);
  const [fields, setFields] = useState<string[]>([]);

  // ── Sheet visibility ──
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);
  const [showCountrySheet, setShowCountrySheet] = useState(false);
  const [showFieldSheet, setShowFieldSheet] = useState(false);
  const [showStatusSheet, setShowStatusSheet] = useState(false);

  const { data: savedScholarships } = useSavedScholarships();

  // Track the current activeFilter in a ref so loadPage always sees the latest value
  const activeFilterRef = useRef(activeFilter);
  activeFilterRef.current = activeFilter;

  // ── Load filter lookup data on mount ──
  useEffect(() => {
    scholarshipService.getDistinctCountries().then(setCountries).catch(() => {});
    scholarshipService.getDistinctFields().then(setFields).catch(() => {});
  }, []);

  // ── Load scholarships page ──
  const loadPage = useCallback(async (p: number, overrideFilter?: ActiveFilter) => {
    const currentFilter = overrideFilter !== undefined ? overrideFilter : activeFilterRef.current;

    // Don't fetch from server when showing saved scholarships (client-side list)
    if (currentFilter?.type === 'saved') {
      setLoading(false);
      return;
    }

    if (p === 0) setLoading(true);
    setError(null);
    try {
      const filters: ScholarshipFilters = { page: p, size: 20 };

      // Task 1: search targets name/provider/eligibleFields via backend 'search' param
      if (search.trim()) filters.search = search.trim();

      // Apply active filter to server request
      if (currentFilter?.type === 'country') filters.country = currentFilter.value;
      if (currentFilter?.type === 'field') filters.field = currentFilter.value;
      if (currentFilter?.type === 'status') filters.status = currentFilter.value;

      const result = await scholarshipService.getScholarships(filters);
      if (p === 0) {
        setScholarships(result.content);
      } else {
        setScholarships(prev => [...prev, ...result.content]);
      }
      setPage(result.number);
      setHasMore(result.number + 1 < result.totalPages);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [search]);

  // ── Initial load ──
  useEffect(() => {
    loadPage(0);
  }, []);

  // ── Debounced search (400ms) ──
  useEffect(() => {
    const id = setTimeout(() => loadPage(0), 400);
    return () => clearTimeout(id);
  }, [search]);

  // ── Reload when filter changes ──
  useEffect(() => {
    loadPage(0, activeFilter);
  }, [activeFilter]);

  // ── Task 2: Client-side filtering for Saved + Search combined state ──
  const filteredSavedScholarships = useMemo(() => {
    if (activeFilter?.type !== 'saved') return [];
    const list = savedScholarships || [];
    if (!search.trim()) return list;
    return list.filter((s) => matchesSearch(s, search));
  }, [activeFilter, savedScholarships, search]);

  // ── Determine displayed data ──
  const displayData = activeFilter?.type === 'saved' ? filteredSavedScholarships : scholarships;

  // ── Empty state message ──
  const emptyMessage = (() => {
    if (activeFilter?.type === 'saved') {
      if (search.trim() && (savedScholarships || []).length > 0) {
        return 'Try different search terms.';
      }
      return "You haven't saved any scholarships yet.";
    }
    return 'Try different search terms.';
  })();

  // ── Filter application handler (enforces mutual exclusivity) ──
  const applyFilter = (filter: ActiveFilter) => {
    setActiveFilter(filter);
  };

  // ── Chip label helpers ──
  const getChipLabel = (type: string): string => {
    if (!activeFilter || activeFilter.type !== type) {
      if (type === 'country') return 'Country';
      if (type === 'field') return 'Field';
      if (type === 'status') return 'Status';
      return type;
    }
    if (type === 'country' && 'value' in activeFilter) return `Country: ${activeFilter.value}`;
    if (type === 'field' && 'value' in activeFilter) return `Field: ${activeFilter.value}`;
    if (type === 'status' && 'value' in activeFilter)
      return `Status: ${STATUS_LABELS[activeFilter.value] ?? activeFilter.value}`;
    return type;
  };

  const isChipActive = (type: string): boolean => {
    return activeFilter?.type === type;
  };

  // ── Early returns removed to prevent unmounting the search bar ──

  return (
    <View style={styles.container}>
      {/* TopAppBar */}
      <ImageBackground
        source={require("../../assets/images/header-scholarships.jpg")}
        style={[styles.header, { paddingTop: insets.top + 10, gap: 12 }]}
        imageStyle={{ resizeMode: "cover" }}
      >
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary, opacity: 0.65 }]} />

        {/* Logo */}
        <View style={[styles.avatarPlaceholder, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
          <Text style={{ color: '#ffffff', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}>SL</Text>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { flex: 1, marginBottom: 0 }]}>
          <Ionicons name="search" size={20} color={colors.muted} style={styles.searchIcon} />
          <AppTextInput
            label=""
            value={search}
            onChangeText={setSearch}
            placeholder="Search scholarships..."
            style={styles.searchInput}
          />
        </View>

        {/* Bell Icon */}
        <Pressable style={{ padding: 4 }} onPress={() => router.push("/notifications")}>
          <Ionicons name="notifications-outline" size={24} color="#ffffff" />
        </Pressable>
      </ImageBackground>

      {/* Filters Sticky Header */}
      <View style={styles.stickyHeader}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
          {/* Filters button */}
          <Pressable
            style={styles.filterBtnActive}
            onPress={() => setShowFiltersSheet(true)}
          >
            <Ionicons name="options" size={18} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.filterBtnTextActive}>Filters</Text>
            {/* Active indicator dot */}
            {activeFilter && (
              <View style={styles.filterDot} />
            )}
          </Pressable>

          <View style={styles.filterDivider} />

          {/* Saved chip */}
          <Pressable
            style={isChipActive('saved') ? styles.filterBtnActive : styles.filterBtn}
            onPress={() => applyFilter(isChipActive('saved') ? null : { type: 'saved' })}
          >
            <Text style={isChipActive('saved') ? styles.filterBtnTextActive : styles.filterBtnText}>
              Saved
            </Text>
          </Pressable>

          {/* Country chip */}
          <Pressable
            style={isChipActive('country') ? styles.filterBtnActive : styles.filterBtn}
            onPress={() => setShowCountrySheet(true)}
          >
            <Text style={isChipActive('country') ? styles.filterBtnTextActive : styles.filterBtnText}>
              {getChipLabel('country')}
            </Text>
          </Pressable>

          {/* Field chip */}
          <Pressable
            style={isChipActive('field') ? styles.filterBtnActive : styles.filterBtn}
            onPress={() => setShowFieldSheet(true)}
          >
            <Text style={isChipActive('field') ? styles.filterBtnTextActive : styles.filterBtnText}>
              {getChipLabel('field')}
            </Text>
          </Pressable>

          {/* Status chip */}
          <Pressable
            style={isChipActive('status') ? styles.filterBtnActive : styles.filterBtn}
            onPress={() => setShowStatusSheet(true)}
          >
            <Text style={isChipActive('status') ? styles.filterBtnTextActive : styles.filterBtnText}>
              {getChipLabel('status')}
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Scholarship Feed */}
      {loading && page === 0 && activeFilter?.type !== 'saved' ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <LoadingState />
        </View>
      ) : error && page === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ErrorState message={error} onRetry={() => loadPage(0)} />
        </View>
      ) : displayData.length === 0 && !loading ? (
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          <EmptyState title="No Results" message={emptyMessage} />
        </View>
      ) : (
        <FlatList
          data={displayData}
          keyExtractor={(s) => String(s.id)}
          renderItem={({ item }) => (
            <ScholarshipCard
              scholarship={item}
              onPress={() => router.push({ pathname: '/scholarship/[id]', params: { id: String(item.id) } })}
            />
          )}
          onEndReached={() => {
            if (activeFilter?.type !== 'saved' && hasMore) {
              loadPage(page + 1);
            }
          }}
          onEndReachedThreshold={0.4}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ── Bottom Sheets ── */}

      {/* Consolidated Filters sheet (Task 6) */}
      <FiltersSheet
        visible={showFiltersSheet}
        onClose={() => setShowFiltersSheet(false)}
        activeFilter={activeFilter}
        onApplyFilter={applyFilter}
        countries={countries}
        fields={fields}
      />

      {/* Country sheet (Task 3) */}
      <FilterBottomSheet
        visible={showCountrySheet}
        onClose={() => setShowCountrySheet(false)}
        title="Select Country"
        options={countries}
        selected={activeFilter?.type === 'country' ? activeFilter.value : null}
        onSelect={(value) =>
          applyFilter(value ? { type: 'country', value } : null)
        }
      />

      {/* Field sheet (Task 4) */}
      <FilterBottomSheet
        visible={showFieldSheet}
        onClose={() => setShowFieldSheet(false)}
        title="Select Field of Study"
        options={fields}
        selected={activeFilter?.type === 'field' ? activeFilter.value : null}
        onSelect={(value) =>
          applyFilter(value ? { type: 'field', value } : null)
        }
      />

      {/* Status sheet (Task 5) */}
      <FilterBottomSheet
        visible={showStatusSheet}
        onClose={() => setShowStatusSheet(false)}
        title="Select Status"
        options={STATUS_OPTIONS}
        labels={STATUS_OPTIONS.map((s) => STATUS_LABELS[s])}
        selected={activeFilter?.type === 'status' ? activeFilter.value : null}
        onSelect={(value) =>
          applyFilter(value ? { type: 'status', value } : null)
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: colors.surface,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d5e3ff',
    alignItems: 'center',
    justifyContent: 'center',
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
  stickyHeader: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    zIndex: 40,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 8,
  },
  filterBtnActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterBtnTextActive: {
    fontFamily: 'BeVietnamPro_600SemiBold',
    fontSize: 12,
    color: '#ffffff',
  },
  filterDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  filterBtn: {
    backgroundColor: '#e8e8ed', // surface-container-high
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
  },
  filterBtnText: {
    fontFamily: 'BeVietnamPro_600SemiBold',
    fontSize: 12,
    color: colors.muted,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
    marginLeft: 6,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120, // Room for bottom tabs
  },
});
