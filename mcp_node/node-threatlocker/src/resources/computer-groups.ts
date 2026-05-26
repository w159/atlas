import type { HttpClient } from '../http.js';
import type { ComputerGroup, ComputerGroupListParams, ComputerGroupDropdownParams } from '../types/index.js';

export class ComputerGroupsResource {
  constructor(private readonly http: HttpClient) {}

  async list(params: ComputerGroupListParams = {}): Promise<ComputerGroup[]> {
    const response = await this.http.request<{ groups?: ComputerGroup[] }>('/ComputerGroup/ComputerGroupGetGroupAndComputer', {
      params: params as Record<string, unknown>,
    });
    return response.groups || [];
  }

  async getDropdown(params: ComputerGroupDropdownParams = {}): Promise<ComputerGroup[]> {
    const response = await this.http.request<{ groups?: ComputerGroup[] }>('/ComputerGroup/ComputerGroupGetDropdownByOrganizationId', {
      params: params as Record<string, unknown>,
    });
    return response.groups || [];
  }
}