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
  onToggleUserMenu?: () => void;
}

export function Header({ onOpenNotifications, onOpenProfile, onToggleUserMenu }: HeaderProps) {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const lock = useAuthStore((s) => s.lock);
  const biometricsEnabled = useAuthStore((s) => s.biometricsEnabled);
  const notifications = useEcosystemStore((s) => s.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const workspaceTitle = user?.organization?.name || (user?.name ? `${user.name}’s Hub` : 'Command Center');

  return (
    <View style={[styles.container, { borderBottomColor: colors.cardBorder }]}>
      <TouchableOpacity
        style={styles.leftRow}
        activeOpacity={0.72}
        onPress={onToggleUserMenu}
        accessibilityLabel="User Menu"
        accessibilityRole="button">
        <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
          <ThemedText style={styles.logoText}>1</ThemedText>
        </View>
        <View>
          <View style={styles.brandTitleRow}>
            <ThemedText style={styles.brandName}>Definitely</ThemedText>
            <ThemedText style={[styles.brandHighlight, { color: colors.primary }]}>One</ThemedText>
            <View style={[styles.arrowBadge, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
              <Ionicons name="chevron-down" size={12} color={colors.text} />
            </View>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
            <ThemedText type="small" style={[styles.statusText, { color: colors.textSecondary }]}>
              {workspaceTitle}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.rightActions}>
        {biometricsEnabled && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={lock}
            accessibilityLabel="Lock App">
            <Ionicons name="lock-closed-outline" size={17} color={colors.text} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          onPress={onOpenNotifications}
          accessibilityLabel="Notifications">
          <Ionicons name="notifications-outline" size={17} color={colors.text} />
          {unreadCount > 0 && (
            <View style={[styles.notificationBadge, { backgroundColor: colors.danger }]}>
              <ThemedText style={styles.badgeText}>{unreadCount}</ThemedText>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={onOpenProfile} style={styles.avatarButton}>
          {user?.avatarUrl ? (
            <Image
              source={{ uri: user.avatarUrl }}
              style={[styles.avatarImage, { borderColor: colors.cardBorder }]}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary, borderColor: colors.cardBorder }]}>
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
    paddingTop: 10,
    paddingBottom: 12,
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
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 19,
    lineHeight: 22,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandName: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  brandHighlight: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  arrowBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 11,
  },
  avatarButton: {
    marginLeft: 2,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
