import type { HttpClient } from '../http.js';
import type { Policy, ListParams, NormalizedList } from '../types/index.js';
import { unwrapPaginatedResponse } from '../pagination.js';

export class PoliciesResource {
  constructor(private readonly http: HttpClient) {}

  async list(params: ListParams = {}): Promise<NormalizedList<Policy>> {
    const response = await this.http.request<unknown>('/policies', { params });
    return unwrapPaginatedResponse<Policy>(response);
  }

  async get(id: string): Promise<Policy> {
    return this.http.request<Policy>(`/policies/${encodeURIComponent(id)}`);
  }
}
