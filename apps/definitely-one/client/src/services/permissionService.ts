import { Platform, PermissionsAndroid, Permission } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SecureStorage } from '@/utils/secureStorage';

export interface PermissionStatusMap {
  camera: boolean;
  gallery: boolean;
  notifications: boolean;
  phone: boolean;
}

const STORAGE_KEY_PERMISSIONS_ONBOARDED = 'ecosystem_permissions_onboarded_v1';

export const PermissionService = {
  /**
   * Checks whether the user has already seen and answered the post-login permission setup
   */
  async hasCompletedOnboarding(): Promise<boolean> {
    const value = await SecureStorage.getItem(STORAGE_KEY_PERMISSIONS_ONBOARDED);
    return value === 'true';
  },

  /**
   * Marks permission setup onboarding as completed
   */
  async setOnboardingCompleted(): Promise<void> {
    await SecureStorage.setItem(STORAGE_KEY_PERMISSIONS_ONBOARDED, 'true');
  },

  /**
   * Resets onboarding flag (e.g. for testing or re-check)
   */
  async resetOnboarding(): Promise<void> {
    await SecureStorage.removeItem(STORAGE_KEY_PERMISSIONS_ONBOARDED);
  },

  /**
   * Checks current permission statuses
   */
  async checkPermissions(): Promise<PermissionStatusMap> {
    if (Platform.OS !== 'android') {
      try {
        const [cam, gal] = await Promise.all([
          ImagePicker.getCameraPermissionsAsync(),
          ImagePicker.getMediaLibraryPermissionsAsync(),
        ]);
        return {
          camera: cam.granted,
          gallery: gal.granted,
          notifications: true,
          phone: true,
        };
      } catch {
        return {
          camera: true,
          gallery: true,
          notifications: true,
          phone: true,
        };
      }
    }

    try {
      let cameraGranted = false;
      try {
        const camRes = await ImagePicker.getCameraPermissionsAsync();
        cameraGranted = camRes.granted;
      } catch {
        cameraGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
      }

      const phoneGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE
      );

      const apiLevel =
        typeof Platform.Version === 'number'
          ? Platform.Version
          : parseInt(String(Platform.Version), 10) || 0;

      let notifGranted = true;
      if (apiLevel >= 33) {
        notifGranted = await PermissionsAndroid.check(
          'android.permission.POST_NOTIFICATIONS' as Permission
        );
      }

      let galleryGranted = false;
      try {
        const galRes = await ImagePicker.getMediaLibraryPermissionsAsync();
        galleryGranted = galRes.granted;
      } catch {
        if (apiLevel >= 33) {
          galleryGranted = await PermissionsAndroid.check(
            'android.permission.READ_MEDIA_IMAGES' as Permission
          );
        } else {
          galleryGranted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
          );
        }
      }

      return {
        camera: cameraGranted,
        gallery: galleryGranted,
        notifications: notifGranted,
        phone: phoneGranted,
      };
    } catch (err) {
      console.warn('[PermissionService] Check failed:', err);
      return {
        camera: false,
        gallery: false,
        notifications: false,
        phone: false,
      };
    }
  },

  /**
   * Requests media library / gallery permissions using expo-image-picker
   */
  async requestGalleryPermission(): Promise<boolean> {
    try {
      const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return res.granted;
    } catch (err) {
      console.warn('[PermissionService] requestGalleryPermission error:', err);
      return false;
    }
  },

  /**
   * Requests camera permissions using expo-image-picker
   */
  async requestCameraPermission(): Promise<boolean> {
    try {
      const res = await ImagePicker.requestCameraPermissionsAsync();
      return res.granted;
    } catch (err) {
      console.warn('[PermissionService] requestCameraPermission error:', err);
      return false;
    }
  },

  /**
   * Requests Phone, Camera, Gallery, and Notification permissions in one unified batch
   */
  async requestAllPermissions(): Promise<PermissionStatusMap> {
    if (Platform.OS !== 'android') {
      await this.setOnboardingCompleted();
      return {
        camera: true,
        gallery: true,
        notifications: true,
        phone: true,
      };
    }

    const permissionsToRequest: Permission[] = [
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
    ];

    const apiLevel =
      typeof Platform.Version === 'number'
        ? Platform.Version
        : parseInt(String(Platform.Version), 10) || 0;

    if (apiLevel >= 33) {
      permissionsToRequest.push('android.permission.POST_NOTIFICATIONS' as Permission);
      permissionsToRequest.push('android.permission.READ_MEDIA_IMAGES' as Permission);
    } else {
      permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    }

    try {
      const results = await PermissionsAndroid.requestMultiple(permissionsToRequest);

      const cameraGranted =
        results[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED;

      const phoneGranted =
        results[PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE] === PermissionsAndroid.RESULTS.GRANTED;

      const notifGranted =
        apiLevel >= 33
          ? results['android.permission.POST_NOTIFICATIONS' as Permission] === PermissionsAndroid.RESULTS.GRANTED
          : true;

      const galleryGranted =
        apiLevel >= 33
          ? results['android.permission.READ_MEDIA_IMAGES' as Permission] === PermissionsAndroid.RESULTS.GRANTED
          : results[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED;

      await this.setOnboardingCompleted();

      return {
        camera: cameraGranted,
        gallery: galleryGranted,
        notifications: notifGranted,
        phone: phoneGranted,
      };
    } catch (err) {
      console.error('[PermissionService] Request failed:', err);
      await this.setOnboardingCompleted();
      return {
        camera: false,
        gallery: false,
        notifications: false,
        phone: false,
      };
    }
  },
};
