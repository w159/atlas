/**
 * Rate limiting logic for the NinjaOne API
 *
 * NinjaOne enforces rate limits that vary by endpoint.
 * This implementation uses conservative defaults to avoid hitting limits.
 */

import type { RateLimitConfig } from './config.js';

/**
 * Manages rate limiting for API requests
 */
export class RateLimiter {
  private readonly config: RateLimitConfig;
  private requestTimestamps: number[] = [];

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Wait until it's safe to make a request
   */
  async waitForSlot(): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    // Clean up old timestamps
    this.pruneOldTimestamps();

    // Calculate current rate
    const currentRate = this.requestTimestamps.length / this.config.maxRequests;

    // If we're above the throttle threshold, add a delay
    if (currentRate >= this.config.throttleThreshold) {
      // Calculate delay based on how close we are to the limit
      const delayMs = Math.min(
        1000 * (currentRate - this.config.throttleThreshold + 0.1) * 10,
        5000
      );
      await this.sleep(delayMs);
    }

    // If we're at the limit, wait until the oldest request falls out of the window
    if (this.requestTimestamps.length >= this.config.maxRequests) {
      const oldestTimestamp = this.requestTimestamps[0];
      if (oldestTimestamp !== undefined) {
        const waitUntil = oldestTimestamp + this.config.windowMs;
        const waitTime = waitUntil - Date.now();
        if (waitTime > 0) {
          await this.sleep(waitTime);
        }
      }
    }
  }

  /**
   * Record that a request was made
   */
  recordRequest(): void {
    if (!this.config.enabled) {
      return;
    }
    this.requestTimestamps.push(Date.now());
  }

  /**
   * Handle a rate limit error (429)
   */
  handleRateLimitError(_retryCount: number): void {
    // The rate limiter itself doesn't need to do much here,
    // but we track that we're getting rate limited
  }

  /**
   * Get the current request rate as a fraction of the limit
   */
  getCurrentRate(): number {
    this.pruneOldTimestamps();
    return this.requestTimestamps.length / this.config.maxRequests;
  }

  /**
   * Get the number of requests remaining in the current window
   */
  getRemainingRequests(): number {
    this.pruneOldTimestamps();
    return Math.max(0, this.config.maxRequests - this.requestTimestamps.length);
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  calculateRetryDelay(retryCount: number): number {
    return Math.min(
      this.config.retryAfterMs * Math.pow(2, retryCount),
      30000 // Max 30 seconds
    );
  }

  /**
   * Check if we should retry after a rate limit error
   */
  shouldRetry(retryCount: number): boolean {
    return retryCount < this.config.maxRetries;
  }

  /**
   * Parse Retry-After header value
   * Returns delay in milliseconds
   */
  parseRetryAfter(retryAfterHeader: string | null): number {
    if (!retryAfterHeader) {
      return this.config.retryAfterMs;
    }

    // Try to parse as seconds
    const seconds = parseInt(retryAfterHeader, 10);
    if (!isNaN(seconds)) {
      return seconds * 1000;
    }

    // Try to parse as HTTP date
    try {
      const date = new Date(retryAfterHeader);
      const delay = date.getTime() - Date.now();
      if (delay > 0) {
        return delay;
      }
    } catch {
      // Ignore parsing errors
    }

    return this.config.retryAfterMs;
  }

  /**
   * Remove timestamps older than the window
   */
  private pruneOldTimestamps(): void {
    const cutoff = Date.now() - this.config.windowMs;
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > cutoff);
  }

  /**
   * Sleep for a given duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
