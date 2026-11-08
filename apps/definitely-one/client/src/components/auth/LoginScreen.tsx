import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { AuthWebViewModal } from '@/components/auth/AuthWebViewModal';
import { performGoogleSignIn } from '@/services/googleAuth';
import { useAuthStore, DEMO_USER } from '@/store/authStore';
import { useTheme } from '@/hooks/use-theme';

export function LoginScreen() {
  const { colors } = useTheme();
  const loginWithTokens = useAuthStore((s) => s.loginWithTokens);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [webViewMode, setWebViewMode] = useState<'login' | 'signup'>('login');
  const [ssoLoading, setSsoLoading] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [devLoading, setDevLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSsoSignIn = () => {
    setError(null);
    setWebViewMode('login');
    setWebViewVisible(true);
  };

  const handleSsoRegister = () => {
    setError(null);
    setWebViewMode('signup');
    setWebViewVisible(true);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSsoLoading(true);
    try {
      const ok = await performGoogleSignIn();
      if (!ok) {
        setSsoLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Google Sign-In failed');
      setSsoLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setError(null);
    setDevLoading(true);
    try {
      await loginWithTokens(
        'demo_jwt_access_token',
        'demo_jwt_refresh_token',
        DEMO_USER
      );
    } finally {
      setDevLoading(false);
    }
  };

  const handleManualTokenSubmit = async () => {
    if (!manualToken.trim()) return;
    setError(null);
    setDevLoading(true);
    try {
      const ok = await loginWithTokens(manualToken.trim());
      if (!ok) {
        setError('Invalid or expired Bearer token.');
      }
    } catch (err: any) {
      setError(err?.message || 'Token verification failed.');
    } finally {
      setDevLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
            <ThemedText style={styles.logoNumber}>1</ThemedText>
          </View>
          <View style={styles.brandTitleRow}>
            <ThemedText style={styles.brandTitle}>Definitely</ThemedText>
            <ThemedText style={[styles.brandHighlight, { color: colors.primary }]}>One</ThemedText>
          </View>
          <ThemedText style={[styles.brandTagline, { color: colors.textSecondary }]}>
            Universal Ecosystem Access
          </ThemedText>
        </View>

        {/* Main Authentication Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}>
          <ThemedText style={styles.cardHeader}>Sign In</ThemedText>
          <ThemedText type="small" style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            Access all platforms with your single identity
          </ThemedText>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={16} color="#ef4444" />
              <ThemedText type="small" style={styles.errorText}>
                {error}
              </ThemedText>
            </View>
          )}

          {/* Primary SSO Action */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleSsoSignIn}
            activeOpacity={0.85}>
            <Ionicons name="shield-checkmark" size={19} color="#FFFFFF" style={{ marginRight: 8 }} />
            <ThemedText style={styles.primaryButtonText}>
              Continue with Definitely SSO
            </ThemedText>
          </TouchableOpacity>

          {/* Google SSO Action */}
          <TouchableOpacity
            style={[
              styles.googleButton,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.cardBorder,
              },
            ]}
            onPress={handleGoogleSignIn}
            disabled={ssoLoading}
            activeOpacity={0.85}>
            {ssoLoading ? (
              <ActivityIndicator color="#EA4335" size="small" style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="logo-google" size={18} color="#EA4335" style={{ marginRight: 8 }} />
            )}
            <ThemedText style={[styles.googleButtonText, { color: colors.text }]}>
              {ssoLoading ? 'Connecting...' : 'Continue with Google'}
            </ThemedText>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
            <ThemedText type="small" style={[styles.dividerText, { color: colors.textSecondary }]}>
              or
            </ThemedText>
            <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
          </View>

          {/* Create Account Link */}
          <TouchableOpacity
            style={styles.registerRow}
            onPress={handleSsoRegister}
            activeOpacity={0.75}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Don’t have an account?{' '}
            </ThemedText>
            <ThemedText type="small" style={[styles.registerLink, { color: colors.primary }]}>
              Create one
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Developer / Demo Access Section (Unobtrusive) */}
        <View style={styles.devSection}>
          <TouchableOpacity
            onPress={() => setShowDevPanel(!showDevPanel)}
            style={styles.devToggle}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons
              name={showDevPanel ? 'chevron-up' : 'code-slash-outline'}
              size={14}
              color={colors.textSecondary}
            />
            <ThemedText type="small" style={[styles.devToggleText, { color: colors.textSecondary }]}>
              {showDevPanel ? 'Hide developer tools' : 'Developer & Demo access'}
            </ThemedText>
          </TouchableOpacity>

          {showDevPanel && (
            <View
              style={[
                styles.devCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}>
              <TouchableOpacity
                style={[styles.demoButton, { borderColor: colors.primary }]}
                onPress={handleQuickDemo}
                disabled={devLoading}>
                <Ionicons name="flash-outline" size={16} color={colors.primary} />
                <ThemedText style={[styles.demoButtonText, { color: colors.primary }]}>
                  {devLoading ? 'Loading Demo...' : 'Quick Demo Mode'}
                </ThemedText>
              </TouchableOpacity>

              <View style={styles.tokenContainer}>
                <TextInput
                  value={manualToken}
                  onChangeText={setManualToken}
                  placeholder="Paste Bearer JWT token..."
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  style={[
                    styles.tokenInput,
                    {
                      color: colors.text,
                      backgroundColor: colors.backgroundElement,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                />
                <TouchableOpacity
                  onPress={handleManualTokenSubmit}
                  disabled={devLoading || !manualToken.trim()}
                  style={[
                    styles.tokenSubmitBtn,
                    {
                      backgroundColor: colors.primary,
                      opacity: manualToken.trim() ? 1 : 0.5,
                    },
                  ]}>
                  <ThemedText style={styles.tokenSubmitText}>Connect</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Footer Security Pill */}
        <View style={styles.footerRow}>
          <Ionicons name="shield-checkmark-outline" size={13} color={colors.textSecondary} />
          <ThemedText type="small" style={[styles.footerText, { color: colors.textSecondary }]}>
            Protected by Definitely SSO & Hardware Keystore
          </ThemedText>
        </View>
      </ScrollView>

      {/* Embedded In-App Authentication WebView */}
      <AuthWebViewModal
        visible={webViewVisible}
        mode={webViewMode}
        onClose={() => setWebViewVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 32,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  logoNumber: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  brandTagline: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  card: {
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 18,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    gap: 6,
  },
  errorText: {
    color: '#ef4444',
    flex: 1,
    fontSize: 13,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 13,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 13,
    borderWidth: 1,
    marginTop: 10,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  registerLink: {
    fontWeight: '700',
  },
  devSection: {
    marginTop: 16,
    alignItems: 'center',
  },
  devToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  devToggleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  devCard: {
    width: '100%',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginTop: 10,
    gap: 10,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
    borderWidth: 1,
    gap: 6,
  },
  demoButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tokenContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tokenInput: {
    flex: 1,
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  tokenSubmitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  tokenSubmitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  footerText: {
    fontSize: 11,
  },
});
