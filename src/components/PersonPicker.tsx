import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, FlatList,
  TextInput, ActivityIndicator, Image,
} from 'react-native';
import { Colors } from '../constants/colors';
import { searchPersons, type PersonSummary } from '../api/personApi';

type Props = {
  label: string;
  selectedPersonId: string;
  selectedPersonName: string;
  onChange: (id: string, name: string) => void;
  error?: string;
  placeholder?: string;
};

const getInitials = (name: string) =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

export const PersonPicker = ({ label, selectedPersonId, selectedPersonName, onChange, error, placeholder }: Props) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PersonSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await searchPersons(q);
      setResults(res.data.persons);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchResults]);

  const handleOpen = () => { setOpen(true); setQuery(''); setResults([]); };
  const handleClose = () => setOpen(false);

  const handleSelect = (person: PersonSummary) => {
    onChange(person._id, person.name);
    handleClose();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.trigger, error ? styles.triggerError : styles.triggerNormal]}
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <Text style={selectedPersonId ? styles.selectedText : styles.placeholder}>
          {selectedPersonName || placeholder || 'Search and select a person'}
        </Text>
        {selectedPersonId ? (
          <TouchableOpacity onPress={() => onChange('', '')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.chevron}>›</Text>
        )}
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{label}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name…"
              placeholderTextColor={Colors.textMuted}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
          </View>

          {loading ? (
            <ActivityIndicator style={styles.loader} color={Colors.primary} />
          ) : results.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {query.trim() ? 'No people found. Try a different name.' : 'Type a name to search across all towns.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.row, item._id === selectedPersonId && styles.rowSelected]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  {item.profilePhoto ? (
                    <Image source={{ uri: item.profilePhoto }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitials}>{getInitials(item.name)}</Text>
                    </View>
                  )}
                  <View style={styles.rowContent}>
                    <Text style={styles.personName}>{item.name}</Text>
                    <Text style={styles.personMeta}>
                      {item.town?.name}
                      {item.dateOfBirth ? ` · ${new Date(item.dateOfBirth).getFullYear()}` : ''}
                    </Text>
                  </View>
                  {item._id === selectedPersonId && <Text style={styles.checkmark}>✓</Text>}
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
  container: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6, letterSpacing: 0.2 },
  trigger: { flexDirection: 'row', alignItems: 'center', minHeight: 50, borderRadius: 12, borderWidth: 1.5, backgroundColor: Colors.surface, paddingHorizontal: 14, paddingVertical: 10 },
  triggerNormal: { borderColor: Colors.border },
  triggerError: { borderColor: Colors.error },
  selectedText: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  placeholder: { flex: 1, fontSize: 15, color: Colors.textMuted },
  chevron: { fontSize: 22, color: Colors.textMuted, marginLeft: 6 },
  clearText: { fontSize: 16, color: Colors.textMuted, marginLeft: 8, fontWeight: '600' },
  errorText: { marginTop: 4, fontSize: 12, color: Colors.error },
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surface, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  closeButton: { padding: 6 },
  closeText: { fontSize: 18, color: Colors.textSecondary },
  searchRow: { backgroundColor: Colors.surface, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  searchInput: { height: 42, backgroundColor: Colors.background, borderRadius: 10, paddingHorizontal: 14, fontSize: 14, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border },
  loader: { marginTop: 40 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.surface },
  rowSelected: { backgroundColor: Colors.primary + '0D' },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarInitials: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  rowContent: { flex: 1 },
  personName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  personMeta: { fontSize: 12, color: Colors.textSecondary },
  checkmark: { fontSize: 16, color: Colors.primary, fontWeight: '700', marginLeft: 8 },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: 72 },
});
