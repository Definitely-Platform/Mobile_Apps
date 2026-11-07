import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { AuthState } from './types';
import { createAuthConfig, type AppAuthConfigOptions } from '@definitely/mobile-config';

interface AuthCallbackHandlerProps {
  useAuthStore: UseBoundStore<StoreApi<AuthState>>;
  configOptions?: AppAuthConfigOptions;
  homePath?: string;
  brandName?: string;
}

export function AuthCallbackHandler({
  useAuthStore,
  configOptions,
  homePath = '/',
  brandName = 'Definitely One',
}: AuthCallbackHandlerProps) {
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

  const loginWithTokens = useAuthStore((s) => s.loginWithTokens);
  const openSsoLogin = useAuthStore((s) => s.openSsoLogin);
  const authConfig = createAuthConfig(configOptions);

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function handleExchange() {
      let token =
        params.token ||
        params.sso_token ||
        params.accessToken ||
        params.jwt;

      let refreshToken =
        params.refreshToken ||
        params.refresh_token;

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
          // ignore
        }
      }

      const ssoCode = params.sso_code || params.code;
      if (!token && ssoCode) {
        try {
          const pollUrl = `${authConfig.API_URL}/api/auth/sso/poll?code=${encodeURIComponent(ssoCode)}`;
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
          // ignore
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
            if (active) {
              router.replace(homePath as any);
            }
          }, 600);
        } else {
          setStatus('error');
          setErrorMessage('Failed to establish authenticated session.');
        }
      } catch (err) {
        if (active) {
          setStatus('error');
          setErrorMessage(err instanceof Error ? err.message : 'Authentication verification error.');
        }
      }
    }

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
                  if (active) router.replace(homePath as any);
                }, 600);
              }
            });
          }
        } catch {
          // ignore
        }
      }
    });

    handleExchange();

    return () => {
      active = false;
      subscription.remove();
    };
  }, [params.token, params.sso_token, params.sso_code, params.code, params.refreshToken, params.refresh_token, loginWithTokens, router, homePath]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {status === 'verifying' && (
          <>
            <ActivityIndicator size="large" color="#6366f1" style={styles.spinner} />
            <Text style={styles.title}>Verifying Session</Text>
            <Text style={styles.subtitle}>Securing ecosystem credentials for {brandName}...</Text>
          </>
        )}

        {status === 'success' && (
          <>
            <View style={styles.successBadge}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
            <Text style={styles.title}>Logged in Successfully!</Text>
            <Text style={styles.subtitle}>Opening {brandName}...</Text>
          </>
        )}

        {status === 'error' && (
          <>
            <View style={styles.errorBadge}>
              <Text style={styles.errorX}>✕</Text>
            </View>
            <Text style={styles.title}>Sign In Failed</Text>
            <Text style={styles.subtitle}>{errorMessage || 'Authentication callback could not be completed.'}</Text>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => openSsoLogin()}>
              <Text style={styles.btnPrimaryText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => router.replace(homePath as any)}>
              <Text style={styles.btnSecondaryText}>Return to App</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090a0f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(23, 23, 30, 0.95)',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  spinner: {
    marginBottom: 20,
    transform: [{ scale: 1.2 }],
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  successBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1.5,
    borderColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  checkmark: {
    fontSize: 28,
    color: '#10b981',
    fontWeight: '700',
  },
  errorBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1.5,
    borderColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorX: {
    fontSize: 24,
    color: '#ef4444',
    fontWeight: '700',
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  btnSecondary: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
});
