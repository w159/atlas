import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TenantsResource } from '../../src/resources/tenants.js';
import { HttpClient } from '../../src/http.js';

describe('TenantsResource', () => {
  let tenantsResource: TenantsResource;
  let mockFetch: ReturnType<typeof vi.fn>;
  let httpClient: HttpClient;

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
    tenantsResource = new TenantsResource(async () => httpClient);
    vi.clearAllMocks();
  });

  it('should list tenants', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          {
            id: '1',
            type: 'tenant',
            attributes: {
              domainPrefix: 'test',
              tenantName: 'Test Tenant',
              tenantId: 'tenant-1',
              domainPrefixEnabled: true,
            },
          },
        ],
        links: {},
        meta: { totalRecords: 1 },
      }),
      headers: new Headers({ 'content-type': 'application/json' }),
    };

    mockFetch.mockResolvedValueOnce(mockResponse);

    const result = await tenantsResource.list();

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: '1',
      domainPrefix: 'test',
      tenantName: 'Test Tenant',
      tenantId: 'tenant-1',
      domainPrefixEnabled: true,
    });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/v1/tenants',
      expect.any(Object)
    );
  });

  it('should list tenants with pagination options', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        data: [],
        links: {},
        meta: {},
      }),
      headers: new Headers({ 'content-type': 'application/json' }),
    };

    mockFetch.mockResolvedValueOnce(mockResponse);

    await tenantsResource.list({
      pageSize: 10,
      pageAfter: 'cursor123',
      filters: { tenantType: 'client' },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/v1/tenants?tenantType=client&page%5Bfirst%5D=10&page%5Bafter%5D=cursor123',
      expect.any(Object)
    );
  });

  it('should get single tenant', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          id: '1',
          type: 'tenant',
          attributes: {
            domainPrefix: 'test',
            tenantName: 'Test Tenant',
            tenantId: 'tenant-1',
            domainPrefixEnabled: true,
          },
        },
        links: {},
        meta: {},
      }),
      headers: new Headers({ 'content-type': 'application/json' }),
    };

    mockFetch.mockResolvedValueOnce(mockResponse);

    const result = await tenantsResource.get('1');

    expect(result).toMatchObject({
      id: '1',
      domainPrefix: 'test',
      tenantName: 'Test Tenant',
      tenantId: 'tenant-1',
      domainPrefixEnabled: true,
    });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/v1/tenants/1',
      expect.any(Object)
    );
  });

  it('should list all tenants via async iterator', async () => {
    const page1Response = {
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          { id: '1', type: 'tenant', attributes: { tenantName: 'Tenant 1' } },
          { id: '2', type: 'tenant', attributes: { tenantName: 'Tenant 2' } },
        ],
        links: { next: '/tenants?page[after]=cursor2' },
        meta: {},
      }),
      headers: new Headers({ 'content-type': 'application/json' }),
    };

    const page2Response = {
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          { id: '3', type: 'tenant', attributes: { tenantName: 'Tenant 3' } },
        ],
        links: {},
        meta: {},
      }),
      headers: new Headers({ 'content-type': 'application/json' }),
    };

    mockFetch
      .mockResolvedValueOnce(page1Response)
      .mockResolvedValueOnce(page2Response);

    const tenants = [];
    for await (const tenant of tenantsResource.listAll()) {
      tenants.push(tenant);
    }

    expect(tenants).toHaveLength(3);
    expect(tenants[0].tenantName).toBe('Tenant 1');
    expect(tenants[1].tenantName).toBe('Tenant 2');
    expect(tenants[2].tenantName).toBe('Tenant 3');
  });
});