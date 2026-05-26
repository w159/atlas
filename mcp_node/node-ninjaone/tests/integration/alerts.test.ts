/**
 * Alerts integration tests
 */

import { describe, it, expect } from 'vitest';
import { NinjaOneClient } from '../../src/client.js';
import { NinjaOneNotFoundError } from '../../src/errors.js';

describe('AlertsResource', () => {
  const client = new NinjaOneClient({
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    region: 'us',
  });

  describe('list', () => {
    it('should list all alerts', async () => {
      const alerts = await client.alerts.list();

      expect(alerts).toHaveLength(2);
      expect(alerts[0]?.severity).toBe('MAJOR');
    });
  });

  describe('listByDevice', () => {
    it('should list alerts for a device', async () => {
      const alerts = await client.alerts.listByDevice(101);

      expect(alerts).toHaveLength(2);
    });
  });

  describe('get', () => {
    it('should get a single alert', async () => {
      const alert = await client.alerts.get('alert-uid-001');

      expect(alert.uid).toBe('alert-uid-001');
      expect(alert.message).toBe('CPU usage exceeded 90%');
    });

    it('should throw NotFoundError for non-existent alert', async () => {
      await expect(client.alerts.get('not-found')).rejects.toThrow(NinjaOneNotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete an alert', async () => {
      await expect(client.alerts.delete('alert-uid-001')).resolves.toBeUndefined();
    });
  });

  describe('reset', () => {
    it('should reset an alert', async () => {
      await expect(client.alerts.reset('alert-uid-001')).resolves.toBeUndefined();
    });
  });
});
