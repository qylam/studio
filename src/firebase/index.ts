'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigValid } from './config';

/**
 * Initializes Firebase services safely.
 * Returns null for services if configuration is invalid or initialization fails.
 */
export function initializeFirebase(): {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
} {
  try {
    if (!isFirebaseConfigValid()) {
      console.warn('Firebase configuration is missing or invalid. Check your environment variables.');
      return { firebaseApp: null, firestore: null, auth: null };
    }

    const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    
    // Initialize services individually to handle partial failures
    let firestore: Firestore | null = null;
    let auth: Auth | null = null;

    try {
      firestore = getFirestore(firebaseApp);
    } catch (e) {
      console.error('Failed to initialize Firestore:', e);
    }

    try {
      auth = getAuth(firebaseApp);
    } catch (e) {
      console.error('Failed to initialize Auth:', e);
    }

    return { firebaseApp, firestore, auth };
  } catch (error) {
    console.error('Critical error during Firebase initialization:', error);
    return { firebaseApp: null, firestore: null, auth: null };
  }
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
