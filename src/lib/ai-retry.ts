import pRetry, { AbortError } from 'p-retry';

/**
 * A wrapper to execute AI operations with exponential backoff.
 * 
 * It specifically catches 429 (Rate Limit) and 5xx (Server Error) status codes
 * to trigger a retry.
 * 
 * It will instantly abort (no retries) if it detects a 400 error or a safety violation.
 * 
 * @param operation The asynchronous function to execute (e.g., a Genkit prompt call).
 * @returns The result of the operation.
 */
export async function withAiRetry<T>(operation: () => Promise<T>): Promise<T> {
  return pRetry(
    async () => {
      try {
        return await operation();
      } catch (error: any) {
        const errorDetails = JSON.stringify(error, Object.getOwnPropertyNames(error));
        
        // 1. FATAL ERRORS: Do not retry safety blocks or bad requests.
        if (
          error?.status === 400 || 
          error?.message?.toLowerCase().includes("safety") || 
          errorDetails.toLowerCase().includes("safety") ||
          errorDetails.includes("HARM_CATEGORY")
        ) {
          console.error("🚫 AI_RETRY_ABORTED: Fatal error or safety block detected. Will not retry.");
          throw new AbortError(error);
        }

        // 2. RETRYABLE ERRORS: Only retry on 429 or 5xx errors.
        if (
          error?.status === 429 || 
          error?.message?.includes("429") || 
          error?.status >= 500
        ) {
          console.warn(`⏳ AI_RETRY_TRIGGERED: Caught transient error (${error?.status || 'Unknown'}). Preparing to retry...`);
          throw error; // Throwing a standard error tells p-retry to try again
        }

        // 3. UNKNOWN ERRORS: If it's not explicitly a rate limit or server error, abort.
        console.error("🚫 AI_RETRY_ABORTED: Unknown error type. Will not retry.");
        throw new AbortError(error);
      }
    },
    {
      retries: 3, // Attempt 4 times total (1 initial + 3 retries)
      factor: 2, // Exponential backoff factor (wait 2s, then 4s, then 8s)
      minTimeout: 2000, // Start by waiting 2 seconds
      maxTimeout: 10000, // Never wait longer than 10 seconds
      onFailedAttempt: error => {
        console.warn(`[AI Retry System] Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`);
      }
    }
  );
}
