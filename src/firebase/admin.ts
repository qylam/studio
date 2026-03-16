import * as admin from 'firebase-admin';

// Protect against multiple initializations in development
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: "free-timemachine-ent-923-220cc",
      storageBucket: "free-timemachine-ent-923-220cc.firebasestorage.app"
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
