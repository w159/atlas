import type { HttpClient } from '../http.js';
import type { Test, TestListParams, NormalizedList } from '../types/index.js';
import { unwrapPaginatedResponse } from '../pagination.js';

export class TestsResource {
  constructor(private readonly http: HttpClient) {}

  async list(params: TestListParams = {}): Promise<NormalizedList<Test>> {
    const response = await this.http.request<unknown>('/tests', { params });
    return unwrapPaginatedResponse<Test>(response);
  }

  async get(id: string): Promise<Test> {
    return this.http.request<Test>(`/tests/${encodeURIComponent(id)}`);
  }
}
