/**
 * Alert types for NinjaOne
 */

import type { BaseListParams } from './common.js';

/**
 * Alert severity levels
 */
export type AlertSeverity = 'NONE' | 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL';

/**
 * Alert source types
 */
export type AlertSourceType =
  | 'CONDITION'
  | 'CONDITION_ACTIONSET'
  | 'CONDITION_ACTION'
  | 'PATCH_ACTION'
  | 'PATCH_ACTIONSET'
  | 'AGENT_OFFLINE'
  | 'ANTIVIRUS'
  | 'CLOUD_BACKUP'
  | 'DISK_SPACE'
  | 'MEMORY'
  | 'CPU'
  | 'SCRIPT'
  | 'CUSTOM_SCRIPT';

/**
 * Alert status
 */
export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESET' | 'CLOSED';

/**
 * Alert entity
 */
export interface Alert {
  /** Alert unique identifier */
  uid: string;
  /** Alert ID */
  id?: number;
  /** Device ID */
  deviceId: number;
  /** Organization ID */
  organizationId: number;
  /** Alert message */
  message: string;
  /** Alert severity */
  severity: AlertSeverity;
  /** Alert source type */
  sourceType: AlertSourceType;
  /** Alert status */
  status: AlertStatus;
  /** Creation timestamp */
  createTime: number;
  /** Last update timestamp */
  updateTime?: number;
  /** Reset timestamp */
  resetTime?: number;
  /** Source name */
  sourceName?: string;
  /** Source configuration UID */
  sourceConfigUid?: string;
  /** Subject */
  subject?: string;
  /** Priority */
  priority?: number;
  /** Ticket status */
  ticketStatus?: string;
  /** PSA ticket ID */
  psaTicketId?: string;
}

/**
 * Alert list parameters
 */
export interface AlertListParams extends BaseListParams {
  /** Filter by organization ID */
  organizationId?: number;
  /** Filter by device ID */
  deviceId?: number;
  /** Filter by severity */
  severity?: AlertSeverity;
  /** Filter by status */
  status?: AlertStatus;
  /** Filter by source type */
  sourceType?: AlertSourceType;
  /** Filter by language tag (for messages) */
  lang?: string;
  /** Created after timestamp */
  after?: number;
  /** Created before timestamp */
  before?: number;
}

/**
 * Alert list response
 */
export interface AlertListResponse {
  alerts: Alert[];
  cursor?: string;
}

/**
 * Alert reset/delete result
 */
export interface AlertActionResult {
  /** Number of alerts affected */
  count: number;
  /** Success status */
  success: boolean;
}
