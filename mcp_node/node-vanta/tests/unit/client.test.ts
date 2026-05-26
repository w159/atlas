import { describe, it, expect } from 'vitest';
import { VantaClient } from '../../src/index.js';

describe('VantaClient', () => {
  it('initializes with required config and exposes resources', () => {
    const client = new VantaClient({ clientId: 'a', clientSecret: 'b' });
    expect(client.frameworks).toBeDefined();
    expect(client.controls).toBeDefined();
    expect(client.tests).toBeDefined();
    expect(client.documents).toBeDefined();
    expect(client.integrations).toBeDefined();
    expect(client.people).toBeDefined();
    expect(client.vendors).toBeDefined();
    expect(client.riskScenarios).toBeDefined();
    expect(client.vulnerabilities).toBeDefined();
    expect(client.policies).toBeDefined();
    expect(client.monitoredComputers).toBeDefined();
  });

  it('honors custom base URL', () => {
    const client = new VantaClient({
      clientId: 'a',
      clientSecret: 'b',
      baseUrl: 'https://api.eu.vanta.com/v1',
    });
    expect(client).toBeDefined();
  });
});
