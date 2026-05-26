import type { HttpClient } from '../http.js';
import type { Control, ControlListParams, NormalizedList } from '../types/index.js';
import { unwrapPaginatedResponse } from '../pagination.js';

export class ControlsResource {
  constructor(private readonly http: HttpClient) {}

  async list(params: ControlListParams = {}): Promise<NormalizedList<Control>> {
    const response = await this.http.request<unknown>('/controls', { params });
    return unwrapPaginatedResponse<Control>(response);
  }

  async get(id: string): Promise<Control> {
    return this.http.request<Control>(`/controls/${encodeURIComponent(id)}`);
  }
}
