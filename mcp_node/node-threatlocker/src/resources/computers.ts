import type { HttpClient } from '../http.js';
import type { Computer, ComputerListParams, ComputerCheckin, ComputerCheckinParams, PaginatedResponse } from '../types/index.js';
import { buildSearchBody } from '../types/index.js';
import { unwrapPaginatedResponse } from '../pagination.js';

export class ComputersResource {
  constructor(private readonly http: HttpClient) {}

  async list(params: ComputerListParams = {}): Promise<PaginatedResponse<Computer>> {
    const body = buildSearchBody(params);
    const response = await this.http.request<any>('/Computer/ComputerGetByAllParameters', {
      method: 'POST',
      body,
    });
    return unwrapPaginatedResponse<Computer>(response, body.pageNumber, body.pageSize);
  }

  async get(id: number): Promise<Computer> {
    return this.http.request<Computer>('/Computer/ComputerGetForEditById', {
      params: { computerId: id },
    });
  }

  async getCheckins(params: ComputerCheckinParams = {}): Promise<PaginatedResponse<ComputerCheckin>> {
    const body = buildSearchBody(params);
    const response = await this.http.request<any>('/ComputerCheckin/ComputerCheckinGetByParameters', {
      method: 'POST',
      body,
    });
    return unwrapPaginatedResponse<ComputerCheckin>(response, body.pageNumber, body.pageSize);
  }
}