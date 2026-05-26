/**
 * Client tests
 */

import { describe, it, expect } from 'vitest';
import { NinjaOneClient } from '../../src/client.js';

describe('NinjaOneClient', () => {
  const createClient = () =>
    new NinjaOneClient({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      region: 'us',
    });

  describe('constructor', () => {
    it('should create client with US region', () => {
      const client = createClient();

      expect(client.getConfig().baseUrl).toBe('https://app.ninjarmm.com');
    });

    it('should create client with EU region', () => {
      const client = new NinjaOneClient({
        clientId: 'test-id',
        clientSecret: 'test-secret',
        region: 'eu',
      });

      expect(client.getConfig().baseUrl).toBe('https://eu.ninjarmm.com');
    });

    it('should create client with explicit baseUrl', () => {
      const client = new NinjaOneClient({
        clientId: 'test-id',
        clientSecret: 'test-secret',
        baseUrl: 'https://custom.ninjarmm.com',
      });

      expect(client.getConfig().baseUrl).toBe('https://custom.ninjarmm.com');
    });
  });

  describe('resource initialization', () => {
    it('should have all resources initialized', () => {
      const client = createClient();

      expect(client.organizations).toBeDefined();
      expect(client.devices).toBeDefined();
      expect(client.alerts).toBeDefined();
      expect(client.tickets).toBeDefined();
      expect(client.webhooks).toBeDefined();
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return rate limit status', () => {
      const client = createClient();
      const status = client.getRateLimitStatus();

      expect(status.remaining).toBe(100);
      expect(status.rate).toBe(0);
    });
  });

  describe('invalidateToken', () => {
    it('should not throw', () => {
      const client = createClient();

      expect(() => client.invalidateToken()).not.toThrow();
    });
  });

  describe('getConfig', () => {
    it('should return readonly config', () => {
      const client = createClient();
      const config = client.getConfig();

      expect(config.clientId).toBe('test-client-id');
      expect(config.clientSecret).toBe('test-client-secret');
      expect(config.baseUrl).toBe('https://app.ninjarmm.com');
      expect(config.scopes).toEqual(['monitoring', 'management']);
    });
  });
});
