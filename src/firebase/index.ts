'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigValid } from './config';

/**
 * Initializes Firebase services safely.
 */
export function initializeFirebase(): {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
} {
  try {
    if (!isFirebaseConfigValid()) {
      return { firebaseApp: null, firestore: null, auth: null };
    }

    const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    
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
export * from './errors';
export * from './error-emitter';
