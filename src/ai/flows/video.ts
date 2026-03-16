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
    // Check status logic for Vertex AI Long Running Operations (LRO)
    const token = await auth.getAccessToken();
    
    // Ensure operationId is properly formatted for LROs (usually projects/x/locations/y/operations/z)
    let endpoint = operationId.includes('/') 
      ? `https://${LOCATION}-aiplatform.googleapis.com/v1/${operationId}`
      : `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/operations/${operationId}`;

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      console.error('Failed to check operation status:', await response.text());
      return { status: 'FAILED' };
    }

    const data = await response.json();

    if (data.done) {
      if (data.error) {
        console.error('Video generation operation failed:', data.error);
        return { status: 'FAILED' };
      }
      
      const videoUrl = `https://firebasestorage.googleapis.com/v0/b/free-timemachine-ent-923-220cc.firebasestorage.app/o/videos%2F${visionId}.mp4?alt=media`;
      
      // Update the vision document
      await adminDb.collection('visions').doc(visionId).update({
        videoUrl: videoUrl,
        hasVideo: true
      });

      return { status: 'SUCCEEDED', videoUrl };
    }

    return { status: 'PENDING' };

  } catch (error) {
    console.error('Error checking video status:', error);
    return { status: 'FAILED' };
  }
}