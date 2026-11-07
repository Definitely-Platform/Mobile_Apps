import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import {
  WebView as BaseWebView,
  type WebViewProps,
  type WebViewNavigation,
} from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/use-theme';
import { AUTH_CONFIG } from '@/api/config';

// React 19 compatibility wrapper for react-native-webview
const WebView = BaseWebView as unknown as React.ComponentClass<
  WebViewProps & { ref?: React.Ref<BaseWebView> }
>;

const CHROME_MOBILE_UA = Platform.select({
  android:
    'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
  ios:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  default: undefined,
});

const INJECTED_AUTH_BRIDGE = `
(function() {
  try {
    var origSet = sessionStorage.setItem;
    var origGet = sessionStorage.getItem;
    var origRemove = sessionStorage.removeItem;
    sessionStorage.setItem = function(k, v) {
      try { localStorage.setItem('__def_ss_' + k, v); } catch(e){}
      return origSet.apply(this, arguments);
    };
    sessionStorage.getItem = function(k) {
      var v = origGet.apply(this, arguments);
      if (v !== null && v !== undefined) return v;
      try { return localStorage.getItem('__def_ss_' + k); } catch(e){}
      return null;
    };
    sessionStorage.removeItem = function(k) {
      try { localStorage.removeItem('__def_ss_' + k); } catch(e){}
      return origRemove.apply(this, arguments);
    };
  } catch(e) {}

  function attachGoogleIntercept() {
    try {
      var buttons = document.querySelectorAll('button');
      for (var i = 0; i < buttons.length; i++) {
        var btn = buttons[i];
        if (btn.innerText && btn.innerText.toLowerCase().indexOf('google') !== -1 && !btn.__mobileGoogleHooked) {
          btn.__mobileGoogleHooked = true;
          btn.addEventListener('click', function(e) {
            if (window.ReactNativeWebView) {
              e.preventDefault();
              e.stopImmediatePropagation();
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'GOOGLE_SIGN_IN' }));
            }
          }, true);
        }
      }
    } catch(e) {}
  }

  attachGoogleIntercept();
  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(attachGoogleIntercept);
    observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
  }
})();
true;
`;

export interface AuthWebViewModalProps {
  visible: boolean;
  mode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Extracts authentication tokens from deep link or callback URL
 */
function extractTokensFromUrl(rawUrl: string): {
  token: string | null;
  refreshToken: string | null;
  ssoCode: string | null;
} {
  let token: string | null = null;
  let refreshToken: string | null = null;
  let ssoCode: string | null = null;

  try {
    const urlObj = new URL(rawUrl);
    token =
      urlObj.searchParams.get('token') ||
      urlObj.searchParams.get('sso_token') ||
      urlObj.searchParams.get('accessToken') ||
      urlObj.searchParams.get('jwt');

    refreshToken =
      urlObj.searchParams.get('refreshToken') ||
      urlObj.searchParams.get('refresh_token');

    ssoCode =
      urlObj.searchParams.get('sso_code') ||
      urlObj.searchParams.get('code');

    // Also check hash fragments (#token=...&refreshToken=...)
    if (!token && urlObj.hash) {
      const hashPart = urlObj.hash.replace(/^#\/?/, '');
      const hashParams = new URLSearchParams(hashPart);
      token =
        hashParams.get('token') ||
        hashParams.get('sso_token') ||
        hashParams.get('accessToken') ||
        hashParams.get('jwt');

      if (!refreshToken) {
        refreshToken =
          hashParams.get('refreshToken') ||
          hashParams.get('refresh_token');
      }
      if (!ssoCode) {
        ssoCode = hashParams.get('sso_code') || hashParams.get('code');
      }
    }
  } catch {
    // Regex fallback parser
    const matchToken = rawUrl.match(/[?&#](?:token|sso_token|accessToken|jwt)=([^&#]+)/);
    const matchRefresh = rawUrl.match(/[?&#](?:refreshToken|refresh_token)=([^&#]+)/);
    const matchCode = rawUrl.match(/[?&#](?:sso_code|code)=([^&#]+)/);

    token = matchToken?.[1] ? decodeURIComponent(matchToken[1]) : null;
    refreshToken = matchRefresh?.[1] ? decodeURIComponent(matchRefresh[1]) : null;
    ssoCode = matchCode?.[1] ? decodeURIComponent(matchCode[1]) : null;
  }

  return { token, refreshToken, ssoCode };
}

/**
 * Clean domain extractor for display in the SSL security badge
 */
function getDisplayDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname + (parsed.port ? `:${parsed.port}` : '');
  } catch {
    return 'accounts.definitely.live';
  }
}

export function AuthWebViewModal({
  visible,
  mode = 'login',
  onClose,
  onSuccess,
}: AuthWebViewModalProps) {
  const { colors, isDark } = useTheme();
  const loginWithTokens = useAuthStore((s) => s.loginWithTokens);

  const webViewRef = useRef<BaseWebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  // Animated laser progress bar width
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Generate unique sso_code per open session
  const ssoSessionCode = useMemo(() => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }, [visible, mode]);

  // Construct target accounts URL
  const targetUrl = useMemo(() => {
    const targetPath = mode === 'signup' ? '/signup' : '/login';
    const redirect = encodeURIComponent(AUTH_CONFIG.REDIRECT_URI);
    const code = encodeURIComponent(ssoSessionCode);
    return `${AUTH_CONFIG.ACCOUNTS_URL}${targetPath}?redirect=${redirect}&platform=mobile&sso_code=${code}`;
  }, [mode, ssoSessionCode]);

  const [currentUrl, setCurrentUrl] = useState(targetUrl);

  // Update progress bar animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: loadProgress,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [loadProgress, progressAnim]);

  // Reset state on open
  useEffect(() => {
    if (visible) {
      setIsLoading(true);
      setLoadProgress(0);
      setErrorMessage(null);
      setIsCompleting(false);
      setCanGoBack(false);
      setCurrentUrl(targetUrl);
    }
  }, [visible, targetUrl]);

  // Android hardware back button integration
  useEffect(() => {
    if (!visible) return;

    const onHardwareBack = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      onClose();
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => sub.remove();
  }, [visible, canGoBack, onClose]);

  // Finalize authentication and save tokens
  const handleCompleteAuth = useCallback(
    async (token: string, refreshToken?: string | null) => {
      setIsCompleting(true);
      try {
        const ok = await loginWithTokens(token, refreshToken || undefined);
        if (ok) {
          onSuccess?.();
          onClose();
        } else {
          setErrorMessage('Session verification failed. Please try signing in again.');
          setIsCompleting(false);
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Authentication error.');
        setIsCompleting(false);
      }
    },
    [loginWithTokens, onClose, onSuccess]
  );

  // Intercept navigation requests (Deep links & Callback redirects)
  const handleShouldStartLoadWithRequest = useCallback(
    (request: WebViewNavigation): boolean => {
      const url = request.url;

      // 1. Check for native app redirects or auth callback paths
      const isCallbackTarget =
        url.startsWith('definitelyone://') ||
        url.startsWith('exp://') ||
        url.startsWith('exps://') ||
        url.includes('/auth/callback');

      if (isCallbackTarget) {
        const { token, refreshToken, ssoCode } = extractTokensFromUrl(url);

        if (token) {
          handleCompleteAuth(token, refreshToken);
          return false; // Intercept: don't let webview try to load custom scheme
        }

        // If ssoCode exists in callback without inline tokens, poll the backend
        if (ssoCode) {
          setIsCompleting(true);
          const pollUrl = `${AUTH_CONFIG.API_URL}/api/auth/sso/poll?code=${encodeURIComponent(ssoCode)}`;
          fetch(pollUrl, { headers: { Accept: 'application/json' } })
            .then((res) => res.json())
            .then((data) => {
              if (data.success && data.token) {
                handleCompleteAuth(data.token, data.refreshToken);
              } else {
                setErrorMessage('SSO session validation expired.');
                setIsCompleting(false);
              }
            })
            .catch(() => {
              setErrorMessage('Failed to communicate with authentication gateway.');
              setIsCompleting(false);
            });
          return false;
        }

        // Intercept any unhandled definitelyone:// link
        if (url.startsWith('definitelyone://')) {
          return false;
        }
      }

      return true;
    },
    [handleCompleteAuth]
  );

  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      setCanGoBack(navState.canGoBack);
      if (navState.url && navState.url !== 'about:blank') {
        setCurrentUrl(navState.url);

        // Extra check for inline token query in navigation state
        const { token, refreshToken } = extractTokensFromUrl(navState.url);
        if (token && !isCompleting) {
          handleCompleteAuth(token, refreshToken);
        }
      }
    },
    [handleCompleteAuth, isCompleting]
  );

  // Handle messages dispatched from inside the WebView (e.g. Google Sign-In button intercept)
  const handleMessage = useCallback(
    async (event: { nativeEvent: { data: string } }) => {
      try {
        const payload = JSON.parse(event.nativeEvent.data);
        if (payload.type === 'GOOGLE_SIGN_IN') {
          setIsCompleting(true);
          const ssoCode = Math.random().toString(36).substring(2) + Date.now().toString(36);
          const redirectUri = AUTH_CONFIG.REDIRECT_URI;
          const authUrl = `${AUTH_CONFIG.ACCOUNTS_URL}/login?redirect=${encodeURIComponent(
            redirectUri
          )}&platform=mobile&sso_code=${encodeURIComponent(ssoCode)}`;

          // Delegate to system browser (Chrome Custom Tabs / ASWebAuthenticationSession)
          const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
          if (result.type === 'success' && result.url) {
            const { token, refreshToken } = extractTokensFromUrl(result.url);
            if (token) {
              await handleCompleteAuth(token, refreshToken);
            } else {
              setIsCompleting(false);
            }
          } else {
            setIsCompleting(false);
          }
        }
      } catch {
        // ignore non-json messages
      }
    },
    [handleCompleteAuth]
  );

  const displayDomain = useMemo(() => getDisplayDomain(currentUrl), [currentUrl]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={onClose}>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
        edges={['top', 'bottom', 'left', 'right']}>
        {/* Top Header Bar */}
        <View
          style={[
            styles.headerBar,
            {
              backgroundColor: colors.card,
              borderBottomColor: colors.cardBorder,
            },
          ]}>
          <View style={styles.headerLeftGroup}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.iconButton, { backgroundColor: colors.backgroundElement }]}
              accessibilityLabel="Close sign-in">
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>

            {canGoBack && (
              <TouchableOpacity
                onPress={() => webViewRef.current?.goBack()}
                style={[styles.iconButton, { backgroundColor: colors.backgroundElement }]}
                accessibilityLabel="Go back">
                <Ionicons name="chevron-back" size={20} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>

          {/* SSL / Domain Indicator */}
          <View style={styles.domainBadge}>
            <View style={styles.sslRow}>
              <Ionicons name="shield-checkmark" size={13} color="#10B981" />
              <ThemedText style={styles.domainText} numberOfLines={1}>
                {displayDomain}
              </ThemedText>
            </View>
            <ThemedText type="small" style={[styles.subDomainText, { color: colors.textSecondary }]}>
              Definitely Universal SSO
            </ThemedText>
          </View>

          {/* Right Action: Refresh */}
          <TouchableOpacity
            onPress={() => webViewRef.current?.reload()}
            style={[styles.iconButton, { backgroundColor: colors.backgroundElement }]}
            accessibilityLabel="Reload page">
            <Ionicons name="reload-outline" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Animated Laser Progress Bar */}
        {loadProgress < 1 && (
          <View style={[styles.progressTrack, { backgroundColor: colors.backgroundElement }]}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  backgroundColor: colors.primary,
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        )}

        {/* Main Content Area */}
        <View style={styles.contentContainer}>
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <View style={[styles.errorIconBox, { backgroundColor: '#fee2e2' }]}>
                <Ionicons name="alert-circle" size={36} color="#ef4444" />
              </View>
              <ThemedText style={styles.errorTitle}>Connection Error</ThemedText>
              <ThemedText style={[styles.errorDescription, { color: colors.textSecondary }]}>
                {errorMessage}
              </ThemedText>

              <TouchableOpacity
                style={[styles.retryBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setErrorMessage(null);
                  setIsLoading(true);
                  webViewRef.current?.reload();
                }}>
                <Ionicons name="refresh" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <ThemedText style={styles.retryBtnText}>Try Again</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelLink} onPress={onClose}>
                <ThemedText type="small" style={{ color: colors.textSecondary }}>
                  Cancel and return to app
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <WebView
              ref={webViewRef}
              source={{ uri: targetUrl }}
              style={[
                styles.webView,
                { backgroundColor: isDark ? '#0B0F17' : '#FFFFFF' },
              ]}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              sharedCookiesEnabled={true}
              thirdPartyCookiesEnabled={true}
              javaScriptCanOpenWindowsAutomatically={true}
              setSupportMultipleWindows={true}
              userAgent={CHROME_MOBILE_UA}
              injectedJavaScriptBeforeContentLoaded={INJECTED_AUTH_BRIDGE}
              onMessage={handleMessage}
              startInLoadingState={true}
              allowsBackForwardNavigationGestures={true}
              originWhitelist={['*']}
              onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
              onNavigationStateChange={handleNavigationStateChange}
              onLoadProgress={({ nativeEvent }: { nativeEvent: { progress: number } }) =>
                setLoadProgress(nativeEvent.progress)
              }
              onLoadStart={() => {
                setIsLoading(true);
                setErrorMessage(null);
              }}
              onLoadEnd={() => setIsLoading(false)}
              onError={(e: { nativeEvent: { description?: string } }) => {
                setErrorMessage(e.nativeEvent?.description || 'Unable to connect to authentication server.');
                setIsLoading(false);
              }}
              renderError={() => (
                <View style={[styles.centerLoading, { backgroundColor: colors.background }]}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              )}
              renderLoading={() => (
                <View style={[styles.centerLoading, { backgroundColor: colors.background }]}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <ThemedText style={[styles.loadingHint, { color: colors.textSecondary }]}>
                    Connecting to Definitely SSO...
                  </ThemedText>
                </View>
              )}
            />
          )}

          {/* Completing Handshake Overlay */}
          {isCompleting && (
            <View
              style={[
                styles.completingOverlay,
                { backgroundColor: isDark ? 'rgba(11, 15, 23, 0.94)' : 'rgba(255, 255, 255, 0.94)' },
              ]}>
              <View style={[styles.completingCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 16 }} />
                <ThemedText style={styles.completingTitle}>Verifying Security Session</ThemedText>
                <ThemedText type="small" style={[styles.completingSubtitle, { color: colors.textSecondary }]}>
                  Syncing with Hardware Keystore...
                </ThemedText>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  domainBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '60%',
  },
  sslRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  domainText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subDomainText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  progressTrack: {
    height: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  centerLoading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingHint: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '500',
  },
  completingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    padding: 24,
  },
  completingCard: {
    padding: 28,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    minWidth: 260,
  },
  completingTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  completingSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelLink: {
    marginTop: 16,
    padding: 8,
  },
});
