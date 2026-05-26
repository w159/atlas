import { describe, it, expect, beforeEach } from 'vitest';
import { PaylocityClient, AuthenticationError } from '../../src/index.js';
import { tokenStats } from '../mocks/handlers.js';

describe('PaylocityAuthManager', () => {
  beforeEach(() => tokenStats.reset());

  it('mints a token on first call using form-urlencoded body and caches it', async () => {
    const client = new PaylocityClient({
      clientId: 'good',
      clientSecret: 'secret',
      defaultCompanyId: 'C123',
    });
    const t1 = await client.auth.getAccessToken();
    const t2 = await client.auth.getAccessToken();
    expect(t1).toBe(t2);
    expect(tokenStats.mints).toBe(1);
    expect(tokenStats.lastContentType).toContain('application/x-www-form-urlencoded');
    const parsed = new URLSearchParams(tokenStats.lastBody);
    expect(parsed.get('client_id')).toBe('good');
    expect(parsed.get('client_secret')).toBe('secret');
    expect(parsed.get('grant_type')).toBe('client_credentials');
    expect(parsed.get('scope')).toBe('WebLinkAPI');
  });

  it('refresh() forces a fresh mint', async () => {
    const client = new PaylocityClient({
      clientId: 'good',
      clientSecret: 'secret',
      defaultCompanyId: 'C123',
    });
    await client.auth.getAccessToken();
    await client.auth.refresh();
    expect(tokenStats.mints).toBe(2);
  });

  it('throws AuthenticationError when token endpoint rejects creds', async () => {
    const client = new PaylocityClient({
      clientId: 'bad',
      clientSecret: 'bad',
      defaultCompanyId: 'C123',
    });
    await expect(client.auth.getAccessToken()).rejects.toBeInstanceOf(
      AuthenticationError
    );
  });

  it('honors sandbox flag for base URL', () => {
    const client = new PaylocityClient({
      clientId: 'a',
      clientSecret: 'b',
      sandbox: true,
    });
    expect(client.baseUrl).toBe('https://apisandbox.paylocity.com');
  });
});
