import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '../constants/colors';
import { setVerification, type AnchorSummary } from '../api/townanchorApi';

type Props = {
  anchor: AnchorSummary;
  onUpdated: (updated: AnchorSummary) => void;
};

export const AnchorCard = ({ anchor, onUpdated }: Props) => {
  const [loading, setLoading] = useState(false);

  const initials = anchor.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleToggle = () => {
    const next = !anchor.isVerified;
    const action = next ? 'verify' : 'unverify';
    Alert.alert(
      next ? 'Verify Anchor' : 'Unverify Anchor',
      `Are you sure you want to ${action} ${anchor.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: next ? 'Verify' : 'Unverify',
          style: next ? 'default' : 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const res = await setVerification(anchor.id, next);
              onUpdated(res.data.user);
            } catch (err: any) {
              const message = err?.response?.data?.message ?? 'Something went wrong.';
              Alert.alert('Error', message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{anchor.name}</Text>
            {anchor.isAdmin && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </View>
          <Text style={styles.phone}>{anchor.phone}</Text>
          <Text style={styles.town} numberOfLines={1}>
            {anchor.town ? `📍 ${anchor.town.name}, ${anchor.town.district}` : '📍 No town set'}
          </Text>
        </View>

        <View style={[styles.statusBadge, anchor.isVerified ? styles.statusVerified : styles.statusPending]}>
          <Text style={[styles.statusText, anchor.isVerified ? styles.statusTextVerified : styles.statusTextPending]}>
            {anchor.isVerified ? 'Verified' : 'Pending'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.toggleButton, anchor.isVerified ? styles.toggleUnverify : styles.toggleVerify]}
        onPress={handleToggle}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color={anchor.isVerified ? Colors.error : Colors.white} />
        ) : (
          <Text style={[styles.toggleText, anchor.isVerified ? styles.toggleTextUnverify : styles.toggleTextVerify]}>
            {anchor.isVerified ? 'Unverify' : 'Verify'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  adminBadge: {
    backgroundColor: Colors.accent + '25',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accent,
  },
  phone: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  town: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  statusVerified: {
    backgroundColor: Colors.success + '20',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextVerified: {
    color: Colors.success,
  },
  statusTextPending: {
    color: '#F57C00',
  },
  toggleButton: {
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  toggleVerify: {
    backgroundColor: Colors.primary,
  },
  toggleUnverify: {
    borderWidth: 1.5,
    borderColor: Colors.error,
    backgroundColor: Colors.white,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  toggleTextVerify: {
    color: Colors.white,
  },
  toggleTextUnverify: {
    color: Colors.error,
  },
});
