import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Text, Pressable, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppTextInput } from '../../components/AppTextInput';
import { ScholarshipCard } from '../../components/ScholarshipCard';
import { Screen } from '../../components/Screen';
import { EmptyState, ErrorState, LoadingState } from '../../components/StateView';
import { colors } from '../../constants/colors';
import { scholarshipService, ScholarshipFilters } from '../../services/scholarshipService';
import { Scholarship } from '../../types/api';

export default function ScholarshipsScreen() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadPage(0);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => loadPage(0), 400);
    return () => clearTimeout(id);
  }, [search]);

  const loadPage = async (p: number) => {
    if (p === 0) setLoading(true);
    setError(null);
    try {
      const filters: ScholarshipFilters = { page: p, size: 20 };
      if (search.trim()) (filters as any).country = search.trim();
      const result = await scholarshipService.getScholarships(filters);
      setScholarships(p === 0 ? result.content : [...scholarships, ...result.content]);
      setPage(result.number);
      setHasMore(result.number + 1 < result.totalPages);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  if (loading && page === 0) return <Screen scroll={false}><LoadingState /></Screen>;
  if (error && page === 0) return <Screen scroll={false}><ErrorState message={error} onRetry={() => loadPage(0)} /></Screen>;

  return (
    <View style={styles.container}>
      {/* TopAppBar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={20} color={colors.primary} />
          </View>
          <Text style={styles.headerTitle}>ScholarLink GH</Text>
        </View>
        <Pressable style={styles.iconButton}>
          <Ionicons name="search" size={24} color={colors.primary} />
        </Pressable>
      </View>

      {/* Search & Filters Sticky Header */}
      <View style={styles.stickyHeader}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.muted} style={styles.searchIcon} />
          <AppTextInput 
            label="" 
            value={search} 
            onChangeText={setSearch} 
            placeholder="Search scholarships..." 
            style={styles.searchInput}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
          <Pressable style={styles.filterBtnActive}>
            <Ionicons name="options" size={18} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.filterBtnTextActive}>Filters</Text>
          </Pressable>
          <View style={styles.filterDivider} />
          {['Country', 'Field', 'Funding', 'Deadline'].map(filter => (
            <Pressable key={filter} style={styles.filterBtn}>
              <Text style={styles.filterBtnText}>{filter}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Scholarship Feed */}
      {scholarships.length === 0 && !loading ? (
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          <EmptyState title="No Results" message="Try different search terms." />
        </View>
      ) : (
        <FlatList
          data={scholarships}
          keyExtractor={(s) => String(s.id)}
          renderItem={({ item }) => (
            <ScholarshipCard
              scholarship={item}
              onPress={() => router.push({ pathname: '/scholarship/[id]', params: { id: String(item.id) } })}
            />
          )}
          onEndReached={() => hasMore && loadPage(page + 1)}
          onEndReachedThreshold={0.4}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 10,
    backgroundColor: colors.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d5e3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 20,
    color: colors.primary,
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyHeader: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    zIndex: 40,
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
  list: { 
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100, // Room for bottom tabs
  },
});
