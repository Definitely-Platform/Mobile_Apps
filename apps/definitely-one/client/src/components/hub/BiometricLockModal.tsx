import React, { useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useAuthStore } from '@/store/authStore';
import { useBiometrics } from '@/hooks/useBiometrics';
import { useTheme } from '@/hooks/use-theme';

export function BiometricLockModal() {
  const { colors } = useTheme();
  const isLocked = useAuthStore((s) => s.isLocked);
  const unlock = useAuthStore((s) => s.unlock);
  const user = useAuthStore((s) => s.user);
  const { authenticate, biometricType } = useBiometrics();

  const handleUnlock = async () => {
    const success = await authenticate('Unlock Definitely One');
    if (success) {
      unlock();
    }
  };

  useEffect(() => {
    if (isLocked) {
      handleUnlock();
    }
  }, [isLocked]);

  if (!isLocked) return null;

  return (
    <Modal visible={isLocked} animationType="fade" transparent={false}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContent}>
          <View style={[styles.lockIconCircle, { backgroundColor: `${colors.primary}20` }]}>
            <Ionicons name="lock-closed" size={48} color={colors.primary} />
          </View>

          <View style={styles.brandRow}>
            <ThemedText style={styles.brandTitle}>Definitely</ThemedText>
            <ThemedText style={[styles.brandHighlight, { color: colors.primary }]}>One</ThemedText>
          </View>

          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
            Protected with {biometricType !== 'None' ? biometricType : 'Device Security'}
          </ThemedText>

          {user && (
            <View style={[styles.userChip, { backgroundColor: colors.backgroundElement }]}>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Signed in as:
              </ThemedText>
              <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
            </View>
          )}

          <TouchableOpacity
            style={[styles.unlockButton, { backgroundColor: colors.primary }]}
            onPress={handleUnlock}
            activeOpacity={0.8}>
            <Ionicons
              name={
                biometricType === 'FaceID'
                  ? 'scan-outline'
                  : biometricType === 'Fingerprint'
                  ? 'finger-print-outline'
                  : 'keypad-outline'
              }
              size={22}
              color="#FFFFFF"
            />
            <ThemedText style={styles.unlockButtonText}>
              Unlock with {biometricType !== 'None' ? biometricType : 'Passcode'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  centerContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  lockIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandHighlight: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  userChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  unlockButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
