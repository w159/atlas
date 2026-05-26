import { describe, it, expect } from 'vitest';
import {
  resolveConfig,
  PLATFORM_BASE_URLS,
  DEFAULT_PLATFORM,
  DEFAULT_RATE_LIMIT_CONFIG,
} from '../../src/config.js';

describe('resolveConfig', () => {
  it('throws when adminEmail is missing', () => {
    // @ts-expect-error testing invalid input
    expect(() => resolveConfig({ apiToken: 't' })).toThrow(/adminEmail/);
  });

  it('throws when apiToken is missing', () => {
    // @ts-expect-error testing invalid input
    expect(() => resolveConfig({ adminEmail: 'a@b.com' })).toThrow(/apiToken/);
  });

  it('defaults platform to "m365"', () => {
    const cfg = resolveConfig({ adminEmail: 'a@b.com', apiToken: 't' });
    expect(cfg.platform).toBe(DEFAULT_PLATFORM);
    expect(cfg.platform).toBe('m365');
    expect(cfg.apiUrl).toBe(PLATFORM_BASE_URLS.m365);
  });

  it('resolves the GWS base URL when platform: "gws"', () => {
    const cfg = resolveConfig({ adminEmail: 'a@b.com', apiToken: 't', platform: 'gws' });
    expect(cfg.apiUrl).toBe(PLATFORM_BASE_URLS.gws);
  });

  it('resolves the Salesforce base URL when platform: "salesforce"', () => {
    const cfg = resolveConfig({
      adminEmail: 'a@b.com',
      apiToken: 't',
      platform: 'salesforce',
    });
    expect(cfg.apiUrl).toBe(PLATFORM_BASE_URLS.salesforce);
  });

  it('rejects unsupported platforms', () => {
    expect(() =>
      // @ts-expect-error invalid platform literal
      resolveConfig({ adminEmail: 'a@b.com', apiToken: 't', platform: 'aws' })
    ).toThrow(/platform/);
  });

  it('apiUrl override takes precedence over platform', () => {
    const cfg = resolveConfig({
      adminEmail: 'a@b.com',
      apiToken: 't',
      platform: 'm365',
      apiUrl: 'https://staging.example.com/external/',
    });
    expect(cfg.apiUrl).toBe('https://staging.example.com/external');
  });

  it('merges rateLimit overrides on top of defaults', () => {
    const cfg = resolveConfig({
      adminEmail: 'a@b.com',
      apiToken: 't',
      rateLimit: { maxRequests: 30 },
    });
    expect(cfg.rateLimit.maxRequests).toBe(30);
    expect(cfg.rateLimit.maxConcurrency).toBe(DEFAULT_RATE_LIMIT_CONFIG.maxConcurrency);
  });
});
