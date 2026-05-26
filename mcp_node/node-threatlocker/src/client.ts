import type { ThreatLockerClientConfig } from './types/index.js';
import { HttpClient } from './http.js';
import { RateLimiter } from './rate-limiter.js';
import { ComputersResource } from './resources/computers.js';
import { ComputerGroupsResource } from './resources/computer-groups.js';
import { ApprovalRequestsResource } from './resources/approval-requests.js';
import { AuditLogResource } from './resources/audit-log.js';
import { OrganizationsResource } from './resources/organizations.js';

export class ThreatLockerClient {
  readonly computers: ComputersResource;
  readonly computerGroups: ComputerGroupsResource;
  readonly approvalRequests: ApprovalRequestsResource;
  readonly auditLog: AuditLogResource;
  readonly organizations: OrganizationsResource;

  constructor(config: ThreatLockerClientConfig) {
    const rateLimiter = new RateLimiter(config.rateLimitPerSecond ?? 10);
    const http = new HttpClient({
      baseUrl: config.baseUrl ?? 'https://portalapi.g.threatlocker.com/portalapi',
      apiKey: config.apiKey,
      organizationId: config.organizationId,
      maxRetries: config.maxRetries ?? 3,
      rateLimiter,
    });

    this.computers = new ComputersResource(http);
    this.computerGroups = new ComputerGroupsResource(http);
    this.approvalRequests = new ApprovalRequestsResource(http);
    this.auditLog = new AuditLogResource(http);
    this.organizations = new OrganizationsResource(http);
  }
}