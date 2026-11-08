import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Animated,
  Dimensions,
  Image,
  Alert,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useAuthStore } from '@/store/authStore';
import { useBiometrics } from '@/hooks/useBiometrics';
import { useTheme } from '@/hooks/use-theme';
import { UpdateAvatarModal } from './UpdateAvatarModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = Math.min(SCREEN_HEIGHT * 0.6, 560);

export interface UserTopDrawerModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenManageAccount: () => void;
}

export function UserTopDrawerModal({
  visible,
  onClose,
  onOpenManageAccount,
}: UserTopDrawerModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const lock = useAuthStore((s) => s.lock);
  const biometricsEnabled = useAuthStore((s) => s.biometricsEnabled);
  const { biometricType } = useBiometrics();

  const [modalVisible, setModalVisible] = useState(visible);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const isDismissingRef = useRef(false);

  const slideAnim = useRef(new Animated.Value(-SHEET_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      isDismissingRef.current = false;
      slideAnim.stopAnimation();
      fadeAnim.stopAnimation();
      slideAnim.setValue(-SHEET_HEIGHT);
      fadeAnim.setValue(0);

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (modalVisible && !isDismissingRef.current) {
      handleDismiss();
    }
  }, [visible]);

  const handleDismiss = () => {
    if (isDismissingRef.current) return;
    isDismissingRef.current = true;

    slideAnim.stopAnimation();
    fadeAnim.stopAnimation();

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -SHEET_HEIGHT,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setModalVisible(false);
        isDismissingRef.current = false;
        onClose();
      }
    });
  };

  const handleSignOut = () => {
    handleDismiss();
    setTimeout(() => {
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
    }, 250);
  };

  const handleNavigateSettings = () => {
    handleDismiss();
    router.push('/settings');
  };

  const handleNavigateActivity = () => {
    handleDismiss();
    router.push('/activity');
  };

  const handleLockNow = () => {
    handleDismiss();
    lock();
  };

  const handleManageAccount = () => {
    handleDismiss();
    onOpenManageAccount();
  };

  if (!modalVisible) return null;

  return (
    <Modal
      transparent
      visible={modalVisible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleDismiss}>
      <View style={styles.modalRoot}>
        {/* Backdrop overlay */}
        <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.backdrop,
              {
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.55],
                }),
              },
            ]}
          />
        </Pressable>

        {/* Top-down sliding sheet */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              paddingTop: insets.top + 8,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <View style={styles.content}>
            {/* Header: User Profile Brief */}
            <View style={styles.userHeader}>
              <View style={styles.userMainRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setShowAvatarModal(true)}
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
                    <Ionicons name="camera" size={10} color="#ffffff" />
                  </View>
                </TouchableOpacity>

                <View style={styles.userInfoCol}>
                  <View style={styles.nameRow}>
                    <ThemedText style={styles.userName} numberOfLines={1}>
                      {user?.name ?? 'Alex Rivera'}
                    </ThemedText>
                    <View style={[styles.roleBadge, { backgroundColor: `${colors.primary}15` }]}>
                      <ThemedText style={[styles.roleText, { color: colors.primary }]}>
                        {user?.role?.toUpperCase() || 'MEMBER'}
                      </ThemedText>
                    </View>
                  </View>

                  <ThemedText type="small" style={[styles.userEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                    {user?.email ?? 'alex@definitelyone.com'}
                  </ThemedText>

                  <View style={styles.orgRow}>
                    <View style={[styles.orgDot, { backgroundColor: colors.success }]} />
                    <ThemedText type="small" style={[styles.orgName, { color: colors.textSecondary }]} numberOfLines={1}>
                      {user?.organization?.name ?? 'Definitely Ecosystem'}
                    </ThemedText>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.closeIconBtn, { backgroundColor: colors.backgroundElement }]}
                  onPress={handleDismiss}
                  accessibilityLabel="Close Menu">
                  <Ionicons name="close" size={17} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* User Options List */}
            <View style={[styles.optionsGroup, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
              {/* Update Profile Picture */}
              <TouchableOpacity
                style={styles.optionRow}
                activeOpacity={0.7}
                onPress={() => setShowAvatarModal(true)}>
                <View style={[styles.optionIconWrap, { backgroundColor: `${colors.primary}18` }]}>
                  <Ionicons name="camera-outline" size={17} color={colors.primary} />
                </View>
                <View style={styles.optionTextCol}>
                  <ThemedText style={styles.optionTitle}>Update Profile Picture</ThemedText>
                  <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
                    Photo, gallery, or executive preset
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={15} color={colors.textSecondary} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

              {/* Manage ID / In-App WebView */}
              <TouchableOpacity
                style={styles.optionRow}
                activeOpacity={0.7}
                onPress={handleManageAccount}>
                <View style={[styles.optionIconWrap, { backgroundColor: `${colors.accent}18` }]}>
                  <Ionicons name="person-outline" size={17} color={colors.accent} />
                </View>
                <View style={styles.optionTextCol}>
                  <ThemedText style={styles.optionTitle}>Manage Definitely ID</ThemedText>
                  <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
                    Account credentials & profile
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={15} color={colors.textSecondary} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

              {/* Activity & Notifications */}
              <TouchableOpacity
                style={styles.optionRow}
                activeOpacity={0.7}
                onPress={handleNavigateActivity}>
                <View style={[styles.optionIconWrap, { backgroundColor: `${colors.accent}18` }]}>
                  <Ionicons name="pulse-outline" size={17} color={colors.accent} />
                </View>
                <View style={styles.optionTextCol}>
                  <ThemedText style={styles.optionTitle}>Activity & Telemetry</ThemedText>
                  <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
                    Live ecosystem updates & alerts
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={15} color={colors.textSecondary} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

              {/* Security Settings & Biometrics */}
              <TouchableOpacity
                style={styles.optionRow}
                activeOpacity={0.7}
                onPress={handleNavigateSettings}>
                <View style={[styles.optionIconWrap, { backgroundColor: `${colors.success}18` }]}>
                  <Ionicons name="shield-checkmark-outline" size={17} color={colors.success} />
                </View>
                <View style={styles.optionTextCol}>
                  <ThemedText style={styles.optionTitle}>Preferences & Security</ThemedText>
                  <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
                    {biometricsEnabled ? `${biometricType} active` : 'Device settings'}
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={15} color={colors.textSecondary} />
              </TouchableOpacity>

              {biometricsEnabled && (
                <>
                  <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />
                  <TouchableOpacity
                    style={styles.optionRow}
                    activeOpacity={0.7}
                    onPress={handleLockNow}>
                    <View style={[styles.optionIconWrap, { backgroundColor: `${colors.warning}18` }]}>
                      <Ionicons name="lock-closed-outline" size={17} color={colors.warning} />
                    </View>
                    <View style={styles.optionTextCol}>
                      <ThemedText style={styles.optionTitle}>Lock App Now</ThemedText>
                      <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
                        Trigger biometric verification
                      </ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={15} color={colors.textSecondary} />
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Bottom Actions: Sign Out */}
            <TouchableOpacity
              style={[styles.signOutRow, { borderColor: `${colors.danger}30`, backgroundColor: `${colors.danger}10` }]}
              activeOpacity={0.75}
              onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={17} color={colors.danger} />
              <ThemedText style={[styles.signOutText, { color: colors.danger }]}>
                Sign Out
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Bottom Handle Pill */}
          <View style={styles.handleContainer}>
            <View style={[styles.handleBar, { backgroundColor: colors.cardBorder }]} />
          </View>
        </Animated.View>
      </View>

      <UpdateAvatarModal
        visible={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
  },
  sheetContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 14,
    gap: 12,
  },
  userHeader: {
    paddingVertical: 4,
  },
  userMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0f172a',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  userInfoCol: {
    flex: 1,
    gap: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 9,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 12,
  },
  orgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  orgDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  orgName: {
    fontSize: 11,
    fontWeight: '500',
  },
  closeIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsGroup: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  optionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextCol: {
    flex: 1,
    gap: 1,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 52,
  },
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '700',
  },
  handleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
    paddingTop: 2,
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
});
