import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useEcosystemStore } from '@/store/ecosystemStore';
import { EcosystemNotification } from '@/types/ecosystem';
import { useTheme } from '@/hooks/use-theme';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function NotificationsModal({ visible, onClose }: NotificationsModalProps) {
  const { colors } = useTheme();
  const notifications = useEcosystemStore((s) => s.notifications);
  const markAsRead = useEcosystemStore((s) => s.markNotificationAsRead);

  const renderItem = ({ item }: { item: EcosystemNotification }) => (
    <TouchableOpacity
      style={[
        styles.notifItem,
        {
          backgroundColor: item.read ? colors.card : `${colors.primary}08`,
          borderColor: item.read ? colors.cardBorder : `${colors.primary}30`,
        },
      ]}
      onPress={() => markAsRead(item.id)}>
      <View style={styles.topLine}>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.priorityDot,
              {
                backgroundColor:
                  item.priority === 'high' ? colors.danger : colors.primary,
              },
            ]}
          />
          <ThemedText type="small" style={[styles.serviceTag, { color: colors.primary }]}>
            {item.serviceName}
          </ThemedText>
        </View>
        <ThemedText type="small" style={{ color: colors.textSecondary }}>
          {item.timestamp}
        </ThemedText>
      </View>

      <ThemedText style={styles.notifTitle}>{item.title}</ThemedText>
      <ThemedText style={[styles.notifMessage, { color: colors.textSecondary }]}>
        {item.message}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <ThemedText style={styles.title}>Ecosystem Activity</ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.textSecondary} />
              <ThemedText style={{ color: colors.textSecondary, marginTop: 12 }}>
                No new activity
              </ThemedText>
            </View>
          }
        />
      </View>
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
  listContent: {
    padding: 18,
    gap: 12,
  },
  notifItem: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  serviceTag: {
    fontWeight: '700',
    fontSize: 11,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  notifMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
});
