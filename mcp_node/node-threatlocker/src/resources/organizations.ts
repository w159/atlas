import type { HttpClient } from '../http.js';
import type { Organization, OrganizationListParams, AuthKey, PaginatedResponse } from '../types/index.js';
import { buildSearchBody } from '../types/index.js';
import { unwrapPaginatedResponse } from '../pagination.js';

export class OrganizationsResource {
  constructor(private readonly http: HttpClient) {}

  async listChildren(params: OrganizationListParams = {}): Promise<PaginatedResponse<Organization>> {
    const body = buildSearchBody(params);
    const response = await this.http.request<any>('/Organization/OrganizationGetChildOrganizationsByParameters', {
      method: 'POST',
      body,
    });
    return unwrapPaginatedResponse<Organization>(response, body.pageNumber, body.pageSize);
  }

  async getAuthKey(): Promise<AuthKey> {
    return this.http.request<AuthKey>('/Organization/OrganizationGetAuthKeyById');
  }

  async listForMoveComputers(): Promise<Organization[]> {
    const response = await this.http.request<{ organizations?: Organization[] }>('/Organization/OrganizationGetForMoveComputers');
    return response.organizations || [];
  }
}