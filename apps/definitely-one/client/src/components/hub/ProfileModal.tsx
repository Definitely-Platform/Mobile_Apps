import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Switch, Image, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useAuthStore } from '@/store/authStore';
import { useBiometrics } from '@/hooks/useBiometrics';
import { useTheme } from '@/hooks/use-theme';
import { UpdateAvatarModal } from './UpdateAvatarModal';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ProfileModal({ visible, onClose }: ProfileModalProps) {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const biometricsEnabled = useAuthStore((s) => s.biometricsEnabled);
  const setBiometricsEnabled = useAuthStore((s) => s.setBiometricsEnabled);
  const { biometricType } = useBiometrics();
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of Definitely One on this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          onClose();
          await logout();
        },
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <ThemedText style={styles.title}>Account & Security</ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* User Card */}
          <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setAvatarModalOpen(true)}
              style={styles.avatarWrap}
              accessibilityLabel="Change Profile Picture">
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
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

            <View style={styles.userInfo}>
              <ThemedText style={styles.userName}>{user?.name ?? 'Alex Rivera'}</ThemedText>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                {user?.email ?? 'alex@definitelyone.com'}
              </ThemedText>
              <View style={[styles.badge, { backgroundColor: `${colors.primary}15` }]}>
                <ThemedText style={[styles.badgeText, { color: colors.primary }]}>
                  {user?.organization?.name ?? 'Definitely Ecosystem'}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Connected Ecosystem Platforms */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <ThemedText style={styles.sectionHeading}>Active Ecosystem Sessions</ThemedText>
            <View style={styles.platformRow}>
              <Ionicons name="globe-outline" size={18} color={colors.primary} />
              <ThemedText style={styles.platformText}>Web Application (Vite + React)</ThemedText>
              <ThemedText type="small" style={{ color: colors.success }}>Online</ThemedText>
            </View>
            <View style={styles.platformRow}>
              <Ionicons name="desktop-outline" size={18} color={colors.primary} />
              <ThemedText style={styles.platformText}>Desktop Application (Tauri)</ThemedText>
              <ThemedText type="small" style={{ color: colors.success }}>Online</ThemedText>
            </View>
            <View style={styles.platformRow}>
              <Ionicons name="phone-portrait-outline" size={18} color={colors.primary} />
              <ThemedText style={styles.platformText}>Mobile Application (iOS/Android)</ThemedText>
              <ThemedText type="small" style={{ color: colors.primary }}>This Device</ThemedText>
            </View>
          </View>

          {/* Security & Biometrics */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <ThemedText style={styles.sectionHeading}>Security</ThemedText>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingTitle}>
                  Biometric Lock ({biometricType !== 'None' ? biometricType : 'Device'})
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary }}>
                  Require biometrics when reopening app
                </ThemedText>
              </View>
              <Switch
                value={biometricsEnabled}
                onValueChange={setBiometricsEnabled}
                trackColor={{ false: colors.backgroundElement, true: colors.primary }}
              />
            </View>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            style={[styles.signOutBtn, { borderColor: colors.danger }]}
            onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            <ThemedText style={[styles.signOutText, { color: colors.danger }]}>
              Sign Out of Definitely One
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <UpdateAvatarModal
        visible={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  section: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  platformText: {
    flex: 1,
    fontSize: 13,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    paddingRight: 12,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 10,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
