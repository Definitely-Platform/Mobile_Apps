import * as LocalAuthentication from 'expo-local-authentication';

export const BiometricsService = {
  async isHardwareAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch {
      return false;
    }
  },

  async authenticate(promptMessage = 'Unlock Definitely One'): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use Device Passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });
      return result.success;
    } catch (err) {
      console.warn('[Biometrics] Auth failed:', err);
      return false;
    }
  },
};
