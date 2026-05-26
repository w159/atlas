import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuvikClient } from '../src/client.js';
import { AuvikAuthError } from '../src/errors.js';

describe('AuvikClient', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.clearAllMocks();
  });

  it('should create a client with required config', () => {
    const client = new AuvikClient({
      username: 'test@example.com',
      apiKey: 'test-key',
      fetchImpl: mockFetch,
    });

    expect(client).toBeDefined();
    expect(client.tenants).toBeDefined();
    expect(client.inventoryDevice).toBeDefined();
    expect(client.alerts).toBeDefined();
  });

  it('should use provided region without probing', async () => {
    const client = new AuvikClient({
      username: 'test@example.com',
      apiKey: 'test-key',
      region: 'us1',
      fetchImpl: mockFetch,
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
      headers: new Headers(),
    });

    await client.credentials.verify();

    expect(mockFetch).toHaveBeenCalledWith(
      'https://auvikapi.us1.my.auvik.com/v1/authentication/verify',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('Basic'),
        }),
      })
    );
  });

  it('should use custom base URL when provided', async () => {
    const client = new AuvikClient({
      username: 'test@example.com',
      apiKey: 'test-key',
      baseUrl: 'https://custom.api.example.com/v1',
      fetchImpl: mockFetch,
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
      headers: new Headers(),
    });

    await client.credentials.verify();

    expect(mockFetch).toHaveBeenCalledWith(
      'https://custom.api.example.com/v1/authentication/verify',
      expect.any(Object)
    );
  });
});