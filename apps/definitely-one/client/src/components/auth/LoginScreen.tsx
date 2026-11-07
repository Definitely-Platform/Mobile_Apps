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
import { useAuthStore, DEMO_USER } from '@/store/authStore';
import { useTheme } from '@/hooks/use-theme';

export function LoginScreen() {
  const { colors } = useTheme();
  const openSsoLogin = useAuthStore((s) => s.openSsoLogin);
  const openSsoRegister = useAuthStore((s) => s.openSsoRegister);
  const loginWithTokens = useAuthStore((s) => s.loginWithTokens);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [webViewMode, setWebViewMode] = useState<'login' | 'signup'>('login');
  const [ssoLoading, setSsoLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [showDeveloperInput, setShowDeveloperInput] = useState(false);
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
      const ok = await openSsoLogin();
      if (!ok) {
        setSsoLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Google Sign-On failed');
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
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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
            One account. Every tool, service & product.
          </ThemedText>
        </View>

        {/* Auth Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}>
          <ThemedText style={styles.cardHeader}>Sign in to your account</ThemedText>
          <ThemedText type="small" style={{ color: colors.textSecondary, marginBottom: 20 }}>
            Universal Ecosystem SSO across Web, Desktop & Mobile
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
            disabled={ssoLoading || registerLoading}
            activeOpacity={0.85}>
            <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <ThemedText style={styles.primaryButtonText}>
              Sign in with Definitely SSO
            </ThemedText>
          </TouchableOpacity>

          {/* Direct Google SSO Action */}
          <TouchableOpacity
            style={[
              styles.googleButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
            onPress={handleGoogleSignIn}
            disabled={ssoLoading || registerLoading}
            activeOpacity={0.85}>
            {ssoLoading ? (
              <ActivityIndicator color="#EA4335" size="small" style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="logo-google" size={18} color="#EA4335" style={{ marginRight: 8 }} />
            )}
            <ThemedText style={[styles.googleButtonText, { color: colors.text }]}>
              {ssoLoading ? 'Connecting to Google...' : 'Continue with Google'}
            </ThemedText>
          </TouchableOpacity>

          {/* Secondary Register Action */}
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.cardBorder,
              },
            ]}
            onPress={handleSsoRegister}
            disabled={ssoLoading || registerLoading}
            activeOpacity={0.85}>
            {registerLoading ? (
              <ActivityIndicator color={colors.text} size="small" style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="person-add-outline" size={18} color={colors.text} style={{ marginRight: 8 }} />
            )}
            <ThemedText style={[styles.secondaryButtonText, { color: colors.text }]}>
              {registerLoading ? 'Opening registration...' : 'Create an Account'}
            </ThemedText>
          </TouchableOpacity>

          <ThemedText type="small" style={[styles.ssoHint, { color: colors.textSecondary }]}>
            Secure in-app authentication via Definitely Accounts
          </ThemedText>

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
            <ThemedText type="small" style={[styles.dividerText, { color: colors.textSecondary }]}>
              developer options
            </ThemedText>
            <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
          </View>

          {/* Quick Demo Access */}
          <TouchableOpacity
            style={[styles.demoButton, { borderColor: colors.primary }]}
            onPress={handleQuickDemo}
            disabled={devLoading || ssoLoading}>
            <Ionicons name="flash-outline" size={18} color={colors.primary} />
            <ThemedText style={[styles.demoButtonText, { color: colors.primary }]}>
              Quick Demo Access
            </ThemedText>
          </TouchableOpacity>

          {/* Developer Token Quick Connect Toggle */}
          <TouchableOpacity
            onPress={() => setShowDeveloperInput(!showDeveloperInput)}
            style={styles.devToggle}>
            <Ionicons name="key-outline" size={14} color={colors.textSecondary} />
            <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
              {showDeveloperInput ? 'Hide developer token' : 'Developer token quick connect'}
            </ThemedText>
          </TouchableOpacity>

          {showDeveloperInput && (
            <View style={styles.devInputContainer}>
              <TextInput
                value={manualToken}
                onChangeText={setManualToken}
                placeholder="Paste Bearer JWT token..."
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                style={[
                  styles.devInput,
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
                  styles.devSubmitBtn,
                  { backgroundColor: colors.backgroundElement, opacity: manualToken.trim() ? 1 : 0.5 },
                ]}>
                <ThemedText type="small" style={{ fontWeight: '600', color: colors.text }}>
                  {devLoading ? 'Connecting...' : 'Connect with Token'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <ThemedText type="small" style={[styles.footerNotice, { color: colors.textSecondary }]}>
          Protected by Definitely One SSO & Hardware Keystore
        </ThemedText>
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
    padding: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoNumber: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandHighlight: {
    fontSize: 28,
    fontWeight: '800',
    marginLeft: 4,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
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
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
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
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ssoHint: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 10,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  devToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 4,
  },
  devInputContainer: {
    marginTop: 12,
    gap: 8,
  },
  devInput: {
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  devSubmitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  footerNotice: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 11,
  },
});
