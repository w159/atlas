import { describe, it, expect } from 'vitest';
import {
  clampLimit,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from '../../src/pagination.js';
import { buildUrl } from '../../src/http.js';

describe('clampLimit', () => {
  it('returns default when undefined', () => {
    expect(clampLimit(undefined)).toBe(DEFAULT_PAGE_LIMIT);
  });

  it('floors values below 1 to 1', () => {
    expect(clampLimit(0)).toBe(1);
    expect(clampLimit(-50)).toBe(1);
  });

  it('caps values above MAX_PAGE_LIMIT (200)', () => {
    expect(MAX_PAGE_LIMIT).toBe(200);
    expect(clampLimit(10_000)).toBe(MAX_PAGE_LIMIT);
  });

  it('passes valid values through (floored)', () => {
    expect(clampLimit(100)).toBe(100);
    expect(clampLimit(50.7)).toBe(50);
  });
});

describe('buildUrl', () => {
  it('returns base+path when no params', () => {
    expect(buildUrl('https://x', '/users')).toBe('https://x/users');
  });

  it('omits undefined params', () => {
    expect(buildUrl('https://x', '/users', { a: 1, b: undefined })).toBe(
      'https://x/users?a=1'
    );
  });

  it('returns base+path when all params are undefined', () => {
    expect(buildUrl('https://x', '/users', { a: undefined })).toBe('https://x/users');
  });

  it('serializes booleans as "true"/"false"', () => {
    expect(buildUrl('https://x', '/users', { archived: true })).toBe(
      'https://x/users?archived=true'
    );
  });
});
