'use server';

import { adminDb } from '@/firebase/admin';
import { GoogleAuth } from 'google-auth-library';

const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'free-timemachine-ent-923-220cc';
const CLOUD_RUN_URL = 'https://generate-video-511511243134.us-central1.run.app';

// We use google-auth-library to get an access token for Vertex AI
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

export async function startVideoGeneration(visionId: string, imageBase64: string): Promise<{ success: boolean; operationId?: string; error?: string }> {
  try {
    // 1. Send the heavy payload directly to our Cloud Run service
    // Cloud run handles the 100-user limit, the Vertex AI auth, and the heavy request payload.
    const response = await fetch(CLOUD_RUN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Ensure we don't timeout the NextJS server waiting for the fetch
      // Cloud run responds quickly with just the operationId
      body: JSON.stringify({
        visionId,
        imageBase64
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Cloud Run Video Generation Error:', errText);
      return { success: false, error: 'Failed to start video generation via Cloud Run' };
    }

    const data = await response.json();
    
    if (!data.success) {
      return { success: false, error: data.error };
    }

    // Cloud Run will return the LRO operationId
    return { success: true, operationId: data.operationId };

  } catch (error: any) {
    console.error('Error contacting Cloud Run:', error);
    return { success: false, error: error.message };
  }
}

export async function checkVideoJobStatus(visionId: string, operationId: string): Promise<{ status: 'PENDING' | 'SUCCEEDED' | 'FAILED'; videoUrl?: string }> {
  try {
    const token = await auth.getAccessToken();
    
    // Ensure we construct the correct polling URL for Publisher Model LROs
    const endpoint = operationId.startsWith('projects/') 
      ? `https://${LOCATION}-aiplatform.googleapis.com/v1/${operationId}`
      : `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/operations/${operationId}`;

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Failed to check operation status. HTTP Status:', response.status, 'Response:', errText);
      return { status: 'FAILED' };
    }

    const data = await response.json();

    if (data.done) {
      if (data.error) {
        console.error('Vertex AI Video generation operation failed permanently:', JSON.stringify(data.error));
        return { status: 'FAILED' };
      }
      
      // Veo 3.1 outputs to a directory. The API response will contain the exact GCS URI of the generated file.
      // We need to safely extract it. It usually resides in data.response.
      let gcsOutputUri = '';
      
      if (data.response && data.response.generatedVideoUri) {
         gcsOutputUri = data.response.generatedVideoUri;
      } else if (data.response && data.response.outputUri) {
         gcsOutputUri = data.response.outputUri;
      } else {
         // Fallback if the specific field changes, we assume Veo names it output_0.mp4 or similar.
         // According to standard Veo API behavior, if output_uri was a directory, it puts it in output_0.mp4
         gcsOutputUri = `gs://free-timemachine-ent-923-220cc.firebasestorage.app/videos/${visionId}/output_0.mp4`;
         console.warn("Could not find exact output URI in Veo response. Using fallback:", gcsOutputUri, "Raw response:", JSON.stringify(data.response));
      }

      // Convert gs://bucket/path/to/file.mp4 -> https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Fto%2Ffile.mp4?alt=media
      const bucketName = 'free-timemachine-ent-923-220cc.firebasestorage.app';
      const pathInBucket = gcsOutputUri.replace(`gs://${bucketName}/`, '');
      const encodedPath = encodeURIComponent(pathInBucket);
      const videoUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;
      
      console.log(`Video Generation SUCCEEDED for ${visionId}. URL: ${videoUrl}`);

      // Update the vision document
      await adminDb.collection('visions').doc(visionId).update({
        videoUrl: videoUrl,
        hasVideo: true
      });

      return { status: 'SUCCEEDED', videoUrl };
    }

    // If not done, it is still pending
    return { status: 'PENDING' };

  } catch (error: any) {
    console.error('Error checking video status:', error.message || error);
    return { status: 'FAILED' };
  }
}
