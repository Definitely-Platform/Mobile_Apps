import React from 'react';
import { View, StyleSheet, ScrollView, Platform, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useEcosystemStore } from '@/store/ecosystemStore';
import { useAuthStore } from '@/store/authStore';
import { LoginScreen } from '@/components/auth/LoginScreen';

export default function ExploreScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const services = useEcosystemStore((s) => s.services);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
      ]}>
      {/* Title */}
      <View style={styles.titleSection}>
        <ThemedText style={styles.heading}>Definitely One Platform</ThemedText>
        <ThemedText style={[styles.subheading, { color: colors.textSecondary }]}>
          Architectural overview & cross-platform synchronization
        </ThemedText>
      </View>

      {/* Platform Synchronization Card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <ThemedText style={styles.cardTitle}>Triple-Platform Architecture</ThemedText>
        <ThemedText style={[styles.cardDesc, { color: colors.textSecondary }]}>
          One shared user identity and database across three coordinated environments:
        </ThemedText>

        <View style={styles.stackRow}>
          <View style={[styles.stackBadge, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="globe-outline" size={18} color={colors.primary} />
            <ThemedText style={[styles.stackBadgeText, { color: colors.primary }]}>
              Web (Vite + React)
            </ThemedText>
          </View>
          <ThemedText style={{ color: colors.textSecondary }}>•</ThemedText>
          <View style={[styles.stackBadge, { backgroundColor: `${colors.accent}15` }]}>
            <Ionicons name="desktop-outline" size={18} color={colors.accent} />
            <ThemedText style={[styles.stackBadgeText, { color: colors.accent }]}>
              Desktop (Tauri)
            </ThemedText>
          </View>
          <ThemedText style={{ color: colors.textSecondary }}>•</ThemedText>
          <View style={[styles.stackBadge, { backgroundColor: `${colors.success}15` }]}>
            <Ionicons name="phone-portrait-outline" size={18} color={colors.success} />
            <ThemedText style={[styles.stackBadgeText, { color: colors.success }]}>
              Mobile (Expo SDK 58)
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Real-time System Status */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.cardHeaderWithBadge}>
          <ThemedText style={styles.cardTitle}>Ecosystem Health</ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: `${colors.success}20` }]}>
            <View style={[styles.pulseDot, { backgroundColor: colors.success }]} />
            <ThemedText style={[styles.statusText, { color: colors.success }]}>
              All Systems Operational
            </ThemedText>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={[styles.metricBox, { backgroundColor: colors.backgroundElement }]}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Registered Tools
            </ThemedText>
            <ThemedText style={styles.metricVal}>{services.length}</ThemedText>
          </View>

          <View style={[styles.metricBox, { backgroundColor: colors.backgroundElement }]}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              SSO Gateway
            </ThemedText>
            <ThemedText style={[styles.metricVal, { color: colors.success }]}>Active</ThemedText>
          </View>

          <View style={[styles.metricBox, { backgroundColor: colors.backgroundElement }]}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Biometrics
            </ThemedText>
            <ThemedText style={styles.metricVal}>Hardware</ThemedText>
          </View>

          <View style={[styles.metricBox, { backgroundColor: colors.backgroundElement }]}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Organization Plan
            </ThemedText>
            <ThemedText style={[styles.metricVal, { color: colors.primary }]}>
              {user?.organization?.plan?.toUpperCase() ?? 'ACTIVE'}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Developer Information */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <ThemedText style={styles.cardTitle}>Mobile App Runtime</ThemedText>
        <View style={styles.infoRow}>
          <ThemedText style={{ color: colors.textSecondary }}>Platform</ThemedText>
          <ThemedText style={{ fontWeight: '600' }}>
            {Platform.OS.toUpperCase()} {Platform.Version}
          </ThemedText>
        </View>
        <View style={styles.infoRow}>
          <ThemedText style={{ color: colors.textSecondary }}>Engine</ThemedText>
          <ThemedText style={{ fontWeight: '600' }}>Hermes Bytecode</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <ThemedText style={{ color: colors.textSecondary }}>Deep Link Scheme</ThemedText>
          <ThemedText style={{ fontWeight: '600', color: colors.primary }}>
            definitelyone://
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  titleSection: {
    marginBottom: 4,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardHeaderWithBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  stackRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  stackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stackBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricBox: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 10,
    gap: 4,
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
});
