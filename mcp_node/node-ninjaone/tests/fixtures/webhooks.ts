/**
 * Webhook fixtures
 */

import type { Webhook } from '../../src/types/webhooks.js';

export const list: Webhook[] = [
  {
    id: 5001,
    url: 'https://example.com/webhook',
    activityTypes: ['ALERT_TRIGGERED', 'ALERT_RESET'],
    isActive: true,
    createTime: 1704067200000,
    updateTime: 1704153600000,
  },
];

export const single: Webhook = list[0]!;

export const created: Webhook = {
  id: 5002,
  url: 'https://example.com/new-webhook',
  activityTypes: ['DEVICE_ADDED', 'DEVICE_DELETED'],
  isActive: true,
  createTime: Date.now(),
  updateTime: Date.now(),
};

export const updated: Webhook = {
  ...single,
  url: 'https://example.com/updated-webhook',
  updateTime: Date.now(),
};
