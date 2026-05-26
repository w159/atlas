import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resolveRegion, clearCachedRegion } from '../src/region.js';
import { AuvikAuthError, AuvikError } from '../src/errors.js';

describe('resolveRegion', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    clearCachedRegion();
    delete process.env.AUVIK_REGION;
  });

  it('should return cached region if available', async () => {
    // First call should cache the region
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    const region1 = await resolveRegion('user@test.com', 'key', mockFetch);
    expect(region1).toBe('us1');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Second call should use cache
    const region2 = await resolveRegion('user@test.com', 'key', mockFetch);
    expect(region2).toBe('us1');
    expect(mockFetch).toHaveBeenCalledTimes(1); // No additional calls
  });

  it('should use environment variable override', async () => {
    process.env.AUVIK_REGION = 'eu1';

    const region = await resolveRegion('user@test.com', 'key', mockFetch);
    expect(region).toBe('eu1');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should probe regions sequentially and return first successful', async () => {
    // First region fails
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      })
      // Second region succeeds
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

    const region = await resolveRegion('user@test.com', 'key', mockFetch);
    expect(region).toBe('us2');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should throw AuvikAuthError when all regions return 401', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
    });

    await expect(
      resolveRegion('user@test.com', 'invalid-key', mockFetch)
    ).rejects.toThrow(AuvikAuthError);
  });

  it('should throw AuvikError when all regions fail with non-401 errors', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(
      resolveRegion('user@test.com', 'key', mockFetch)
    ).rejects.toThrow(AuvikError);
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    await expect(
      resolveRegion('user@test.com', 'key', mockFetch)
    ).rejects.toThrow(AuvikError);
  });
});