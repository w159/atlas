import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HttpClient } from '../src/http.js';
import { AuvikRateLimitError, AuvikAuthError, AuvikServerError } from '../src/errors.js';

describe('HttpClient', () => {
  let httpClient: HttpClient;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    httpClient = new HttpClient({
      baseUrl: 'https://api.example.com/v1',
      username: 'test@example.com',
      apiKey: 'test-key',
      timeout: 5000,
      maxRetries: 2,
      fetchImpl: mockFetch,
    });
    vi.clearAllMocks();
  });

  it('should make successful GET request', async () => {
    const mockResponse = { data: { id: '1', name: 'test' } };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
      headers: new Headers({ 'content-type': 'application/json' }),
    });

    const result = await httpClient.request('/test');

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/v1/test',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Basic dGVzdEBleGFtcGxlLmNvbTp0ZXN0LWtleQ==',
          Accept: 'application/json',
        }),
      })
    );
  });

  it('should handle query parameters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
      headers: new Headers(),
    });

    await httpClient.request('/test', {
      params: {
        foo: 'bar',
        page: 1,
        filters: ['a', 'b'],
      },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/v1/test?foo=bar&page=1&filters%5B%5D=a&filters%5B%5D=b',
      expect.any(Object)
    );
  });

  it('should handle rate limiting with exponential backoff', async () => {
    const rateLimitResponse = {
      ok: false,
      status: 403,
      text: async () => 'rate limit exceeded',
      headers: new Headers(),
    };

    const successResponse = {
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
      headers: new Headers({ 'content-type': 'application/json' }),
    };

    mockFetch
      .mockResolvedValueOnce(rateLimitResponse)
      .mockResolvedValueOnce(successResponse);

    const result = await httpClient.request('/test');

    expect(result).toEqual({ success: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  }, 10000);

  it('should throw AuvikRateLimitError after max retries on rate limit', async () => {
    const rateLimitResponse = {
      ok: false,
      status: 403,
      text: async () => 'rate limit exceeded',
      headers: new Headers(),
    };

    mockFetch.mockResolvedValue(rateLimitResponse);

    await expect(httpClient.request('/test')).rejects.toThrow(AuvikRateLimitError);
    expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
  }, 20000);

  it('should throw AuvikAuthError on 401', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
      headers: new Headers(),
    });

    await expect(httpClient.request('/test')).rejects.toThrow(AuvikAuthError);
  });

  it('should retry on server errors', async () => {
    const serverErrorResponse = {
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
      headers: new Headers(),
    };

    const successResponse = {
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
      headers: new Headers({ 'content-type': 'application/json' }),
    };

    mockFetch
      .mockResolvedValueOnce(serverErrorResponse)
      .mockResolvedValueOnce(successResponse);

    const result = await httpClient.request('/test');

    expect(result).toEqual({ success: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should throw AuvikServerError after max retries on server errors', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
      headers: new Headers(),
    });

    await expect(httpClient.request('/test')).rejects.toThrow(AuvikServerError);
    expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });
});