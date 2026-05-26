import { describe, it, expect, beforeEach } from 'vitest';
import {
  PaylocityClient,
  AuthenticationError,
  NotFoundError,
  ValidationError,
  fetchAllPages,
} from '../../src/index.js';
import { tokenStats, rateLimitStats } from '../mocks/handlers.js';

function mkClient() {
  return new PaylocityClient({
    clientId: 'good',
    clientSecret: 'secret',
    defaultCompanyId: 'C123',
  });
}

describe('Modern employees', () => {
  beforeEach(() => {
    tokenStats.reset();
    rateLimitStats.reset();
  });

  it('list normalizes modern envelope to { items, nextToken }', async () => {
    const c = mkClient();
    const page = await c.employees.list({ limit: 1 });
    expect(page.items).toHaveLength(1);
    expect(page.items[0]).toMatchObject({ employeeId: 'E1' });
    expect(page.nextToken).toBe('page-2');
  });

  it('list paginates with nextToken until null', async () => {
    const c = mkClient();
    const all = await fetchAllPages(t => c.employees.list({ nextToken: t }));
    expect(all.map(e => e.employeeId)).toEqual(['E1', 'E2']);
  });

  it('get returns the employee body', async () => {
    const c = mkClient();
    const emp = await c.employees.get('E1');
    expect(emp).toMatchObject({ employeeId: 'E1', firstName: 'Alice' });
  });
});

describe('Legacy resources', () => {
  beforeEach(() => tokenStats.reset());

  it('legacy employees list returns raw-array items with null nextToken', async () => {
    const c = mkClient();
    const r = await c.legacyEmployees.list();
    expect(r.items).toHaveLength(2);
    expect(r.nextToken).toBeNull();
  });

  it('deductions list returns raw-array items', async () => {
    const c = mkClient();
    const r = await c.deductions.list('E1');
    expect(r.items[0]).toMatchObject({ deductionCode: '401K' });
    expect(r.nextToken).toBeNull();
  });

  it('earnings.listCompanyEarnings uses modern envelope', async () => {
    const c = mkClient();
    const r = await c.earnings.listCompanyEarnings();
    expect(r.items[0]).toMatchObject({ earningCode: 'REG' });
  });
});

describe('HTTP behavior', () => {
  beforeEach(() => {
    tokenStats.reset();
    rateLimitStats.reset();
  });

  it('retries on 429 and succeeds', async () => {
    const c = new PaylocityClient({
      clientId: 'good',
      clientSecret: 'secret',
      defaultCompanyId: 'C123',
      maxRetries: 3,
    });
    // Reach into the http via a resource path
    const http = (c.employees as unknown as { http: { request: (p: string) => Promise<unknown> } }).http;
    const r = await http.request('/__ratelimit_then_ok');
    expect(r).toMatchObject({ data: [{ ok: true }] });
    expect(rateLimitStats.hits).toBe(2);
  });

  it('401 surfaces AuthenticationError with traceId from modern envelope', async () => {
    const c = new PaylocityClient({
      clientId: 'good',
      clientSecret: 'secret',
      defaultCompanyId: 'C123',
      maxRetries: 1,
    });
    const http = (c.employees as unknown as { http: { request: (p: string) => Promise<unknown> } }).http;
    try {
      await http.request('/__always_401');
      throw new Error('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(AuthenticationError);
      expect((e as AuthenticationError).traceId).toBe('trace-abc');
    }
  });

  it('modern 404 envelope extracted', async () => {
    const c = new PaylocityClient({
      clientId: 'good',
      clientSecret: 'secret',
      defaultCompanyId: 'C123',
      maxRetries: 0,
    });
    const http = (c.employees as unknown as { http: { request: (p: string) => Promise<unknown> } }).http;
    try {
      await http.request('/__modern_404');
      throw new Error('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundError);
      expect((e as NotFoundError).message).toContain('Not Found');
      expect((e as NotFoundError).traceId).toBe('trace-xyz');
    }
  });

  it('legacy 400 envelope extracted with field-level errors', async () => {
    const c = new PaylocityClient({
      clientId: 'good',
      clientSecret: 'secret',
      defaultCompanyId: 'C123',
      maxRetries: 0,
    });
    const http = (c.employees as unknown as { http: { request: (p: string) => Promise<unknown> } }).http;
    try {
      await http.request('/__legacy_400');
      throw new Error('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).errors).toHaveLength(1);
      expect((e as ValidationError).errors[0].field).toBe('firstName');
    }
  });
});
