import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import type { PersonSummary } from '../api/personApi';

type Props = {
  person: PersonSummary;
  onPress?: () => void;
};

const getInitials = (name: string) =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

const formatYear = (dob: string | null) =>
  dob ? `b. ${new Date(dob).getFullYear()}` : null;

const GENDER_LABEL: Record<string, string> = { male: 'Male', female: 'Female', other: 'Other' };

export const PersonCard = ({ person, onPress }: Props) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.left}>
      {person.profilePhoto ? (
        <Image source={{ uri: person.profilePhoto }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.initials}>{getInitials(person.name)}</Text>
        </View>
      )}
    </View>
    <View style={styles.content}>
      <View style={styles.nameRow}>
        <Text style={styles.name} numberOfLines={1}>{person.name}</Text>
        <View style={[styles.statusChip, person.isAlive ? styles.aliveChip : styles.deceasedChip]}>
          <Text style={[styles.statusText, person.isAlive ? styles.aliveText : styles.deceasedText]}>
            {person.isAlive ? 'Alive' : 'Deceased'}
          </Text>
        </View>
      </View>
      <Text style={styles.town} numberOfLines={1}>📍 {person.town?.name}</Text>
      <View style={styles.metaRow}>
        {formatYear(person.dateOfBirth) && <Text style={styles.meta}>{formatYear(person.dateOfBirth)}</Text>}
        <View style={styles.genderBadge}>
          <Text style={styles.genderText}>{GENDER_LABEL[person.gender] ?? person.gender}</Text>
        </View>
      </View>
    </View>
    <Text style={styles.chevron}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 14, padding: 14, marginHorizontal: 16, marginBottom: 10, shadowColor: Colors.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  left: { marginRight: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarPlaceholder: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  initials: { color: Colors.white, fontSize: 18, fontWeight: '700' },
  content: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  aliveChip: { backgroundColor: Colors.success + '20' },
  deceasedChip: { backgroundColor: Colors.textMuted + '20' },
  statusText: { fontSize: 10, fontWeight: '700' },
  aliveText: { color: Colors.success },
  deceasedText: { color: Colors.textMuted },
  town: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  meta: { fontSize: 12, color: Colors.textMuted },
  genderBadge: { backgroundColor: Colors.primary + '15', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  genderText: { fontSize: 10, fontWeight: '600', color: Colors.primary },
  chevron: { fontSize: 22, color: Colors.textMuted, marginLeft: 6 },
});
