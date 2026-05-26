import type { HttpClient } from '../http.js';
import type { HealthResponse } from '../types/index.js';

export class HealthResource {
  constructor(private readonly http: HttpClient) {}

  async check(): Promise<HealthResponse> {
    return this.http.request<HealthResponse>('/health');
  }
}
