import type { HttpClient } from '../http.js';
import type { Vulnerability, VulnerabilityListParams, NormalizedList } from '../types/index.js';
import { unwrapPaginatedResponse } from '../pagination.js';

export class VulnerabilitiesResource {
  constructor(private readonly http: HttpClient) {}

  async list(params: VulnerabilityListParams = {}): Promise<NormalizedList<Vulnerability>> {
    const response = await this.http.request<unknown>('/vulnerabilities', { params });
    return unwrapPaginatedResponse<Vulnerability>(response);
  }

  async get(id: string): Promise<Vulnerability> {
    return this.http.request<Vulnerability>(`/vulnerabilities/${encodeURIComponent(id)}`);
  }
}
