/**
 * Rate limiter tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RateLimiter } from '../../src/rate-limiter.js';
import type { RateLimitConfig } from '../../src/config.js';

describe('RateLimiter', () => {
  const createConfig = (overrides?: Partial<RateLimitConfig>): RateLimitConfig => ({
    enabled: true,
    maxRequests: 100,
    windowMs: 60000,
    throttleThreshold: 0.8,
    retryAfterMs: 5000,
    maxRetries: 3,
    ...overrides,
  });

  describe('recordRequest', () => {
    it('should track requests', () => {
      const limiter = new RateLimiter(createConfig());

      expect(limiter.getRemainingRequests()).toBe(100);

      limiter.recordRequest();
      expect(limiter.getRemainingRequests()).toBe(99);

      limiter.recordRequest();
      expect(limiter.getRemainingRequests()).toBe(98);
    });

    it('should not track when disabled', () => {
      const limiter = new RateLimiter(createConfig({ enabled: false }));

      limiter.recordRequest();
      limiter.recordRequest();

      expect(limiter.getRemainingRequests()).toBe(100);
    });
  });

  describe('getCurrentRate', () => {
    it('should return 0 when no requests made', () => {
      const limiter = new RateLimiter(createConfig());

      expect(limiter.getCurrentRate()).toBe(0);
    });

    it('should calculate rate correctly', () => {
      const limiter = new RateLimiter(createConfig({ maxRequests: 100 }));

      for (let i = 0; i < 50; i++) {
        limiter.recordRequest();
      }

      expect(limiter.getCurrentRate()).toBe(0.5);
    });
  });

  describe('getRemainingRequests', () => {
    it('should return max requests when empty', () => {
      const limiter = new RateLimiter(createConfig({ maxRequests: 100 }));

      expect(limiter.getRemainingRequests()).toBe(100);
    });

    it('should return 0 when at limit', () => {
      const limiter = new RateLimiter(createConfig({ maxRequests: 10 }));

      for (let i = 0; i < 10; i++) {
        limiter.recordRequest();
      }

      expect(limiter.getRemainingRequests()).toBe(0);
    });
  });

  describe('shouldRetry', () => {
    it('should return true when under retry limit', () => {
      const limiter = new RateLimiter(createConfig({ maxRetries: 3 }));

      expect(limiter.shouldRetry(0)).toBe(true);
      expect(limiter.shouldRetry(1)).toBe(true);
      expect(limiter.shouldRetry(2)).toBe(true);
    });

    it('should return false when at or over retry limit', () => {
      const limiter = new RateLimiter(createConfig({ maxRetries: 3 }));

      expect(limiter.shouldRetry(3)).toBe(false);
      expect(limiter.shouldRetry(4)).toBe(false);
    });
  });

  describe('calculateRetryDelay', () => {
    it('should use exponential backoff', () => {
      const limiter = new RateLimiter(createConfig({ retryAfterMs: 1000 }));

      expect(limiter.calculateRetryDelay(0)).toBe(1000);
      expect(limiter.calculateRetryDelay(1)).toBe(2000);
      expect(limiter.calculateRetryDelay(2)).toBe(4000);
    });

    it('should cap at 30 seconds', () => {
      const limiter = new RateLimiter(createConfig({ retryAfterMs: 10000 }));

      expect(limiter.calculateRetryDelay(5)).toBe(30000);
    });
  });

  describe('parseRetryAfter', () => {
    it('should return default when header is null', () => {
      const limiter = new RateLimiter(createConfig({ retryAfterMs: 5000 }));

      expect(limiter.parseRetryAfter(null)).toBe(5000);
    });

    it('should parse seconds', () => {
      const limiter = new RateLimiter(createConfig());

      expect(limiter.parseRetryAfter('60')).toBe(60000);
    });

    it('should return default for invalid values', () => {
      const limiter = new RateLimiter(createConfig({ retryAfterMs: 5000 }));

      expect(limiter.parseRetryAfter('invalid')).toBe(5000);
    });
  });

  describe('timestamp pruning', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should prune old timestamps', () => {
      const limiter = new RateLimiter(createConfig({ maxRequests: 100, windowMs: 60000 }));

      // Make some requests
      for (let i = 0; i < 10; i++) {
        limiter.recordRequest();
      }
      expect(limiter.getRemainingRequests()).toBe(90);

      // Advance time past the window
      vi.advanceTimersByTime(61000);

      // Old requests should be pruned
      expect(limiter.getRemainingRequests()).toBe(100);
    });
  });

  describe('waitForSlot', () => {
    it('should resolve immediately when disabled', async () => {
      const limiter = new RateLimiter(createConfig({ enabled: false }));

      const start = Date.now();
      await limiter.waitForSlot();
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(100);
    });

    it('should resolve immediately when under threshold', async () => {
      const limiter = new RateLimiter(createConfig());

      const start = Date.now();
      await limiter.waitForSlot();
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(100);
    });
  });
});
