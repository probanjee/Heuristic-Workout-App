/**
 * HeuristicAI — Network Sync Utilities
 * Implements request timeouts and retry logic with exponential backoff for cloud operations.
 * Source of truth: TASK.md § 8, TRD.md § 8
 */

/**
 * Rejects a promise if it exceeds the specified timeout period.
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 15000): Promise<T> {
  let timeoutId: any;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`[NetworkTimeout] Request exceeded ${timeoutMs}ms limit`));
    }, timeoutMs);
    if (timeoutId && typeof timeoutId.unref === 'function') {
      timeoutId.unref();
    }
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
}

/**
 * Executes a promise creator with automatic retries and exponential backoff.
 */
export async function withRetryAndTimeout<T>(
  promiseCreator: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 2000,
  timeoutMs: number = 15000
): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      attempt++;
      // Execute the request inside the timeout wrapper
      return await withTimeout(promiseCreator(), timeoutMs);
    } catch (err: any) {
      const isLastAttempt = attempt >= maxRetries;
      const isTimeout = err.message?.includes('[NetworkTimeout]');
      
      console.warn(
        `[NetworkRetry] Attempt ${attempt} failed (Type: ${
          isTimeout ? 'Timeout' : 'NetworkError'
        }): ${err.message}`
      );

      const isUnauthorized = err.status === 401 || err.statusCode === 401 || err.message?.includes('401') || err.message?.includes('JWT') || err.message?.includes('unauthorized');
      if (isUnauthorized) {
        try {
          console.warn('[NetworkRetry] Detected 401 Unauthorized. Attempting Firebase token refresh...');
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { forceTokenRefresh } = require('../auth/session-manager');
          await forceTokenRefresh();
        } catch (refreshErr) {
          console.error('[NetworkRetry] Failed to refresh token on 401:', refreshErr);
        }
      }

      if (isLastAttempt) {
        throw err;
      }

      // Exponential backoff delay calculation: baseDelayMs * 2^(attempt - 1)
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise((resolve) => {
        const t: any = setTimeout(resolve, delay);
        if (t && typeof t.unref === 'function') {
          t.unref();
        }
      });
    }
  }
}
