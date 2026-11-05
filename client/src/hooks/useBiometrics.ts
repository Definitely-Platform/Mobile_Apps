import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

export interface BiometricCapabilities {
  hasHardware: boolean;
  isEnrolled: boolean;
  biometricType: 'FaceID' | 'Fingerprint' | 'Iris' | 'None';
  isLoading: boolean;
}

export function useBiometrics() {
  const [capabilities, setCapabilities] = useState<BiometricCapabilities>({
    hasHardware: false,
    isEnrolled: false,
    biometricType: 'None',
    isLoading: true,
  });

  const checkCapabilities = useCallback(async () => {
    if (Platform.OS === 'web') {
      setCapabilities({
        hasHardware: false,
        isEnrolled: false,
        biometricType: 'None',
        isLoading: false,
      });
      return;
    }

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

      let biometricType: BiometricCapabilities['biometricType'] = 'None';
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = 'FaceID';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = 'Fingerprint';
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometricType = 'Iris';
      }

      setCapabilities({
        hasHardware,
        isEnrolled,
        biometricType,
        isLoading: false,
      });
    } catch {
      setCapabilities({
        hasHardware: false,
        isEnrolled: false,
        biometricType: 'None',
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    checkCapabilities();
  }, [checkCapabilities]);

  const authenticate = useCallback(
    async (promptMessage = 'Authenticate to access Definitely One'): Promise<boolean> => {
      if (Platform.OS === 'web') {
        return true;
      }

      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage,
          fallbackLabel: 'Use Passcode',
          disableDeviceFallback: false,
          cancelLabel: 'Cancel',
        });
        return result.success;
      } catch (e) {
        console.error('Biometric authentication error', e);
        return false;
      }
    },
    []
  );

  return {
    ...capabilities,
    authenticate,
    refresh: checkCapabilities,
  };
}
