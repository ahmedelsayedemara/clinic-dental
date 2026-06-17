import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { getMessaging, onMessage, getToken } from '@react-native-firebase/messaging';
import { StorageUtil } from '@/utility/storage';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { useAuthStore } from '@/store/useAuthStore';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { FIRESTORE_COLLECTIONS } from '@/constants/firestoreCollections';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { ClinicUser } from '@/api/services/authService/authInterface';

interface FirebaseProviderProps {
  children: React.ReactNode;
}

export default function FirebaseProvider({ children }: FirebaseProviderProps) {
  const { setUser, setAuthenticated, setLoading } = useAuthStore();

  useEffect(() => {
    // Add/edit forms build payloads with `field || undefined` to omit empty optional
    // fields. Firestore rejects `undefined` values by default ("Unsupported field value:
    // undefined" thrown from buildNativeMap), so enable ignoreUndefinedProperties to drop
    // them instead. Set once at bootstrap, before any write can occur.
    getFirestore()
      .settings({ ignoreUndefinedProperties: true })
      .catch(() => {});

    // Listen to Firebase Auth state changes
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        try {
          // Fetch user profile from Firestore
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, FIRESTORE_COLLECTIONS.USERS, firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as ClinicUser;
            setUser(userData);
          } else {
            // User exists in Auth but not in Firestore yet
            const basicUser: ClinicUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? '',
              displayName: firebaseUser.displayName ?? '',
            };
            setUser(basicUser);
          }
        } catch (error) {
          console.warn('Failed to fetch user profile from Firestore:', error);
          setAuthenticated(true);
          setLoading(false);
        }
      } else {
        setAuthenticated(false);
        setLoading(false);
      }
    });

    // FCM token registration
    const initFCM = async () => {
      try {
        const messaging = getMessaging();
        const fcmToken = await getToken(messaging);
        if (fcmToken) {
          StorageUtil.setString(STORAGE_KEYS.FCM_TOKEN, fcmToken);
        }
        // Foreground message handler
        const unsubscribeFCM = onMessage(messaging, _message => {
          // Handle foreground messages here if needed
        });
        return unsubscribeFCM;
      } catch (error) {
        console.warn('FCM init failed:', error);
        return undefined;
      }
    };

    let unsubscribeFCM: (() => void) | undefined;
    initFCM().then(unsub => {
      unsubscribeFCM = unsub;
    });

    return () => {
      unsubscribeAuth();
      unsubscribeFCM?.();
    };
  }, [setUser, setAuthenticated, setLoading]);

  return <>{children}</>;
}
