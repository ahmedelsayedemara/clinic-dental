import { getApp } from '@react-native-firebase/app';
import { getFirestore } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { getStorage } from '@react-native-firebase/storage';

/**
 * Firebase service — exposes initialized Firebase instances.
 * Firebase is initialized automatically from google-services.json (Android)
 * and GoogleService-Info.plist (iOS) by the native SDK.
 */
export const firebaseService = {
  /**
   * Returns the default Firebase app instance.
   */
  getApp: () => getApp(),

  /**
   * Returns the Firestore instance.
   */
  getDb: () => getFirestore(),

  /**
   * Returns the Auth instance.
   */
  getAuth: () => getAuth(),

  /**
   * Returns the Storage instance.
   */
  getStorage: () => getStorage(),
};
