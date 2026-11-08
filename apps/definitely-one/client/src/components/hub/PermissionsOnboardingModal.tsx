import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { PermissionService, PermissionStatusMap } from '@/services/permissionService';
import { useTheme } from '@/hooks/use-theme';

export interface PermissionsOnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
}

export function PermissionsOnboardingModal({
  visible,
  onComplete,
}: PermissionsOnboardingModalProps) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState<PermissionStatusMap>({
    camera: false,
    gallery: false,
    notifications: false,
    phone: false,
  });

  useEffect(() => {
    if (visible) {
      PermissionService.checkPermissions().then(setStatuses);
    }
  }, [visible]);

  const handleGrantPermissions = async () => {
    setLoading(true);
    try {
      const results = await PermissionService.requestAllPermissions();
      setStatuses(results);
      setTimeout(() => {
        setLoading(false);
        onComplete();
      }, 350);
    } catch {
      setLoading(false);
      onComplete();
    }
  };

  const handleSkip = async () => {
    await PermissionService.setOnboardingCompleted();
    onComplete();
  };

  const PERMISSION_ITEMS = [
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Receive real-time security alerts, SSO approvals & background telemetry.',
      icon: 'notifications-outline',
      color: colors.primary,
      granted: statuses.notifications,
    },
    {
      id: 'camera',
      title: 'Camera',
      description: 'Scan ecosystem QR logins, capture documents & verification photos.',
      icon: 'camera-outline',
      color: colors.accent,
      granted: statuses.camera,
    },
    {
      id: 'gallery',
      title: 'Photos & Gallery',
      description: 'Upload project attachments, resumes, invoices & workspace avatars.',
      icon: 'images-outline',
      color: colors.success,
      granted: statuses.gallery,
    },
    {
      id: 'phone',
      title: 'Phone & Device State',
      description: 'Hardware keystore attestation, device binding & connectivity telemetry.',
      icon: 'phone-portrait-outline',
      color: colors.warning,
      granted: statuses.phone,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={handleSkip}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom', 'left', 'right']}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={[styles.shieldIconWrap, { backgroundColor: `${colors.primary}18` }]}>
            <Ionicons name="shield-checkmark" size={28} color={colors.primary} />
          </View>
          <ThemedText style={styles.title}>Ecosystem Permissions</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enable native device capabilities for a unified Definitely One experience
          </ThemedText>
        </View>

        {/* Permissions List */}
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {PERMISSION_ITEMS.map((item) => (
            <View
              key={item.id}
              style={[
                styles.itemCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}>
              <View style={[styles.itemIconWrap, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>

              <View style={styles.itemTextCol}>
                <View style={styles.itemTitleRow}>
                  <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
                  {item.granted && (
                    <View style={[styles.grantedBadge, { backgroundColor: `${colors.success}18` }]}>
                      <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                      <ThemedText style={[styles.grantedText, { color: colors.success }]}>
                        Granted
                      </ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText style={[styles.itemDesc, { color: colors.textSecondary }]}>
                  {item.description}
                </ThemedText>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Footer Actions */}
        <View style={[styles.footer, { borderTopColor: colors.cardBorder }]}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
            disabled={loading}
            onPress={handleGrantPermissions}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
                <ThemedText style={styles.primaryBtnText}>
                  Allow Device Access
                </ThemedText>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipBtn}
            activeOpacity={0.7}
            disabled={loading}
            onPress={handleSkip}>
            <ThemedText style={[styles.skipText, { color: colors.textSecondary }]}>
              Set Up Later in Settings
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 12,
  },
  shieldIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 8,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 20,
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  itemIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  itemTextCol: {
    flex: 1,
    gap: 2,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  grantedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  grantedText: {
    fontSize: 10,
    fontWeight: '700',
  },
  itemDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  skipBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
