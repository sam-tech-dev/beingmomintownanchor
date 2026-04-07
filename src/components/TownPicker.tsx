import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../constants/colors';
import { listTowns, type Town } from '../api/townApi';

type Props = {
  label: string;
  selectedTownId: string;
  selectedTownName: string;
  onChange: (id: string, name: string) => void;
  error?: string;
};

export const TownPicker = ({
  label,
  selectedTownId,
  selectedTownName,
  onChange,
  error,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [towns, setTowns] = useState<Town[]>([]);
  const [filtered, setFiltered] = useState<Town[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTowns = async () => {
    setLoading(true);
    try {
      const res = await listTowns();
      setTowns(res.data.towns);
      setFiltered(res.data.towns);
    } catch {
      // silently fail — user can retry by opening again
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setSearch('');
    fetchTowns();
  };

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(towns);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        towns.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.district.toLowerCase().includes(q) ||
            t.state.toLowerCase().includes(q)
        )
      );
    }
  }, [search, towns]);

  const handleSelect = (town: Town) => {
    onChange(town._id, town.name);
    setOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.trigger, error ? styles.triggerError : styles.triggerNormal]}
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <Text style={selectedTownId ? styles.selectedText : styles.placeholder}>
          {selectedTownName || 'Select your town'}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          {/* Modal header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Town</Text>
            <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by town, district or state…"
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
          </View>

          {loading ? (
            <ActivityIndicator style={styles.loader} color={Colors.primary} />
          ) : filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {towns.length === 0
                  ? 'No towns available yet. Ask your admin to add towns first.'
                  : 'No towns match your search.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.row,
                    item._id === selectedTownId && styles.rowSelected,
                  ]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.rowContent}>
                    <Text style={styles.townName}>{item.name}</Text>
                    <Text style={styles.townMeta}>
                      {[item.block, item.district, item.state].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                  {item._id === selectedTownId && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
  },
  triggerNormal: { borderColor: Colors.border },
  triggerError: { borderColor: Colors.error },
  selectedText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  placeholder: {
    flex: 1,
    fontSize: 15,
    color: Colors.textMuted,
  },
  chevron: {
    fontSize: 22,
    color: Colors.textMuted,
    marginLeft: 6,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.error,
  },
  modal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 6,
  },
  closeText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  searchRow: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    height: 42,
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loader: {
    marginTop: 40,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
  },
  rowSelected: {
    backgroundColor: Colors.primary + '0D',
  },
  rowContent: {
    flex: 1,
  },
  townName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  townMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  checkmark: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '700',
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 20,
  },
});
