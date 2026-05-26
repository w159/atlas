/**
 * Per-user service operations (mail, drive, calendar, contacts, etc.).
 */

import type { HttpClient } from '../http.js';
import type { SpanningService } from '../types/services.js';
import type { PaginatedResponse } from '../pagination.js';

export class ServicesResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /** List backed-up services for a user. */
  async list(userId: string): Promise<PaginatedResponse<SpanningService>> {
    return this.httpClient.get<PaginatedResponse<SpanningService>>(
      `/users/${encodeURIComponent(userId)}/services`
    );
  }
}
