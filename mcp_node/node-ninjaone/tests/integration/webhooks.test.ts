/**
 * Webhooks integration tests
 */

import { describe, it, expect } from 'vitest';
import { NinjaOneClient } from '../../src/client.js';

describe('WebhooksResource', () => {
  const client = new NinjaOneClient({
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    region: 'us',
  });

  describe('list', () => {
    it('should list webhooks', async () => {
      const webhooks = await client.webhooks.list();

      expect(webhooks).toHaveLength(1);
      expect(webhooks[0]?.url).toBe('https://example.com/webhook');
    });
  });

  describe('get', () => {
    it('should get a single webhook', async () => {
      const webhook = await client.webhooks.get(5001);

      expect(webhook.id).toBe(5001);
      expect(webhook.activityTypes).toContain('ALERT_TRIGGERED');
    });
  });

  describe('create', () => {
    it('should create a webhook', async () => {
      const webhook = await client.webhooks.create({
        url: 'https://example.com/new-webhook',
        activityTypes: ['DEVICE_ADDED', 'DEVICE_DELETED'],
      });

      expect(webhook.id).toBe(5002);
      expect(webhook.url).toBe('https://example.com/new-webhook');
    });
  });

  describe('update', () => {
    it('should update a webhook', async () => {
      const webhook = await client.webhooks.update(5001, {
        url: 'https://example.com/updated-webhook',
      });

      expect(webhook.url).toBe('https://example.com/updated-webhook');
    });
  });

  describe('delete', () => {
    it('should delete a webhook', async () => {
      await expect(client.webhooks.delete(5001)).resolves.toBeUndefined();
    });
  });
});
