import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useEcosystemStore } from '@/store/ecosystemStore';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/use-theme';
import { useNotificationsQuery, useRefreshEcosystem } from '@/hooks/useEcosystemQueries';
import { LoginScreen } from '@/components/auth/LoginScreen';

export default function ActivityScreen() {
  const { colors } = useTheme();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: notifications = [], isRefetching } = useNotificationsQuery();
  const refreshEcosystem = useRefreshEcosystem();
  const markAsRead = useEcosystemStore((s) => s.markNotificationAsRead);

  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (filter === 'unread') return !item.read;
      if (filter === 'high') return item.priority === 'high';
      return true;
    });
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.read) markAsRead(n.id);
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <View style={styles.titleRow}>
          <ThemedText style={styles.headerTitle}>Activity</ThemedText>
          {unreadCount > 0 && (
            <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
              <ThemedText style={styles.countText}>{unreadCount}</ThemedText>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ThemedText style={[styles.markAllText, { color: colors.primary }]}>
              Mark all read
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refreshEcosystem}
            tintColor={colors.primary}
          />
        }>
        {/* Filter Chips */}
        <View style={styles.filterRow}>
          {(['all', 'unread', 'high'] as const).map((tab) => {
            const isSelected = filter === tab;
            const label = tab === 'all' ? 'All Activity' : tab === 'unread' ? 'Unread' : 'Priority';
            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.75}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.cardBorder,
                  },
                ]}
                onPress={() => setFilter(tab)}>
                <ThemedText
                  style={[
                    styles.filterText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}>
                  {label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.backgroundElement }]}>
              <Ionicons name="notifications-off-outline" size={24} color={colors.textSecondary} />
            </View>
            <ThemedText style={styles.emptyTitle}>No activity</ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              You're caught up with all platform notifications
            </ThemedText>
          </View>
        ) : (
          filteredNotifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => markAsRead(item.id)}
              style={[
                styles.itemCard,
                {
                  backgroundColor: colors.card,
                  borderColor: item.read ? colors.cardBorder : `${colors.primary}40`,
                },
              ]}>
              <View style={styles.itemTopRow}>
                <View style={styles.serviceRow}>
                  {!item.read && (
                    <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                  )}
                  <View
                    style={[
                      styles.priorityTag,
                      {
                        backgroundColor:
                          item.priority === 'high' ? `${colors.danger}15` : `${colors.primary}12`,
                      },
                    ]}>
                    <ThemedText
                      style={[
                        styles.priorityText,
                        {
                          color: item.priority === 'high' ? colors.danger : colors.primary,
                        },
                      ]}>
                      {item.serviceName}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
                  {item.timestamp}
                </ThemedText>
              </View>

              <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
              <ThemedText style={[styles.itemMessage, { color: colors.textSecondary }]}>
                {item.message}
              </ThemedText>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  countBadge: {
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 10,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  itemCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  itemMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
});
