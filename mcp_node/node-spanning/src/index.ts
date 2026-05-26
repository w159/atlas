/**
 * node-spanning
 *
 * Comprehensive, fully-typed Node.js/TypeScript client library for the
 * Spanning Cloud Backup REST API.
 */

// Main client
export { SpanningClient } from './client.js';

// Configuration
export type {
  SpanningConfig,
  SpanningPlatform,
  RateLimitConfig,
  ResolvedConfig,
} from './config.js';
export {
  DEFAULT_PLATFORM,
  DEFAULT_RATE_LIMIT_CONFIG,
  PLATFORM_BASE_URLS,
} from './config.js';

// Errors
export {
  SpanningError,
  SpanningAuthenticationError,
  SpanningForbiddenError,
  SpanningNotFoundError,
  SpanningConflictError,
  SpanningRateLimitError,
  SpanningServerError,
  NotImplementedError,
} from './errors.js';

// HTTP helper (exported for advanced users / testing)
export { buildUrl } from './http.js';

// Pagination
export {
  PaginatedIterable,
  clampLimit,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from './pagination.js';
export type { PaginationParams, PaginatedResponse } from './pagination.js';

// Resource classes (for typing)
export { UsersResource } from './resources/users.js';
export { ServicesResource } from './resources/services.js';
export { BackupsResource } from './resources/backups.js';
export {
  RestoresResource,
  DEFAULT_RESTORE_POLL_INTERVAL_MS,
  isTerminal,
} from './resources/restores.js';
export type { WaitForRestoreOptions } from './resources/restores.js';
export { AuditResource } from './resources/audit.js';
export { LicenseResource } from './resources/license.js';
export { GwsResource } from './resources/gws.js';
export { SalesforceResource } from './resources/salesforce.js';
export type { SalesforceObjectId } from './resources/salesforce.js';

// Domain types
export * from './types/index.js';
