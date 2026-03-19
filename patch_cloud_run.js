const fs = require('fs');
const file = 'src/cloud-run-video/index.js';
let content = fs.readFileSync(file, 'utf8');

const newContent = `const functions = require('@google-cloud/functions-framework');
const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');
const admin = require('firebase-admin');

const PROJECT_ID = 'free-timemachine-ent-923-220cc'; 
const LOCATION = 'us-central1';
const MODEL_ID = 'veo-3.1-generate-001'; 
const BUCKET_NAME = 'free-timemachine-ent-923-220cc.firebasestorage.app';

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});
const db = admin.firestore();

functions.http('generate-video', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).send('');
  }

  const { action, visionId, imageBase64, operationId } = req.body;

  try {
    const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
    const accessToken = await auth.getAccessToken();

    // 1. STATUS CHECK ACTION
    if (action === 'checkStatus') {
      if (!visionId || !operationId) return res.status(400).send({error: 'Missing visionId or operationId'});

      const endpoint = operationId.startsWith('projects/')
        ? \`https://\${LOCATION}-aiplatform.googleapis.com/v1/\${operationId}\`
        : \`https://\${LOCATION}-aiplatform.googleapis.com/v1/projects/\${PROJECT_ID}/locations/\${LOCATION}/operations/\${operationId}\`;

      const apiResponse = await axios.get(endpoint, {
        headers: { 'Authorization': \`Bearer \${accessToken}\` }
      });

      const data = apiResponse.data;

      if (data.done) {
        if (data.error) {
          console.error('Vertex AI LRO Failed:', data.error);
          return res.status(200).send({ status: 'FAILED', error: \`Vertex AI Error: \${JSON.stringify(data.error)}\` });
        }

        let gcsOutputUri = '';
        if (data.response && data.response.generatedVideoUri) gcsOutputUri = data.response.generatedVideoUri;
        else if (data.response && data.response.outputUri) gcsOutputUri = data.response.outputUri;
        else gcsOutputUri = \`gs://\${BUCKET_NAME}/videos/\${visionId}/output_0.mp4\`;

        const pathInBucket = gcsOutputUri.replace(\`gs://\${BUCKET_NAME}/\`, '');
        const encodedPath = encodeURIComponent(pathInBucket);
        const videoUrl = \`https://firebasestorage.googleapis.com/v0/b/\${BUCKET_NAME}/o/\${encodedPath}?alt=media\`;

        // Update Firestore
        await db.collection('visions').doc(visionId).update({
          videoUrl: videoUrl,
          hasVideo: true
        });

        return res.status(200).send({ status: 'SUCCEEDED', videoUrl });
      }

      return res.status(200).send({ status: 'PENDING' });
    }

    // 2. GENERATE VIDEO ACTION (Default)
    if (!visionId || !imageBase64) return res.status(400).send({ error: 'Missing visionId or imageBase64' });

    console.log(\`Processing video for vision: \${visionId}\`);

    const statsRef = db.collection('metadata').doc('globalStats');
    const limitResult = await db.runTransaction(async (transaction) => {
      const statsDoc = await transaction.get(statsRef);
      if (!statsDoc.exists) transaction.set(statsRef, { videoCount: 0 });
      const currentCount = statsDoc.exists ? statsDoc.data().videoCount : 0;
      if (currentCount >= 100) return { allowed: false };
      transaction.update(statsRef, { videoCount: admin.firestore.FieldValue.increment(1) });
      return { allowed: true };
    });

    if (!limitResult.allowed) return res.status(403).send({ success: false, error: 'Limit reached' });

    const outputStorageUri = \`gs://\${BUCKET_NAME}/videos/\${visionId}/\`;
    const apiUrl = \`https://\${LOCATION}-aiplatform.googleapis.com/v1/projects/\${PROJECT_ID}/locations/\${LOCATION}/publishers/google/models/\${MODEL_ID}:predictLongRunning\`;
    const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    const requestPayload = {
      instances: [{
        prompt: "Cinematic tracking shot. A wet city street at night, illuminated by neon signs and volumetric streetlights. The character from the reference image jogging on the street. The camera pushes in for a medium close-up. They look directly into the lens, smiling charismatically, and speak the words 'Gemini makes my day' with high energy. 35mm film stock, anamorphic lens flares, shallow depth of field, high contrast, IMAX quality, teal and orange color grading.",
        image: { bytesBase64Encoded: cleanBase64, mimeType: 'image/jpeg' }
      }],
      parameters: {
        storageUri: outputStorageUri,
        durationSeconds: 8,
        generateAudio: true,
        resolution: "720p",
        sampleCount: 1,
        personGeneration: 'allow_all',
        includeRaiReason: true
      }
    };

    const apiResponse = await axios.post(apiUrl, requestPayload, {
      headers: { 'Authorization': \`Bearer \${accessToken}\`, 'Content-Type': 'application/json' }
    });

    return res.status(200).send({ success: true, operationId: apiResponse.data.name });

  } catch (error) {
    const errorMessage = error.response && error.response.data ? JSON.stringify(error.response.data) : error.message;
    console.error('An unexpected error occurred:', errorMessage);
    if (action !== 'checkStatus') {
      await db.collection('metadata').doc('globalStats').update({
        videoCount: admin.firestore.FieldValue.increment(-1)
      });
    }
    return res.status(500).send({ success: false, error: errorMessage, status: 'FAILED' });
  }
});
`;

fs.writeFileSync(file, newContent);
console.log('Cloud run updated');
