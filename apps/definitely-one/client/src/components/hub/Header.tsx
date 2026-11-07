import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useAuthStore } from '@/store/authStore';
import { useEcosystemStore } from '@/store/ecosystemStore';
import { useTheme } from '@/hooks/use-theme';

interface HeaderProps {
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
}

export function Header({ onOpenNotifications, onOpenProfile }: HeaderProps) {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const lock = useAuthStore((s) => s.lock);
  const biometricsEnabled = useAuthStore((s) => s.biometricsEnabled);
  const notifications = useEcosystemStore((s) => s.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={[styles.container, { borderBottomColor: colors.cardBorder }]}>
      <View style={styles.leftRow}>
        <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
          <ThemedText style={styles.logoText}>1</ThemedText>
        </View>
        <View>
          <View style={styles.brandTitleRow}>
            <ThemedText style={styles.brandName}>Definitely</ThemedText>
            <ThemedText style={[styles.brandHighlight, { color: colors.primary }]}>One</ThemedText>
          </View>
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            {user?.organization?.name ?? 'Definitely Platform'} • {user?.organization?.plan?.toUpperCase() ?? 'ENTERPRISE'}
          </ThemedText>
        </View>
      </View>

      <View style={styles.rightActions}>
        {biometricsEnabled && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.backgroundElement }]}
            onPress={lock}
            accessibilityLabel="Lock App">
            <Ionicons name="lock-closed-outline" size={18} color={colors.text} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.backgroundElement }]}
          onPress={onOpenNotifications}
          accessibilityLabel="Notifications">
          <Ionicons name="notifications-outline" size={18} color={colors.text} />
          {unreadCount > 0 && (
            <View style={[styles.notificationBadge, { backgroundColor: colors.danger }]}>
              <ThemedText style={styles.badgeText}>{unreadCount}</ThemedText>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={onOpenProfile} style={styles.avatarButton}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.accent }]}>
              <ThemedText style={styles.avatarInitial}>
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </ThemedText>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 20,
    lineHeight: 24,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  brandHighlight: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  avatarButton: {
    marginLeft: 2,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
