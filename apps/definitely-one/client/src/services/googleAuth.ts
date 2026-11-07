import { Platform, TurboModuleRegistry, NativeModules } from 'react-native';
import { AUTH_CONFIG } from '@/api/config';
import { useAuthStore } from '@/store/authStore';

// Web Client ID extracted from google-services.json
export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  '919056358557-279s5img3g81t09il4vgmdpd9ag8a2te.apps.googleusercontent.com';

let isConfigured = false;

/**
 * Checks if the native Google Sign-In module is present in the current runtime binary.
 * In Expo Go, this safely returns false without triggering an Invariant Violation.
 * In standalone APK builds (built with EAS), this returns true.
 */
export function isNativeGoogleSigninAvailable(): boolean {
  if (Platform.OS === 'web') return false;
  try {
    const turbo = (TurboModuleRegistry as any)?.get?.('RNGoogleSignin');
    const legacy = (NativeModules as any)?.RNGoogleSignin;
    return Boolean(turbo || legacy);
  } catch {
    return false;
  }
}

/**
 * Configure native Google Sign-In SDK (only when running in native build)
 */
export function configureGoogleSignIn(): boolean {
  if (isConfigured) return true;
  if (!isNativeGoogleSigninAvailable()) return false;

  try {
    const { GoogleSignin } = require('@react-native-google-signin/google-signin');
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
      scopes: ['profile', 'email'],
    });
    isConfigured = true;
    return true;
  } catch (err) {
    console.warn('[GoogleAuth] Native GoogleSignin.configure error:', err);
    return false;
  }
}

// Firebase Web API Key for project interview-f410a
const FIREBASE_API_KEY =
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
  'AIzaSyBO9P8Yi6qLDMnV0OoCqkTa9PCaDgBg5CE';

/**
 * Exchanges a raw Google Play Services ID token for a Firebase Auth ID token.
 * This is required because https://api.accounts.definitely.live/api/auth/session
 * validates tokens using Firebase Admin SDK (adminAuth.verifyIdToken), which expects
 * an issuer of https://securetoken.google.com/interview-f410a.
 */
async function exchangeGoogleForFirebaseToken(googleIdToken: string): Promise<string> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postBody: `id_token=${googleIdToken}&providerId=google.com`,
        requestUri: 'http://localhost',
        returnIdpCredential: true,
        returnSecureToken: true,
      }),
    }
  );

  const data = await res.json();
  if (!res.ok || !data.idToken) {
    const errorMsg = data.error?.message || 'Failed to exchange Google token with Firebase';
    throw new Error(errorMsg);
  }

  return data.idToken;
}

/**
 * Exchange Google ID token for Definitely One session JWT via central auth-service
 */
async function exchangeGoogleIdToken(googleIdToken: string): Promise<boolean> {
  const store = useAuthStore.getState();

  // 1. Convert raw Google OAuth ID token to Firebase ID token
  const firebaseIdToken = await exchangeGoogleForFirebaseToken(googleIdToken);

  // 2. Send Firebase ID token to central accounts backend session endpoint
  const res = await fetch(`${AUTH_CONFIG.API_URL}/api/auth/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      idToken: firebaseIdToken,
      platform: 'mobile',
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Authentication failed with status ${res.status}`);
  }

  const data = await res.json();
  if (!data.success || !data.token) {
    throw new Error(data.error || 'No authentication token returned by server');
  }

  return await store.loginWithTokens(data.token, data.refreshToken, data.user);
}

/**
 * Perform Google Sign-In:
 * - In Standalone APK (EAS Build / Production): Opens native Android on-screen account picker.
 * - In Expo Go / Dev Client without native code: Gracefully falls back to browser session.
 */
export async function performGoogleSignIn(): Promise<boolean> {
  const store = useAuthStore.getState();

  // If running in Expo Go or environment without native Google module, use browser fallback
  if (!isNativeGoogleSigninAvailable()) {
    console.log('[GoogleAuth] Native module not detected in runtime (Expo Go mode). Using browser auth.');
    return await store.openSsoLogin();
  }

  try {
    const { GoogleSignin } = require('@react-native-google-signin/google-signin');

    configureGoogleSignIn();

    // 1. Check if Google Play Services is available on device
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // 2. Trigger native on-screen account chooser popup
    const response = await GoogleSignin.signIn();

    if (response.type === 'success' && response.data) {
      let idToken = response.data.idToken;

      if (!idToken) {
        const tokens = await GoogleSignin.getTokens();
        idToken = tokens.idToken;
      }

      if (!idToken) {
        throw new Error('Google Sign-In completed, but no ID token was provided.');
      }

      // 3. Exchange with backend for ecosystem session
      return await exchangeGoogleIdToken(idToken);
    } else if (response.type === 'cancelled') {
      return false;
    }

    return false;
  } catch (error: any) {
    try {
      const { statusCodes } = require('@react-native-google-signin/google-signin');
      if (error.code === statusCodes?.SIGN_IN_CANCELLED) {
        return false;
      }
      if (error.code === statusCodes?.IN_PROGRESS) {
        return false;
      }
    } catch {}

    console.warn('[GoogleAuth] Native sign-in failed, trying browser fallback:', error.message || error);
    return await store.openSsoLogin();
  }
}
