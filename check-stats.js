const admin = require('firebase-admin');

// Ensure you have a service account key or are authenticated with gcloud
// For local testing, we might need a key, or rely on GOOGLE_APPLICATION_CREDENTIALS
try {
  admin.initializeApp({
    projectId: "free-timemachine-ent-923-220cc"
  });
  
  const db = admin.firestore();
  
  async function check() {
    const doc = await db.collection('metadata').doc('globalStats').get();
    if (!doc.exists) {
      console.log("metadata/globalStats does not exist.");
      // Create it
      await db.collection('metadata').doc('globalStats').set({ videoCount: 0 });
      console.log("Created metadata/globalStats with videoCount: 0");
    } else {
      console.log("Current globalStats:", doc.data());
    }
  }
  
  check().catch(console.error);
} catch (e) {
  console.error("Setup error", e);
}
