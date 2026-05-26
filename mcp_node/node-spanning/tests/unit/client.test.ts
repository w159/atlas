import { describe, it, expect } from 'vitest';
import { SpanningClient } from '../../src/client.js';
import {
  SpanningAuthenticationError,
  SpanningConflictError,
  SpanningForbiddenError,
  SpanningNotFoundError,
  SpanningRateLimitError,
  SpanningServerError,
  NotImplementedError,
} from '../../src/errors.js';
import { recordedHeaders } from '../mocks/handlers.js';

function makeClient(
  overrides: Partial<ConstructorParameters<typeof SpanningClient>[0]> = {}
): SpanningClient {
  return new SpanningClient({
    adminEmail: 'admin@example.com',
    apiToken: 'test-token',
    platform: 'm365',
    rateLimit: { maxRetries: 0, retryAfterMs: 1, enabled: false },
    ...overrides,
  });
}

describe('SpanningClient', () => {
  it('exposes all resource namespaces', () => {
    const c = makeClient();
    expect(c.users).toBeDefined();
    expect(c.services).toBeDefined();
    expect(c.backups).toBeDefined();
    expect(c.restores).toBeDefined();
    expect(c.audit).toBeDefined();
    expect(c.license).toBeDefined();
    expect(c.gws).toBeDefined();
    expect(c.salesforce).toBeDefined();
  });

  it('uses the M365 base URL by default', () => {
    const c = new SpanningClient({ adminEmail: 'a@b.com', apiToken: 't' });
    expect(c.getConfig().apiUrl).toBe('https://o365-api.spanningbackup.com/external');
  });

  it('uses the GWS base URL when platform: "gws"', async () => {
    const c = makeClient({ platform: 'gws' });
    expect(c.getConfig().apiUrl).toBe('https://api.spanningbackup.com/external');
    const page = await c.users.list({ limit: 50 });
    expect(page.items[0]?.id).toBe('gws-1');
  });

  it('uses the Salesforce base URL when platform: "salesforce"', async () => {
    const c = makeClient({ platform: 'salesforce' });
    expect(c.getConfig().apiUrl).toBe('https://salesforce-api.spanningbackup.com');
    const page = await c.users.list({ limit: 50 });
    // Salesforce IDs are 15- or 18-character object IDs
    expect(page.items[0]?.id).toMatch(/^[A-Za-z0-9]{15,18}$/);
  });

  it('sends HTTP Basic auth with adminEmail:apiToken', async () => {
    const c = makeClient();
    await c.users.list();
    const expected = `Basic ${Buffer.from('admin@example.com:test-token').toString('base64')}`;
    expect(recordedHeaders.last['authorization']).toBe(expected);
  });

  it('lists users (single page)', async () => {
    const c = makeClient();
    const page = await c.users.list({ limit: 50 });
    expect(page.items).toHaveLength(2);
    expect(page.next).toBe('page-2');
  });

  it('iterates users across cursors with listAll', async () => {
    const c = makeClient();
    const ids: string[] = [];
    for await (const u of c.users.listAll({ limit: 50 })) {
      ids.push(u.id);
    }
    expect(ids).toEqual(['u1', 'u2', 'u3']);
  });

  it('gets a single user by id', async () => {
    const c = makeClient();
    expect(await c.users.get('u1')).toMatchObject({ id: 'u1', email: 'a@acme.com' });
  });

  it('lists services for a user', async () => {
    const c = makeClient();
    const page = await c.services.list('u1');
    expect(page.items.map((s) => s.name)).toEqual(['mail', 'drive', 'calendar']);
  });

  it('lists backups for a user/service', async () => {
    const c = makeClient();
    const page = await c.backups.list('u1', 'mail');
    expect(page.items).toHaveLength(2);
  });

  it('lists audit entries', async () => {
    const c = makeClient();
    const page = await c.audit.list({ from: '2026-04-01', to: '2026-05-01' });
    expect(page.items).toHaveLength(1);
  });

  it('returns license usage', async () => {
    const c = makeClient();
    expect(await c.license.get()).toMatchObject({ purchasedSeats: 100, usedSeats: 42 });
  });

  it('queues a restore and returns the queued status', async () => {
    const c = makeClient();
    const queued = await c.restores.queue('u1', 'mail', { backupId: 'b1' });
    expect(queued.restoreId).toMatch(/^r-/);
    expect(queued.status).toBe('queued');
  });

  it('polls a restore to completion via waitFor', async () => {
    const c = makeClient();
    const { restoreId } = await c.restores.queue('u1', 'mail', { backupId: 'b1' });
    const final = await c.restores.waitFor(restoreId, {
      intervalMs: 1,
      sleep: () => Promise.resolve(),
    });
    expect(final.status).toBe('completed');
  });

  it('times out waitFor when the restore never reaches a terminal status', async () => {
    const c = makeClient();
    const { restoreId } = await c.restores.queue('u1', 'mail', { backupId: 'b1' });
    let nowVal = 0;
    await expect(
      c.restores.waitFor(restoreId, {
        intervalMs: 1,
        timeoutMs: 10,
        now: () => {
          const v = nowVal;
          nowVal = 100;
          return v;
        },
        sleep: () => Promise.resolve(),
      })
    ).rejects.toThrow(/Timed out/);
  });

  it('maps 404 to SpanningNotFoundError', async () => {
    const c = makeClient();
    await expect(c.users.get('MISSING')).rejects.toBeInstanceOf(SpanningNotFoundError);
  });

  it('maps 401 with "verify both" hint mentioning admin email and platform', async () => {
    const c = makeClient();
    const err = await c.users.get('UNAUTH').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(SpanningAuthenticationError);
    const message = (err as Error).message;
    expect(message).toMatch(/admin email/i);
    expect(message).toMatch(/token/i);
    expect(message).toMatch(/admin@example\.com/);
    expect(message).toMatch(/m365/);
  });

  it('maps 403 to SpanningForbiddenError', async () => {
    const c = makeClient();
    await expect(c.users.get('FORBIDDEN')).rejects.toBeInstanceOf(SpanningForbiddenError);
  });

  it('maps 409 to SpanningConflictError when restore already in flight', async () => {
    const c = makeClient();
    await expect(
      c.restores.queue('user-conflict', 'mail', { backupId: 'b1' })
    ).rejects.toBeInstanceOf(SpanningConflictError);
  });

  it('maps 429 (after retries exhausted) to SpanningRateLimitError', async () => {
    const c = makeClient();
    await expect(c.users.get('RATE_LIMITED')).rejects.toBeInstanceOf(
      SpanningRateLimitError
    );
  });

  it('maps 500 to SpanningServerError after one retry', async () => {
    const c = makeClient();
    await expect(c.users.get('SERVER_ERROR')).rejects.toBeInstanceOf(SpanningServerError);
  });

  it('GWS placeholder resource throws NotImplementedError', () => {
    const c = makeClient({ platform: 'gws' });
    expect(() => c.gws.notImplemented()).toThrow(NotImplementedError);
  });

  it('Salesforce placeholder resource throws NotImplementedError', () => {
    const c = makeClient({ platform: 'salesforce' });
    expect(() => c.salesforce.notImplemented()).toThrow(NotImplementedError);
  });
});
