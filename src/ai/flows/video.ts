'use server';

const CLOUD_RUN_URL = 'https://generate-video-511511243134.us-central1.run.app';

export async function startVideoGeneration(visionId: string, imageBase64: string): Promise<{ success: boolean; operationId?: string; error?: string }> {
  try {
    const response = await fetch(CLOUD_RUN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generate',
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

    return { success: true, operationId: data.operationId };

  } catch (error: any) {
    console.error('Error contacting Cloud Run:', error);
    return { success: false, error: error.message };
  }
}

export async function checkVideoJobStatus(visionId: string, operationId: string): Promise<{ status: 'PENDING' | 'SUCCEEDED' | 'FAILED'; videoUrl?: string; error?: string }> {
  try {
    const response = await fetch(CLOUD_RUN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'checkStatus',
        visionId,
        operationId
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Cloud Run Polling Error:', errText);
      return { status: 'FAILED', error: `HTTP ${response.status}: ${errText}` };
    }

    const data = await response.json();
    return data;

  } catch (error: any) {
    console.error('Error checking video status:', error.message || error);
    return { status: 'FAILED', error: error.message || String(error) };
  }
}
