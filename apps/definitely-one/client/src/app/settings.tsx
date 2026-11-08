import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { AccountWebViewModal } from '@/components/hub/AccountWebViewModal';
import { PermissionsOnboardingModal } from '@/components/hub/PermissionsOnboardingModal';
import { useAuthStore } from '@/store/authStore';
import { useBiometrics } from '@/hooks/useBiometrics';
import { useTheme } from '@/hooks/use-theme';
import { AUTH_CONFIG } from '@/api/config';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { UpdateAvatarModal } from '@/components/hub/UpdateAvatarModal';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const lock = useAuthStore((s) => s.lock);
  const biometricsEnabled = useAuthStore((s) => s.biometricsEnabled);
  const setBiometricsEnabled = useAuthStore((s) => s.setBiometricsEnabled);
  const { biometricType } = useBiometrics();
  const [accountWebViewOpen, setAccountWebViewOpen] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of Definitely One on this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const handleOpenAccount = () => {
    setAccountWebViewOpen(true);
  };

  const handleOpenDocs = () => {
    Linking.openURL('https://definitely.live').catch(() => {});
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <ThemedText style={styles.headerTitle}>Settings</ThemedText>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* User Hero Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.profileRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setAvatarModalOpen(true)}
              style={styles.avatarWrap}
              accessibilityLabel="Change Profile Picture">
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={[styles.avatar, { borderColor: colors.cardBorder }]} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                  <ThemedText style={styles.avatarInitial}>
                    {user?.name?.[0]?.toUpperCase() ?? 'U'}
                  </ThemedText>
                </View>
              )}
              <View style={[styles.avatarBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="camera" size={11} color="#ffffff" />
              </View>
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <View style={styles.profileNameRow}>
                <ThemedText style={styles.profileName} numberOfLines={1}>
                  {user?.name ?? 'Alex Rivera'}
                </ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: `${colors.success}18` }]}>
                  <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                  <ThemedText style={[styles.statusText, { color: colors.success }]}>
                    Active
                  </ThemedText>
                </View>
              </View>

              <ThemedText type="small" style={[styles.profileEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                {user?.email ?? 'alex@definitelyone.com'}
              </ThemedText>

              <ThemedText type="small" style={[styles.orgName, { color: colors.primary }]} numberOfLines={1}>
                {user?.organization?.name ?? 'Definitely Ecosystem'}
              </ThemedText>
            </View>
          </View>

          <View style={styles.profileActionsRow}>
            <TouchableOpacity
              style={[styles.manageBtn, { flex: 1, backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}
              onPress={() => setAvatarModalOpen(true)}
              activeOpacity={0.75}>
              <Ionicons name="camera-outline" size={16} color={colors.primary} />
              <ThemedText style={styles.manageBtnText}>Change Photo</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.manageBtn, { flex: 1.2, backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}
              onPress={handleOpenAccount}
              activeOpacity={0.75}>
              <Ionicons name="person-circle-outline" size={16} color={colors.text} />
              <ThemedText style={styles.manageBtnText}>Manage ID</ThemedText>
              <Ionicons name="open-outline" size={13} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Security & Access Section */}
        <View style={styles.sectionGroup}>
          <ThemedText style={[styles.sectionHeading, { color: colors.textSecondary }]}>
            SECURITY & ACCESS
          </ThemedText>

          <View style={[styles.groupedCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {/* Biometric Toggle */}
            <View style={styles.listItem}>
              <View style={[styles.itemIconWrap, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name="finger-print-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.itemTextCol}>
                <ThemedText style={styles.itemTitle}>
                  Biometric Lock ({biometricType !== 'None' ? biometricType : 'Device'})
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
                  Require biometrics on app resume
                </ThemedText>
              </View>
              <Switch
                value={biometricsEnabled}
                onValueChange={setBiometricsEnabled}
                trackColor={{ false: colors.cardBorder, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

            {/* Hardware Keystore */}
            <View style={styles.listItem}>
              <View style={[styles.itemIconWrap, { backgroundColor: `${colors.success}15` }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.success} />
              </View>
              <View style={styles.itemTextCol}>
                <ThemedText style={styles.itemTitle}>Hardware Keystore</ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
                  Hardware Secure Enclave backed
                </ThemedText>
              </View>
              <View style={[styles.pillBadge, { backgroundColor: `${colors.success}15` }]}>
                <ThemedText style={[styles.pillText, { color: colors.success }]}>
                  Encrypted
                </ThemedText>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

            {/* Device Permissions Manager */}
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => setPermissionsModalOpen(true)}
              activeOpacity={0.7}>
              <View style={[styles.itemIconWrap, { backgroundColor: `${colors.accent}15` }]}>
                <Ionicons name="key-outline" size={18} color={colors.accent} />
              </View>
              <View style={styles.itemTextCol}>
                <ThemedText style={styles.itemTitle}>Device Permissions</ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
                  Phone, Camera, Gallery & Alerts
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

            {/* Immediate Lock Action */}
            <TouchableOpacity
              style={styles.listItem}
              onPress={lock}
              activeOpacity={0.7}>
              <View style={[styles.itemIconWrap, { backgroundColor: `${colors.warning}15` }]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.warning} />
              </View>
              <View style={styles.itemTextCol}>
                <ThemedText style={styles.itemTitle}>Lock App Now</ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
                  Instantly triggers biometric screen
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Connected Ecosystem Platforms */}
        <View style={styles.sectionGroup}>
          <ThemedText style={[styles.sectionHeading, { color: colors.textSecondary }]}>
            ACTIVE PLATFORM SESSIONS
          </ThemedText>

          <View style={[styles.groupedCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.listItem}>
              <View style={[styles.itemIconWrap, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name="globe-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.itemTextCol}>
                <ThemedText style={styles.itemTitle}>Web Application</ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
                  definitely.live
                </ThemedText>
              </View>
              <View style={[styles.pillBadge, { backgroundColor: `${colors.success}15` }]}>
                <ThemedText style={[styles.pillText, { color: colors.success }]}>Online</ThemedText>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

            <View style={styles.listItem}>
              <View style={[styles.itemIconWrap, { backgroundColor: `${colors.accent}15` }]}>
                <Ionicons name="desktop-outline" size={18} color={colors.accent} />
              </View>
              <View style={styles.itemTextCol}>
                <ThemedText style={styles.itemTitle}>Desktop App</ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
                  Definitely One (Tauri v2)
                </ThemedText>
              </View>
              <View style={[styles.pillBadge, { backgroundColor: `${colors.success}15` }]}>
                <ThemedText style={[styles.pillText, { color: colors.success }]}>Synced</ThemedText>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

            <View style={styles.listItem}>
              <View style={[styles.itemIconWrap, { backgroundColor: `${colors.success}15` }]}>
                <Ionicons name="phone-portrait-outline" size={18} color={colors.success} />
              </View>
              <View style={styles.itemTextCol}>
                <ThemedText style={styles.itemTitle}>Mobile Client</ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
                  Expo SDK 58 • React Native 0.88
                </ThemedText>
              </View>
              <View style={[styles.pillBadge, { backgroundColor: `${colors.primary}15` }]}>
                <ThemedText style={[styles.pillText, { color: colors.primary }]}>This Device</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Ecosystem Resources */}
        <View style={styles.sectionGroup}>
          <ThemedText style={[styles.sectionHeading, { color: colors.textSecondary }]}>
            ECOSYSTEM & SUPPORT
          </ThemedText>

          <View style={[styles.groupedCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <TouchableOpacity
              style={styles.listItem}
              onPress={handleOpenDocs}
              activeOpacity={0.7}>
              <View style={[styles.itemIconWrap, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name="book-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.itemTextCol}>
                <ThemedText style={styles.itemTitle}>Developer Documentation</ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
                  definitely.live
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

            <View style={styles.listItem}>
              <View style={[styles.itemIconWrap, { backgroundColor: `${colors.success}15` }]}>
                <Ionicons name="pulse-outline" size={18} color={colors.success} />
              </View>
              <View style={styles.itemTextCol}>
                <ThemedText style={styles.itemTitle}>System Status</ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
                  All systems operational
                </ThemedText>
              </View>
              <ThemedText style={{ fontSize: 12, fontWeight: '700', color: colors.success }}>
                99.98%
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Runtime Diagnostics */}
        <View style={styles.sectionGroup}>
          <ThemedText style={[styles.sectionHeading, { color: colors.textSecondary }]}>
            CLIENT RUNTIME
          </ThemedText>

          <View style={[styles.groupedCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.listItem}>
              <ThemedText style={styles.itemTitle}>Version</ThemedText>
              <ThemedText type="small" style={{ color: colors.textSecondary, fontWeight: '600' }}>
                1.0.0 (Release)
              </ThemedText>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

            <View style={styles.listItem}>
              <ThemedText style={styles.itemTitle}>Platform Engine</ThemedText>
              <ThemedText type="small" style={{ color: colors.textSecondary, fontWeight: '600' }}>
                {Platform.OS.toUpperCase()} {Platform.Version} (Hermes)
              </ThemedText>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

            <View style={styles.listItem}>
              <ThemedText style={styles.itemTitle}>Deep Link Scheme</ThemedText>
              <ThemedText type="small" style={{ color: colors.primary, fontWeight: '700' }}>
                definitelyone://
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Sign Out Action Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSignOut}
          style={[styles.signOutBtn, { borderColor: `${colors.danger}35`, backgroundColor: `${colors.danger}10` }]}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <ThemedText style={[styles.signOutText, { color: colors.danger }]}>
            Sign Out of Definitely One
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {/* Embedded Definitely ID In-App WebView */}
      <AccountWebViewModal
        visible={accountWebViewOpen}
        onClose={() => setAccountWebViewOpen(false)}
      />

      {/* Ecosystem Device Permissions Dialog */}
      <PermissionsOnboardingModal
        visible={permissionsModalOpen}
        onComplete={() => setPermissionsModalOpen(false)}
      />

      {/* Profile Picture Update Modal */}
      <UpdateAvatarModal
        visible={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 36,
    gap: 18,
  },
  profileCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0f172a',
  },
  profileActionsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 13,
  },
  orgName: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  manageBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionGroup: {
    gap: 8,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    paddingHorizontal: 4,
  },
  groupedCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  itemIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTextCol: {
    flex: 1,
    gap: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 58,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    marginTop: 6,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
