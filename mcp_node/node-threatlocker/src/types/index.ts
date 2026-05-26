export * from './common.js';
import type { PaginationParams } from './common.js';

// Computer types
export interface Computer {
  id: number;
  name: string;
  domain?: string;
  lastSeen?: string;
  operatingSystem?: string;
  computerGroupId?: number;
  organizationId: number;
}

export interface ComputerListParams extends Partial<PaginationParams> {
  // Add specific computer search filters as needed
}

export interface ComputerCheckin {
  id: number;
  computerId: number;
  checkinTime: string;
  version?: string;
  status?: string;
}

export interface ComputerCheckinParams extends Partial<PaginationParams> {
  computerId?: number;
  fromDate?: string;
  toDate?: string;
}

// Computer Group types
export interface ComputerGroup {
  id: number;
  name: string;
  description?: string;
  organizationId: number;
  parentGroupId?: number;
  computersCount?: number;
}

export interface ComputerGroupListParams {
  osType?: string;
  includeAllComputers?: boolean;
  includeGlobal?: boolean;
  includeAllPolicies?: boolean;
  includeOrganizations?: boolean;
  includeParentGroups?: boolean;
}

export interface ComputerGroupDropdownParams {
  organizationId?: number;
}

// Approval Request types
export interface ApprovalRequest {
  id: number;
  applicationName: string;
  filePath: string;
  status: string;
  requestedBy?: string;
  requestedAt: string;
  computerId?: number;
  organizationId: number;
}

export interface ApprovalRequestListParams extends Partial<PaginationParams> {
  status?: string;
  computerId?: number;
}

export interface PermitApplication {
  id: number;
  applicationPath: string;
  approvalRequestId: number;
  status: string;
}

// Audit Log types
export interface AuditLogEntry {
  id: number;
  actionType: string;
  timestamp: string;
  userId?: number;
  computerId?: number;
  description: string;
  details?: Record<string, unknown>;
}

export interface AuditLogSearchParams extends Partial<PaginationParams> {
  actionType?: string;
  fromDate?: string;
  toDate?: string;
  userId?: number;
  computerId?: number;
}

// Organization types
export interface Organization {
  id: number;
  name: string;
  parentOrganizationId?: number;
  childOrganizationsCount?: number;
  computersCount?: number;
}

export interface OrganizationListParams extends Partial<PaginationParams> {
  // Add specific organization search filters as needed
}

export interface AuthKey {
  key: string;
  organizationId: number;
}