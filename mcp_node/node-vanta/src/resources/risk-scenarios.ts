import type { HttpClient } from '../http.js';
import type { RiskScenario, ListParams, NormalizedList } from '../types/index.js';
import { unwrapPaginatedResponse } from '../pagination.js';

export class RiskScenariosResource {
  constructor(private readonly http: HttpClient) {}

  async list(params: ListParams = {}): Promise<NormalizedList<RiskScenario>> {
    const response = await this.http.request<unknown>('/risk-scenarios', { params });
    return unwrapPaginatedResponse<RiskScenario>(response);
  }

  async get(id: string): Promise<RiskScenario> {
    return this.http.request<RiskScenario>(`/risk-scenarios/${encodeURIComponent(id)}`);
  }
}
