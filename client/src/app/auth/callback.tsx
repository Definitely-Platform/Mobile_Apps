import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/use-theme';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    token?: string;
    sso_token?: string;
    refreshToken?: string;
    refresh_token?: string;
    sso_code?: string;
    code?: string;
  }>();
  const { colors } = useTheme();
  const loginWithTokens = useAuthStore((s) => s.loginWithTokens);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleExchange() {
      const token = params.token || params.sso_token;
      const refreshToken = params.refreshToken || params.refresh_token;

      if (token) {
        const ok = await loginWithTokens(token, refreshToken);
        if (isMounted) {
          if (ok) {
            router.replace('/');
          } else {
            setError('Failed to verify authentication credentials.');
          }
        }
        return;
      }

      if (isMounted) {
        setError('No authentication token received in deep-link callback.');
      }
    }

    handleExchange();

    return () => {
      isMounted = false;
    };
  }, [params, loginWithTokens, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}>
        {error ? (
          <View style={styles.stateContainer}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Ionicons name="alert-circle-outline" size={36} color="#ef4444" />
            </View>
            <ThemedText style={styles.title}>Authentication Failed</ThemedText>
            <ThemedText type="small" style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 6 }}>
              {error}
            </ThemedText>
            <ThemedText
              onPress={() => router.replace('/')}
              style={[styles.actionText, { color: colors.primary, marginTop: 18 }]}>
              Return to Login
            </ThemedText>
          </View>
        ) : (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 16 }} />
            <ThemedText style={styles.title}>Verifying Ecosystem Session</ThemedText>
            <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: 6 }}>
              Completing secure login across Definitely One...
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    alignItems: 'center',
  },
  stateContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  actionText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
