import type { HttpClient } from '../http.js';
import type { Vendor, ListParams, NormalizedList } from '../types/index.js';
import { unwrapPaginatedResponse } from '../pagination.js';

export class VendorsResource {
  constructor(private readonly http: HttpClient) {}

  async list(params: ListParams = {}): Promise<NormalizedList<Vendor>> {
    const response = await this.http.request<unknown>('/vendors', { params });
    return unwrapPaginatedResponse<Vendor>(response);
  }

  async get(id: string): Promise<Vendor> {
    return this.http.request<Vendor>(`/vendors/${encodeURIComponent(id)}`);
  }
}
