import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PersonCard } from '@/src/components/PersonCard';
import { Colors } from '@/src/constants/colors';
import { useAuth } from '@/src/context/AuthContext';
import { listPersons, type PersonSummary } from '@/src/api/personApi';

const DEBOUNCE_MS = 300;

export default function PeopleScreen() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.isVerified) {
      Alert.alert(
        'Verification Required',
        'Your account must be verified before you can manage people.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  }, []);
  const [persons, setPersons] = useState<PersonSummary[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [query, setQuery] = useState('');

  const isMounted = useRef(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { isMounted.current = false; }, []);

  const fetchPage = useCallback(async (pageNum: number, q: string, replace: boolean) => {
    try {
      const res = await listPersons({ page: pageNum, q: q.trim() || undefined });
      if (!isMounted.current) return;
      const { persons: items, pagination } = res.data;
      setPersons((prev) => replace ? items : [...prev, ...items]);
      setPage(pagination.page);
      setHasNextPage(pagination.hasNextPage);
    } catch {
      // silently handle
    } finally {
      if (isMounted.current) { setIsLoading(false); setIsRefreshing(false); setIsFetchingMore(false); }
    }
  }, []);

  useEffect(() => { fetchPage(1, '', true); }, []);

  const handleSearchChange = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setIsLoading(true);
      fetchPage(1, text, true);
    }, DEBOUNCE_MS);
  }, [fetchPage]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchPage(1, query, true);
  }, [query, fetchPage]);

  const onEndReached = useCallback(() => {
    if (isFetchingMore || !hasNextPage) return;
    setIsFetchingMore(true);
    fetchPage(page + 1, query, false);
  }, [isFetchingMore, hasNextPage, page, query, fetchPage]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name…"
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={handleSearchChange}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/main/people/add')}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={persons}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PersonCard
              person={item}
              onPress={() => router.push(`/main/people/${item._id}` as any)}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={isFetchingMore ? <ActivityIndicator style={styles.footerLoader} color={Colors.primary} /> : null}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>{query ? 'No people found' : 'No people added yet'}</Text>
              <Text style={styles.emptySubtitle}>
                {query ? 'Try a different search term.' : 'Tap "+ Add" to add the first person.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 10 },
  searchInput: { flex: 1, height: 42, backgroundColor: Colors.background, borderRadius: 10, paddingHorizontal: 14, fontSize: 14, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border },
  addButton: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  addButtonText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingTop: 12, paddingBottom: 32 },
  footerLoader: { marginVertical: 16 },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 19 },
});
