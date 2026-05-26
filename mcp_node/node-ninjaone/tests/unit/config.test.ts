/**
 * Config tests
 */

import { describe, it, expect } from 'vitest';
import { resolveConfig, REGION_URLS, DEFAULT_RATE_LIMIT_CONFIG } from '../../src/config.js';

describe('resolveConfig', () => {
  const baseConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
  };

  describe('region handling', () => {
    it('should use US region by default', () => {
      const config = resolveConfig(baseConfig);

      expect(config.baseUrl).toBe(REGION_URLS.us);
    });

    it('should use EU region when specified', () => {
      const config = resolveConfig({ ...baseConfig, region: 'eu' });

      expect(config.baseUrl).toBe(REGION_URLS.eu);
    });

    it('should use Oceania region when specified', () => {
      const config = resolveConfig({ ...baseConfig, region: 'oc' });

      expect(config.baseUrl).toBe(REGION_URLS.oc);
    });

    it('should use explicit baseUrl over region', () => {
      const customUrl = 'https://custom.ninjarmm.example.com';
      const config = resolveConfig({ ...baseConfig, baseUrl: customUrl, region: 'eu' });

      expect(config.baseUrl).toBe(customUrl);
    });

    it('should remove trailing slash from baseUrl', () => {
      const config = resolveConfig({ ...baseConfig, baseUrl: 'https://custom.example.com/' });

      expect(config.baseUrl).toBe('https://custom.example.com');
    });
  });

  describe('scopes', () => {
    it('should use default scopes when not specified', () => {
      const config = resolveConfig(baseConfig);

      expect(config.scopes).toEqual(['monitoring', 'management']);
    });

    it('should use specified scopes', () => {
      const config = resolveConfig({ ...baseConfig, scopes: ['monitoring', 'control'] });

      expect(config.scopes).toEqual(['monitoring', 'control']);
    });
  });

  describe('rate limit config', () => {
    it('should use default rate limit config', () => {
      const config = resolveConfig(baseConfig);

      expect(config.rateLimit).toEqual(DEFAULT_RATE_LIMIT_CONFIG);
    });

    it('should merge custom rate limit config with defaults', () => {
      const config = resolveConfig({
        ...baseConfig,
        rateLimit: { maxRequests: 50 },
      });

      expect(config.rateLimit.maxRequests).toBe(50);
      expect(config.rateLimit.windowMs).toBe(DEFAULT_RATE_LIMIT_CONFIG.windowMs);
    });
  });

  describe('credentials', () => {
    it('should preserve client credentials', () => {
      const config = resolveConfig(baseConfig);

      expect(config.clientId).toBe('test-client-id');
      expect(config.clientSecret).toBe('test-client-secret');
    });
  });
});
