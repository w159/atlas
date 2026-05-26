import { describe, it, expect, beforeEach, vi } from 'vitest';
import { paginate } from '../src/pagination.js';
import { HttpClient } from '../src/http.js';

describe('paginate', () => {
  let httpClient: HttpClient;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    httpClient = new HttpClient({
      baseUrl: 'https://api.example.com/v1',
      username: 'test@example.com',
      apiKey: 'test-key',
      timeout: 5000,
      maxRetries: 1,
      fetchImpl: mockFetch,
    });
    vi.clearAllMocks();
  });

  it('should paginate through multiple pages', async () => {
    const page1Response = {
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          { id: '1', type: 'test', attributes: { name: 'Item 1' } },
          { id: '2', type: 'test', attributes: { name: 'Item 2' } },
        ],
        links: {
          next: '/test?page[after]=cursor2',
        },
        meta: { totalRecords: 3 },
      }),
      headers: new Headers({ 'content-type': 'application/json' }),
    };

    const page2Response = {
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          { id: '3', type: 'test', attributes: { name: 'Item 3' } },
        ],
        links: {},
        meta: { totalRecords: 3 },
      }),
      headers: new Headers({ 'content-type': 'application/json' }),
    };

    mockFetch
      .mockResolvedValueOnce(page1Response)
      .mockResolvedValueOnce(page2Response);

    const pages = [];
    for await (const page of paginate(httpClient, '/test')) {
      pages.push(page);
    }

    expect(pages).toHaveLength(2);
    expect(pages[0].data).toEqual([
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
    ]);
    expect(pages[1].data).toEqual([
      { id: '3', name: 'Item 3' },
    ]);
    expect(pages[0].links.next).toBe('/test?page[after]=cursor2');
    expect(pages[0].meta.totalRecords).toBe(3);
  });

  it('should handle single page response', async () => {
    const response = {
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          { id: '1', type: 'test', attributes: { name: 'Item 1' } },
        ],
        links: {},
        meta: { totalRecords: 1 },
      }),
      headers: new Headers({ 'content-type': 'application/json' }),
    };

    mockFetch.mockResolvedValueOnce(response);

    const pages = [];
    for await (const page of paginate(httpClient, '/test')) {
      pages.push(page);
    }

    expect(pages).toHaveLength(1);
    expect(pages[0].data).toEqual([{ id: '1', name: 'Item 1' }]);
  });

  it('should handle single item response', async () => {
    const response = {
      ok: true,
      status: 200,
      json: async () => ({
        data: { id: '1', type: 'test', attributes: { name: 'Item 1' } },
        links: {},
        meta: {},
      }),
      headers: new Headers({ 'content-type': 'application/json' }),
    };

    mockFetch.mockResolvedValueOnce(response);

    const pages = [];
    for await (const page of paginate(httpClient, '/test')) {
      pages.push(page);
    }

    expect(pages).toHaveLength(1);
    expect(pages[0].data).toEqual([{ id: '1', name: 'Item 1' }]);
  });
});