/**
 * Auth tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthManager } from '../../src/auth.js';
import { NinjaOneAuthenticationError } from '../../src/errors.js';
import type { ResolvedConfig } from '../../src/config.js';

describe('AuthManager', () => {
  const createConfig = (): ResolvedConfig => ({
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    baseUrl: 'https://app.ninjarmm.com',
    scopes: ['monitoring', 'management'],
    rateLimit: {
      enabled: true,
      maxRequests: 100,
      windowMs: 60000,
      throttleThreshold: 0.8,
      retryAfterMs: 5000,
      maxRetries: 3,
    },
  });

  describe('getToken', () => {
    it('should acquire a new token when none exists', async () => {
      const auth = new AuthManager(createConfig());

      const token = await auth.getToken();

      expect(token).toBe('test-access-token-12345');
    });

    it('should return cached token if still valid', async () => {
      const auth = new AuthManager(createConfig());

      const token1 = await auth.getToken();
      const token2 = await auth.getToken();

      expect(token1).toBe(token2);
    });

    it('should throw on bad credentials', async () => {
      const config = createConfig();
      config.clientId = 'bad-client-id';
      const auth = new AuthManager(config);

      await expect(auth.getToken()).rejects.toThrow(NinjaOneAuthenticationError);
    });
  });

  describe('refreshToken', () => {
    it('should force acquire a new token', async () => {
      const auth = new AuthManager(createConfig());

      await auth.getToken();
      const newToken = await auth.refreshToken();

      expect(newToken).toBe('test-access-token-12345');
    });
  });

  describe('invalidateToken', () => {
    it('should clear the current token', async () => {
      const auth = new AuthManager(createConfig());

      await auth.getToken();
      expect(auth.hasValidToken()).toBe(true);

      auth.invalidateToken();
      expect(auth.hasValidToken()).toBe(false);
    });
  });

  describe('hasValidToken', () => {
    it('should return false when no token exists', () => {
      const auth = new AuthManager(createConfig());

      expect(auth.hasValidToken()).toBe(false);
    });

    it('should return true after acquiring token', async () => {
      const auth = new AuthManager(createConfig());

      await auth.getToken();

      expect(auth.hasValidToken()).toBe(true);
    });
  });

  describe('token expiry handling', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should refresh token when near expiry', async () => {
      const auth = new AuthManager(createConfig());

      await auth.getToken();
      expect(auth.hasValidToken()).toBe(true);

      // Advance time to near expiry (3600 seconds - 2 minutes buffer)
      vi.advanceTimersByTime(3500 * 1000);

      // Token should be considered expired (within 2 minute buffer)
      expect(auth.hasValidToken()).toBe(false);
    });
  });
});
