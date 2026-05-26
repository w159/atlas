/**
 * User (backed-up M365 / GWS / Salesforce account) operations.
 */

import type { HttpClient } from '../http.js';
import type { SpanningUser } from '../types/users.js';
import {
  PaginatedIterable,
  type PaginationParams,
  type PaginatedResponse,
  clampLimit,
} from '../pagination.js';

export class UsersResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /** List users (single page). */
  async list(params?: PaginationParams): Promise<PaginatedResponse<SpanningUser>> {
    const query: Record<string, string | number | boolean | undefined> = {
      limit: clampLimit(params?.limit),
    };
    if (params?.cursor) query['cursor'] = params.cursor;
    return this.httpClient.get<PaginatedResponse<SpanningUser>>('/users', query);
  }

  /** Iterate over every user, fetching pages on demand. */
  listAll(params?: PaginationParams): PaginatedIterable<SpanningUser> {
    return new PaginatedIterable<SpanningUser>(this.httpClient, '/users', params);
  }

  /** Get a single user by ID. */
  async get(userId: string): Promise<SpanningUser> {
    return this.httpClient.get<SpanningUser>(`/users/${encodeURIComponent(userId)}`);
  }
}
