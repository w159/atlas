import { describe, it, expect } from 'vitest';
import { ThreatLockerClient } from '../../src/index.js';

describe('ThreatLockerClient', () => {
  it('should initialize with required config', () => {
    const client = new ThreatLockerClient({
      apiKey: 'test-api-key',
    });

    expect(client).toBeDefined();
    expect(client.computers).toBeDefined();
    expect(client.computerGroups).toBeDefined();
    expect(client.approvalRequests).toBeDefined();
    expect(client.auditLog).toBeDefined();
    expect(client.organizations).toBeDefined();
  });

  it('should use custom base URL when provided', () => {
    const client = new ThreatLockerClient({
      apiKey: 'test-api-key',
      baseUrl: 'https://betaportalapi.g.threatlocker.com/portalapi',
    });

    expect(client).toBeDefined();
  });

  it('should set organization ID when provided', () => {
    const client = new ThreatLockerClient({
      apiKey: 'test-api-key',
      organizationId: '123',
    });

    expect(client).toBeDefined();
  });
});