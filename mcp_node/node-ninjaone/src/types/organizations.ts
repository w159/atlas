/**
 * Organization types for NinjaOne
 */

import type { BaseEntity, BaseListParams, Location, TimestampFields } from './common.js';

/**
 * Organization entity
 */
export interface Organization extends BaseEntity, TimestampFields {
  /** Organization name */
  name: string;
  /** Organization description */
  description?: string;
  /** Node approval mode */
  nodeApprovalMode?: 'AUTOMATIC' | 'MANUAL' | 'REJECT';
  /** Policy ID */
  policyId?: number;
  /** Location information */
  locations?: Location[];
  /** Custom fields */
  fields?: Record<string, unknown>;
  /** Tags */
  tags?: string[];
  /** User data */
  userData?: Record<string, unknown>;
}

/**
 * Organization list parameters
 */
export interface OrganizationListParams extends BaseListParams {
  /** Filter by name (partial match) */
  name?: string;
  /** Include custom fields */
  fields?: boolean;
}

/**
 * Organization list response
 */
export interface OrganizationListResponse {
  organizations: Organization[];
  cursor?: string;
}

/**
 * Organization creation data
 */
export interface OrganizationCreateData {
  /** Organization name (required) */
  name: string;
  /** Organization description */
  description?: string;
  /** Node approval mode */
  nodeApprovalMode?: 'AUTOMATIC' | 'MANUAL' | 'REJECT';
  /** Policy ID */
  policyId?: number;
  /** Location information */
  locations?: Location[];
  /** Custom fields */
  fields?: Record<string, unknown>;
  /** Tags */
  tags?: string[];
  /** User data */
  userData?: Record<string, unknown>;
}

/**
 * Organization update data
 */
export interface OrganizationUpdateData {
  /** Organization name */
  name?: string;
  /** Organization description */
  description?: string;
  /** Node approval mode */
  nodeApprovalMode?: 'AUTOMATIC' | 'MANUAL' | 'REJECT';
  /** Policy ID */
  policyId?: number;
  /** Location information */
  locations?: Location[];
  /** Custom fields */
  fields?: Record<string, unknown>;
  /** Tags */
  tags?: string[];
  /** User data */
  userData?: Record<string, unknown>;
}

/**
 * Organization detailed view with device counts
 */
export interface OrganizationDetailed extends Organization {
  /** Number of devices */
  deviceCount?: number;
  /** Number of policies */
  policyCount?: number;
  /** Backup usage in bytes */
  backupUsage?: number;
}
