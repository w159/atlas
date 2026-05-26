import { describe, it, expect, beforeEach } from 'vitest';
import { VantaClient, AuthenticationError } from '../../src/index.js';
import { tokenStats } from '../mocks/handlers.js';

describe('VantaAuthManager', () => {
  beforeEach(() => tokenStats.reset());

  it('mints a token on first call and caches it', async () => {
    const client = new VantaClient({ clientId: 'good', clientSecret: 'good' });
    const t1 = await client.auth.getAccessToken();
    const t2 = await client.auth.getAccessToken();
    expect(t1).toBe(t2);
    expect(tokenStats.mints).toBe(1);
  });

  it('refresh() forces a new mint', async () => {
    const client = new VantaClient({ clientId: 'good', clientSecret: 'good' });
    await client.auth.getAccessToken();
    await client.auth.refresh();
    expect(tokenStats.mints).toBe(2);
  });

  it('throws AuthenticationError when token endpoint rejects creds', async () => {
    const client = new VantaClient({ clientId: 'bad', clientSecret: 'bad' });
    await expect(client.auth.getAccessToken()).rejects.toBeInstanceOf(AuthenticationError);
  });
});
