/**
 * Main Spanning Cloud Backup client.
 */

import type { SpanningConfig, ResolvedConfig } from './config.js';
import { resolveConfig } from './config.js';
import { HttpClient } from './http.js';
import { RateLimiter } from './rate-limiter.js';
import { UsersResource } from './resources/users.js';
import { ServicesResource } from './resources/services.js';
import { BackupsResource } from './resources/backups.js';
import { RestoresResource } from './resources/restores.js';
import { AuditResource } from './resources/audit.js';
import { LicenseResource } from './resources/license.js';
import { GwsResource } from './resources/gws.js';
import { SalesforceResource } from './resources/salesforce.js';

/**
 * Spanning Cloud Backup API client.
 *
 * @example
 * ```typescript
 * import { SpanningClient } from 'node-spanning';
 *
 * const client = new SpanningClient({
 *   adminEmail: 'admin@example.com',
 *   apiToken: process.env.SPANNING_API_TOKEN!,
 *   platform: 'm365', // or 'gws' | 'salesforce'
 * });
 *
 * for await (const user of client.users.listAll()) {
 *   console.log(user.id, user.email);
 * }
 * ```
 */
export class SpanningClient {
  private readonly config: ResolvedConfig;
  private readonly rateLimiter: RateLimiter;
  private readonly httpClient: HttpClient;

  /** Backed-up user (M365/GWS/Salesforce account) operations. */
  readonly users: UsersResource;
  /** Per-user service (mail/drive/calendar/etc.) operations. */
  readonly services: ServicesResource;
  /** Backup-run operations. */
  readonly backups: BackupsResource;
  /** Restore (queue + poll) operations. */
  readonly restores: RestoresResource;
  /** Audit log (date-ranged). */
  readonly audit: AuditResource;
  /** License / seat-usage report. */
  readonly license: LicenseResource;
  /** Google Workspace-specific helpers (placeholder — throws NotImplementedError). */
  readonly gws: GwsResource;
  /** Salesforce-specific helpers (placeholder — throws NotImplementedError). */
  readonly salesforce: SalesforceResource;

  constructor(config: SpanningConfig) {
    this.config = resolveConfig(config);
    this.rateLimiter = new RateLimiter(this.config.rateLimit);
    this.httpClient = new HttpClient(this.config, this.rateLimiter);

    this.users = new UsersResource(this.httpClient);
    this.services = new ServicesResource(this.httpClient);
    this.backups = new BackupsResource(this.httpClient);
    this.restores = new RestoresResource(this.httpClient);
    this.audit = new AuditResource(this.httpClient);
    this.license = new LicenseResource(this.httpClient);
    this.gws = new GwsResource();
    this.salesforce = new SalesforceResource();
  }

  /** Get the resolved configuration. */
  getConfig(): Readonly<ResolvedConfig> {
    return this.config;
  }
}
