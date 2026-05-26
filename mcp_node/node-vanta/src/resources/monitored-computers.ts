import type { HttpClient } from '../http.js';
import type { MonitoredComputer, MonitoredComputerListParams, NormalizedList } from '../types/index.js';
import { unwrapPaginatedResponse } from '../pagination.js';

export class MonitoredComputersResource {
  constructor(private readonly http: HttpClient) {}

  async list(params: MonitoredComputerListParams = {}): Promise<NormalizedList<MonitoredComputer>> {
    const response = await this.http.request<unknown>('/monitored-computers', { params });
    return unwrapPaginatedResponse<MonitoredComputer>(response);
  }

  async get(id: string): Promise<MonitoredComputer> {
    return this.http.request<MonitoredComputer>(`/monitored-computers/${encodeURIComponent(id)}`);
  }
}
