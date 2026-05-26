/**
 * Backup-run operations (one record per day per service per user).
 */

import type { HttpClient } from '../http.js';
import type { SpanningBackup } from '../types/backups.js';
import {
  PaginatedIterable,
  type PaginationParams,
  type PaginatedResponse,
  clampLimit,
} from '../pagination.js';

export class BackupsResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  private path(userId: string, service: string): string {
    return `/users/${encodeURIComponent(userId)}/services/${encodeURIComponent(service)}/backups`;
  }

  /** List backups for a user/service (single page). */
  async list(
    userId: string,
    service: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<SpanningBackup>> {
    const query: Record<string, string | number | boolean | undefined> = {
      limit: clampLimit(params?.limit),
    };
    if (params?.cursor) query['cursor'] = params.cursor;
    return this.httpClient.get<PaginatedResponse<SpanningBackup>>(
      this.path(userId, service),
      query
    );
  }

  /** Iterate over every backup for a user/service. */
  listAll(
    userId: string,
    service: string,
    params?: PaginationParams
  ): PaginatedIterable<SpanningBackup> {
    return new PaginatedIterable<SpanningBackup>(
      this.httpClient,
      this.path(userId, service),
      params
    );
  }
}
