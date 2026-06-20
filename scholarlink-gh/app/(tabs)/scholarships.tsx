import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { AppTextInput } from '../../components/AppTextInput';
import { ScholarshipCard } from '../../components/ScholarshipCard';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { EmptyState, ErrorState, LoadingState } from '../../components/StateView';
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

  if (loading) return <Screen><LoadingState /></Screen>;
  if (error) return <Screen><ErrorState message={error} onRetry={() => loadPage(0)} /></Screen>;

  return (
    <Screen scroll={false}>
      <SectionHeader title="Scholarships" />
      <AppTextInput label="Search" value={search} onChangeText={setSearch} placeholder="Search by country…" />
      {scholarships.length === 0 ? (
        <EmptyState title="No Results" message="Try different search terms." />
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
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12, paddingBottom: 12 },
});
