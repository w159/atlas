import type { HttpClient } from '../http.js';
import type { Framework, Control, ListParams, NormalizedList } from '../types/index.js';
import { unwrapPaginatedResponse } from '../pagination.js';

export class FrameworksResource {
  constructor(private readonly http: HttpClient) {}

  async list(params: ListParams = {}): Promise<NormalizedList<Framework>> {
    const response = await this.http.request<unknown>('/frameworks', { params });
    return unwrapPaginatedResponse<Framework>(response);
  }

  async get(id: string): Promise<Framework> {
    return this.http.request<Framework>(`/frameworks/${encodeURIComponent(id)}`);
  }

  async listControls(id: string, params: ListParams = {}): Promise<NormalizedList<Control>> {
    const response = await this.http.request<unknown>(
      `/frameworks/${encodeURIComponent(id)}/controls`,
      { params }
    );
    return unwrapPaginatedResponse<Control>(response);
  }
}
