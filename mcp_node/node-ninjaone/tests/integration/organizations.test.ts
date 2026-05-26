/**
 * Organizations integration tests
 */

import { describe, it, expect } from 'vitest';
import { NinjaOneClient } from '../../src/client.js';
import { NinjaOneNotFoundError } from '../../src/errors.js';

describe('OrganizationsResource', () => {
  const client = new NinjaOneClient({
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    region: 'us',
  });

  describe('list', () => {
    it('should list organizations', async () => {
      const organizations = await client.organizations.list();

      expect(organizations).toHaveLength(2);
      expect(organizations[0]?.name).toBe('Acme Corp');
    });
  });

  describe('get', () => {
    it('should get a single organization', async () => {
      const org = await client.organizations.get(1);

      expect(org.id).toBe(1);
      expect(org.name).toBe('Acme Corp');
      expect(org.locations).toHaveLength(1);
    });

    it('should throw NotFoundError for non-existent organization', async () => {
      await expect(client.organizations.get(999)).rejects.toThrow(NinjaOneNotFoundError);
    });
  });

  describe('getDetailed', () => {
    it('should get detailed organization info', async () => {
      const org = await client.organizations.getDetailed(1);

      expect(org.id).toBe(1);
      expect(org.deviceCount).toBe(50);
      expect(org.policyCount).toBe(3);
    });
  });

  describe('create', () => {
    it('should create an organization', async () => {
      const org = await client.organizations.create({
        name: 'New Organization',
        description: 'Test description',
      });

      expect(org.id).toBe(3);
      expect(org.name).toBe('New Organization');
    });
  });

  describe('update', () => {
    it('should update an organization', async () => {
      const org = await client.organizations.update(1, {
        name: 'Updated Acme Corp',
      });

      expect(org.id).toBe(1);
      expect(org.name).toBe('Updated Acme Corp');
    });
  });

  describe('delete', () => {
    it('should delete an organization', async () => {
      await expect(client.organizations.delete(1)).resolves.toBeUndefined();
    });
  });
});
