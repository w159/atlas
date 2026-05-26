/**
 * Webhook types for NinjaOne
 */

/**
 * Webhook activity types
 */
export type WebhookActivityType =
  | 'ALERT_TRIGGERED'
  | 'ALERT_RESET'
  | 'DEVICE_ADDED'
  | 'DEVICE_DELETED'
  | 'DEVICE_APPROVAL_PENDING'
  | 'ORGANIZATION_ADDED'
  | 'ORGANIZATION_DELETED'
  | 'POLICY_CHANGED';

/**
 * Webhook entity
 */
export interface Webhook {
  /** Webhook ID */
  id: number;
  /** Webhook URL */
  url: string;
  /** Activity types to trigger webhook */
  activityTypes: WebhookActivityType[];
  /** Is active */
  isActive: boolean;
  /** Secret for signing */
  secret?: string;
  /** Creation timestamp */
  createTime?: number;
  /** Last update timestamp */
  updateTime?: number;
}

/**
 * Webhook list response
 */
export interface WebhookListResponse {
  webhooks: Webhook[];
}

/**
 * Webhook creation data
 */
export interface WebhookCreateData {
  /** Webhook URL (required) */
  url: string;
  /** Activity types to trigger webhook (required) */
  activityTypes: WebhookActivityType[];
  /** Is active (default: true) */
  isActive?: boolean;
}

/**
 * Webhook update data
 */
export interface WebhookUpdateData {
  /** Webhook URL */
  url?: string;
  /** Activity types to trigger webhook */
  activityTypes?: WebhookActivityType[];
  /** Is active */
  isActive?: boolean;
}

/**
 * Webhook payload (received when webhook is triggered)
 */
export interface WebhookPayload {
  /** Event ID */
  id: string;
  /** Activity type */
  activityType: WebhookActivityType;
  /** Timestamp */
  timestamp: number;
  /** Organization ID */
  organizationId?: number;
  /** Device ID */
  deviceId?: number;
  /** Alert UID */
  alertUid?: string;
  /** Event data */
  data?: Record<string, unknown>;
}
