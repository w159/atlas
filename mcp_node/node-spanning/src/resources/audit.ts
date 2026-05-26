/**
 * Audit log operations.
 */

import type { HttpClient } from '../http.js';
import type { AuditListParams, SpanningAuditEntry } from '../types/audit.js';
import {
  PaginatedIterable,
  type PaginationParams,
  type PaginatedResponse,
  clampLimit,
} from '../pagination.js';

export class AuditResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /** List audit entries, optionally bounded by a date range. */
  async list(
    params?: PaginationParams & AuditListParams
  ): Promise<PaginatedResponse<SpanningAuditEntry>> {
    const query: Record<string, string | number | boolean | undefined> = {
      limit: clampLimit(params?.limit),
    };
    if (params?.cursor) query['cursor'] = params.cursor;
    if (params?.from) query['from'] = params.from;
    if (params?.to) query['to'] = params.to;
    return this.httpClient.get<PaginatedResponse<SpanningAuditEntry>>('/audit', query);
  }

  /** Iterate over every audit entry. */
  listAll(
    params?: PaginationParams & AuditListParams
  ): PaginatedIterable<SpanningAuditEntry> {
    const extra: Record<string, string | number | boolean | undefined> = {};
    if (params?.from) extra['from'] = params.from;
    if (params?.to) extra['to'] = params.to;
    return new PaginatedIterable<SpanningAuditEntry>(
      this.httpClient,
      '/audit',
      params,
      extra
    );
  }
}
