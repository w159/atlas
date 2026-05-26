import { describe, it, expect, beforeEach } from 'vitest';
import { VantaClient } from '../../src/index.js';
import { tokenStats } from '../mocks/handlers.js';

describe('FrameworksResource', () => {
  beforeEach(() => tokenStats.reset());

  it('list normalizes envelope to { items, endCursor, hasNextPage }', async () => {
    const client = new VantaClient({ clientId: 'good', clientSecret: 'good' });
    const page = await client.frameworks.list();
    expect(page.items).toHaveLength(2);
    expect(page.items[0]).toMatchObject({ id: 'soc2', name: 'SOC 2' });
    expect(page.hasNextPage).toBe(true);
    expect(page.endCursor).toBe('cur-1');
  });

  it('get returns the framework body', async () => {
    const client = new VantaClient({ clientId: 'good', clientSecret: 'good' });
    const f = await client.frameworks.get('soc2');
    expect(f).toMatchObject({ id: 'soc2', name: 'SOC 2' });
  });

  it('listControls returns normalized list', async () => {
    const client = new VantaClient({ clientId: 'good', clientSecret: 'good' });
    const page = await client.frameworks.listControls('soc2');
    expect(page.items).toHaveLength(1);
    expect(page.items[0]).toMatchObject({ id: 'ctrl-1' });
  });

  it('vulnerabilities, vendors, documents, tests all return normalized lists', async () => {
    const client = new VantaClient({ clientId: 'good', clientSecret: 'good' });
    const [v, vend, d, t] = await Promise.all([
      client.vulnerabilities.list(),
      client.vendors.list(),
      client.documents.list(),
      client.tests.list(),
    ]);
    expect(v.items[0]).toMatchObject({ severity: 'HIGH', isFixAvailable: true });
    expect(vend.items[0]).toMatchObject({ name: 'AWS' });
    expect(d.items[0]).toMatchObject({ status: 'CURRENT' });
    expect(t.items[0]).toMatchObject({ status: 'OK' });
  });
});
