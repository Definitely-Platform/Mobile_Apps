import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/use-theme';
import { AUTH_CONFIG } from '@/api/config';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    token?: string;
    sso_token?: string;
    accessToken?: string;
    jwt?: string;
    refreshToken?: string;
    refresh_token?: string;
    sso_code?: string;
    code?: string;
  }>();
  const theme = useTheme();
  const colors = theme.colors;
  const loginWithTokens = useAuthStore((s) => s.loginWithTokens);
  const openSsoLogin = useAuthStore((s) => s.openSsoLogin);

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function handleExchange() {
      // 1. Check direct query parameters
      let token =
        params.token ||
        params.sso_token ||
        params.accessToken ||
        params.jwt;

      let refreshToken =
        params.refreshToken ||
        params.refresh_token;

      // 2. Check full deep link URL for hash fragments (#token=... or #sso_token=...)
      if (!token) {
        try {
          const initialUrl = await Linking.getInitialURL();
          if (initialUrl && initialUrl.includes('#')) {
            const hashPart = initialUrl.substring(initialUrl.indexOf('#') + 1);
            const hashParams = new URLSearchParams(hashPart.replace(/^\/?/, ''));
            token =
              hashParams.get('token') ||
              hashParams.get('sso_token') ||
              hashParams.get('accessToken') ||
              hashParams.get('jwt') ||
              undefined;

            if (!refreshToken) {
              refreshToken =
                hashParams.get('refreshToken') ||
                hashParams.get('refresh_token') ||
                undefined;
            }
          }
        } catch {
          // ignore linking parse errors
        }
      }

      // 3. Fallback: Check if sso_code was provided and query polling endpoint
      const ssoCode = params.sso_code || params.code;
      if (!token && ssoCode) {
        try {
          const pollUrl = `${AUTH_CONFIG.API_URL}/api/auth/sso/poll?code=${encodeURIComponent(ssoCode)}`;
          const pollRes = await fetch(pollUrl, {
            headers: { Accept: 'application/json' },
          });
          if (pollRes.ok) {
            const pollData = await pollRes.json();
            if (pollData.success && pollData.token) {
              token = pollData.token;
              refreshToken = pollData.refreshToken || refreshToken;
            }
          }
        } catch {
          // ignore network poll error
        }
      }

      if (!token) {
        if (active) {
          setStatus('error');
          setErrorMessage('No authentication token received in the callback.');
        }
        return;
      }

      try {
        const ok = await loginWithTokens(token, refreshToken);
        if (!active) return;

        if (ok) {
          setStatus('success');
          setTimeout(() => {
            router.replace('/');
          }, 600);
        } else {
          setStatus('error');
          setErrorMessage('Unable to verify token against Accounts SSO.');
        }
      } catch (err: any) {
        if (!active) return;
        setStatus('error');
        setErrorMessage(err?.message || 'Authentication exchange failed.');
      }
    }

    // Listen for incoming deep link events while the callback screen is mounted
    const subscription = Linking.addEventListener('url', (event) => {
      if (event.url && active) {
        try {
          const parsed = Linking.parse(event.url);
          const incomingToken =
            (parsed.queryParams?.token as string) ||
            (parsed.queryParams?.sso_token as string) ||
            (parsed.queryParams?.accessToken as string);
          const incomingRefresh =
            (parsed.queryParams?.refreshToken as string) ||
            (parsed.queryParams?.refresh_token as string);
          if (incomingToken) {
            loginWithTokens(incomingToken, incomingRefresh).then((ok) => {
              if (ok && active) {
                setStatus('success');
                setTimeout(() => {
                  if (active) router.replace('/');
                }, 600);
              }
            });
          }
        } catch {
          // ignore parse error
        }
      }
    });

    handleExchange();

    return () => {
      active = false;
      subscription.remove();
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
        {status === 'verifying' && (
          <View style={styles.stateContainer}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
            <ThemedText style={styles.title}>Authenticating with Definitely...</ThemedText>
            <ThemedText
              type="small"
              style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
              Verifying your cross-platform identity credentials with Accounts SSO.
            </ThemedText>
          </View>
        )}

        {status === 'success' && (
          <View style={styles.stateContainer}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="checkmark-circle" size={38} color="#10b981" />
            </View>
            <ThemedText style={styles.title}>Welcome to Definitely One!</ThemedText>
            <ThemedText
              type="small"
              style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
              Session established. Redirecting to your workspace...
            </ThemedText>
          </View>
        )}

        {status === 'error' && (
          <View style={styles.stateContainer}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Ionicons name="alert-circle-outline" size={38} color="#ef4444" />
            </View>
            <ThemedText style={styles.title}>Authentication Incomplete</ThemedText>
            <ThemedText
              type="small"
              style={{ color: colors.danger, textAlign: 'center', marginTop: 8 }}>
              {errorMessage}
            </ThemedText>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() => router.replace('/')}
                style={[styles.button, { backgroundColor: colors.backgroundElement }]}>
                <ThemedText type="smallBold" style={{ color: colors.text }}>
                  Back
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  setStatus('verifying');
                  const ok = await openSsoLogin();
                  if (ok) router.replace('/');
                }}
                style={[styles.button, { backgroundColor: colors.primary }]}>
                <ThemedText type="smallBold" style={{ color: '#ffffff' }}>
                  Try Again
                </ThemedText>
              </TouchableOpacity>
            </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  stateContainer: {
    alignItems: 'center',
    width: '100%',
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
