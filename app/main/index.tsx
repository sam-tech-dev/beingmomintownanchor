import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/src/constants/colors';
import { useAuth } from '@/src/context/AuthContext';

type Feature = {
  id: string;
  icon: string;
  title: string;
  description: string;
  route: string;
  color: string;
  adminOnly?: boolean;
  requiresVerification?: boolean;
};

const ALL_FEATURES: Feature[] = [
  {
    id: 'publish-news',
    icon: '📰',
    title: 'Publish News',
    description: 'Share breaking news and updates with your community',
    route: '/main/news/publish',
    color: '#E8F5E9',
    requiresVerification: true,
  },
  {
    id: 'people',
    icon: '👥',
    title: 'Manage People',
    description: 'Add and manage people records for your town',
    route: '/main/people',
    color: '#F3E5F5',
    requiresVerification: true,
  },
  {
    id: 'anchors',
    icon: '✅',
    title: 'Manage Anchors',
    description: 'View, verify, and manage town anchor accounts',
    route: '/main/anchors',
    color: '#E8F5E9',
    adminOnly: true,
  },
  {
    id: 'add-town',
    icon: '🏘️',
    title: 'Add Town',
    description: 'Register a new town to the platform',
    route: '/main/town/add',
    color: '#E3F2FD',
    adminOnly: true,
  },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const isVerified = user?.isVerified ?? false;
  const features = ALL_FEATURES.filter((f) => !f.adminOnly || user?.isAdmin);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const townName = user?.town?.name ?? 'No town set';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
            {user?.isAdmin && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </View>
          <View style={styles.townBadge}>
            <Text style={styles.townBadgeText}>📍 {townName}</Text>
          </View>
        </View>
        <View style={styles.topActions}>
          <TouchableOpacity onPress={() => router.push('/main/profile')} style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Verification pending banner */}
        {!isVerified && (
          <View style={styles.verificationBanner}>
            <Text style={styles.verificationIcon}>⏳</Text>
            <View style={styles.verificationTextWrap}>
              <Text style={styles.verificationTitle}>Verification Pending</Text>
              <Text style={styles.verificationSubtitle}>
                Your account is under review. Some features will be unlocked once verified.
              </Text>
            </View>
          </View>
        )}

        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Town Anchor Dashboard</Text>
          <Text style={styles.bannerSubtitle}>
            {user?.isAdmin
              ? `You have admin access. Manage the platform for ${townName}.`
              : `You are the voice of ${townName || 'your community'}. Keep your community informed.`}
          </Text>
        </View>

        {/* Features */}
        <Text style={styles.sectionTitle}>What would you like to do?</Text>

        {features.map((feature) => {
          const locked = feature.requiresVerification && !isVerified;
          return (
            <TouchableOpacity
              key={feature.id}
              style={[styles.featureCard, locked && styles.featureCardLocked]}
              activeOpacity={locked ? 1 : 0.85}
              onPress={() => {
                if (locked) {
                  Alert.alert(
                    'Verification Required',
                    'This feature will be available once your account is verified by an admin.'
                  );
                  return;
                }
                router.push(feature.route as any);
              }}
            >
              <View style={[styles.iconBox, { backgroundColor: locked ? Colors.border : feature.color }]}>
                <Text style={styles.iconEmoji}>{locked ? '🔒' : feature.icon}</Text>
              </View>
              <View style={styles.featureContent}>
                <View style={styles.featureTitleRow}>
                  <Text style={[styles.featureTitle, locked && styles.featureTitleLocked]}>
                    {feature.title}
                  </Text>
                  {feature.adminOnly && (
                    <View style={styles.adminOnlyTag}>
                      <Text style={styles.adminOnlyText}>Admin</Text>
                    </View>
                  )}
                  {locked && (
                    <View style={styles.lockedTag}>
                      <Text style={styles.lockedTagText}>Pending</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.featureDesc}>{feature.description}</Text>
              </View>
              {!locked && <Text style={styles.chevron}>›</Text>}
            </TouchableOpacity>
          );
        })}

        <Text style={styles.moreComingSoon}>More features coming soon...</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  adminBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  townBadge: {
    marginTop: 4,
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  townBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  topActions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 6,
    marginTop: 4,
  },
  editProfileButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  editProfileText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
  },
  banner: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: Colors.white + 'CC',
    lineHeight: 19,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconEmoji: {
    fontSize: 26,
  },
  featureContent: {
    flex: 1,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  adminOnlyTag: {
    backgroundColor: Colors.accent + '25',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  adminOnlyText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accent,
  },
  featureDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  chevron: {
    fontSize: 24,
    color: Colors.textMuted,
    marginLeft: 8,
  },
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFE082',
    gap: 10,
  },
  verificationIcon: {
    fontSize: 22,
    marginTop: 2,
  },
  verificationTextWrap: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#795548',
    marginBottom: 2,
  },
  verificationSubtitle: {
    fontSize: 12,
    color: '#A1887F',
    lineHeight: 17,
  },
  featureCardLocked: {
    opacity: 0.6,
  },
  featureTitleLocked: {
    color: Colors.textMuted,
  },
  lockedTag: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  lockedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F57C00',
  },
  moreComingSoon: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 16,
    fontStyle: 'italic',
  },
});
