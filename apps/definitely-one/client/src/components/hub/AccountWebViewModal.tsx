import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Platform,
  Animated,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export interface AccountWebViewModalProps {
  visible: boolean;
  onClose: () => void;
  targetUrl?: string;
}

export function AccountWebViewModal({
  visible,
  onClose,
  targetUrl = AUTH_CONFIG.ACCOUNTS_URL,
}: AccountWebViewModalProps) {
  const { colors, isDark } = useTheme();
  const tokens = useAuthStore((s) => s.tokens);

  const webViewRef = useRef<BaseWebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const progressAnim = useRef(new Animated.Value(0)).current;

  // Build target URL injecting session token parameter if present
  const resolvedUrl = React.useMemo(() => {
    try {
      const url = new URL(targetUrl);
      if (tokens?.accessToken && !url.searchParams.has('token')) {
        url.searchParams.set('token', tokens.accessToken);
      }
      return url.toString();
    } catch {
      return targetUrl;
    }
  }, [targetUrl, tokens?.accessToken]);

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: loadProgress,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [loadProgress, progressAnim]);

  // Reset state on modal open
  useEffect(() => {
    if (visible) {
      setIsLoading(true);
      setLoadProgress(0);
      setErrorMessage(null);
      setCanGoBack(false);
      setCanGoForward(false);
    }
  }, [visible]);

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

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setIsLoading(navState.loading);
  };

  const handleOpenExternal = () => {
    Linking.openURL(targetUrl).catch(() => {});
  };

  // Injected script to sync session token in webview storage
  const injectedSessionScript = `
    (function() {
      try {
        var token = '${tokens?.accessToken || ''}';
        if (token) {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('definitely_session', token);
          sessionStorage.setItem('auth_token', token);
          document.cookie = 'definitely_session=' + token + '; path=/; domain=.definitely.live; max-age=604800; SameSite=Lax';
        }
      } catch(e) {}
    })();
    true;
  `;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={onClose}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top', 'left', 'right']}>
        {/* Navigation Bar */}
        <View style={[styles.headerBar, { borderBottomColor: colors.cardBorder }]}>
          <View style={styles.navControls}>
            <TouchableOpacity
              onPress={() => webViewRef.current?.goBack()}
              disabled={!canGoBack}
              style={[styles.navBtn, { opacity: canGoBack ? 1 : 0.35 }]}
              accessibilityLabel="Go Back">
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => webViewRef.current?.goForward()}
              disabled={!canGoForward}
              style={[styles.navBtn, { opacity: canGoForward ? 1 : 0.35 }]}
              accessibilityLabel="Go Forward">
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => webViewRef.current?.reload()}
              style={styles.navBtn}
              accessibilityLabel="Reload">
              <Ionicons name="reload-outline" size={17} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* SSL Badge / Domain Title */}
          <View style={[styles.sslBadge, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
            <Ionicons name="lock-closed" size={11} color={colors.success} />
            <ThemedText style={styles.sslText} numberOfLines={1}>
              accounts.definitely.live
            </ThemedText>
          </View>

          {/* Actions */}
          <View style={styles.rightActions}>
            <TouchableOpacity
              onPress={handleOpenExternal}
              style={styles.navBtn}
              accessibilityLabel="Open in Browser">
              <Ionicons name="open-outline" size={17} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.backgroundElement }]}
              accessibilityLabel="Close">
              <Ionicons name="close" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Animated Progress Bar */}
        <View style={styles.progressBarContainer}>
          {isLoading && (
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
          )}
        </View>

        {/* WebView Core */}
        <View style={styles.webWrapper}>
          <WebView
            ref={webViewRef}
            source={{ uri: resolvedUrl }}
            onNavigationStateChange={handleNavigationStateChange}
            onLoadProgress={({ nativeEvent }) => setLoadProgress(nativeEvent.progress)}
            onError={(e) => setErrorMessage(e.nativeEvent.description || 'Failed to load page.')}
            onHttpError={(e) => {
              if (e.nativeEvent.statusCode >= 500) {
                setErrorMessage(`Server error: ${e.nativeEvent.statusCode}`);
              }
            }}
            injectedJavaScriptBeforeContentLoaded={injectedSessionScript}
            userAgent={CHROME_MOBILE_UA}
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            mixedContentMode="always"
            allowsInlineMediaPlayback
            startInLoadingState
            renderLoading={() => (
              <View style={[styles.loadingOverlay, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Connecting to Definitely ID...
                </ThemedText>
              </View>
            )}
            style={{ backgroundColor: colors.background }}
          />

          {/* Error View */}
          {errorMessage && (
            <View style={[styles.errorOverlay, { backgroundColor: colors.background }]}>
              <View style={[styles.errorCircle, { backgroundColor: `${colors.danger}15` }]}>
                <Ionicons name="cloud-offline-outline" size={32} color={colors.danger} />
              </View>
              <ThemedText style={styles.errorTitle}>Connection Error</ThemedText>
              <ThemedText style={[styles.errorDesc, { color: colors.textSecondary }]}>
                {errorMessage}
              </ThemedText>
              <TouchableOpacity
                style={[styles.retryBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setErrorMessage(null);
                  webViewRef.current?.reload();
                }}>
                <ThemedText style={styles.retryBtnText}>Retry Connection</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sslBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    maxWidth: '52%',
  },
  sslText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarContainer: {
    height: 2,
    width: '100%',
    backgroundColor: 'transparent',
  },
  progressBar: {
    height: 2,
  },
  webWrapper: {
    flex: 1,
    position: 'relative',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  errorCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  errorDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
