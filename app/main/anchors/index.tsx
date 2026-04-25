import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnchorCard } from '@/src/components/AnchorCard';
import { Colors } from '@/src/constants/colors';
import { listAnchors, type AnchorSummary } from '@/src/api/townanchorApi';

const DEBOUNCE_MS = 300;

export default function AnchorsScreen() {
  const [anchors, setAnchors] = useState<AnchorSummary[]>([]);
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
      const res = await listAnchors({ page: pageNum, q: q.trim() || undefined });
      if (!isMounted.current) return;
      const { anchors: items, pagination } = res.data;
      setAnchors((prev) => (replace ? items : [...prev, ...items]));
      setPage(pagination.page);
      setHasNextPage(pagination.hasNextPage);
    } catch {
      // silently handle
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsFetchingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchPage(1, '', true);
  }, [fetchPage]);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setIsLoading(true);
      fetchPage(1, text, true);
    }, DEBOUNCE_MS);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPage(1, query, true);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingMore) {
      setIsFetchingMore(true);
      fetchPage(page + 1, query, false);
    }
  };

  const handleUpdated = (updated: AnchorSummary) => {
    setAnchors((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or town…"
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={handleSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={Colors.primary} />
      ) : (
        <FlatList
          data={anchors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AnchorCard anchor={item} onUpdated={handleUpdated} />
          )}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          contentContainerStyle={anchors.length === 0 ? styles.emptyContainer : styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No anchors found</Text>
            </View>
          }
          ListFooterComponent={
            isFetchingMore ? <ActivityIndicator color={Colors.primary} style={styles.footer} /> : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 42,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loader: {
    marginTop: 40,
  },
  list: {
    paddingTop: 4,
    paddingBottom: 24,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  empty: {
    alignItems: 'center',
    marginTop: 80,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textMuted,
  },
  footer: {
    paddingVertical: 16,
  },
});
