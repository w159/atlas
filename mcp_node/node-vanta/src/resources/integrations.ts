import type { HttpClient } from '../http.js';
import type {
  Integration,
  IntegrationResource as IntegrationResourceObj,
  IntegrationResourceKind,
  ListParams,
  NormalizedList,
} from '../types/index.js';
import { unwrapPaginatedResponse } from '../pagination.js';

export class IntegrationsResource {
  constructor(private readonly http: HttpClient) {}

  async list(params: ListParams = {}): Promise<NormalizedList<Integration>> {
    const response = await this.http.request<unknown>('/integrations', { params });
    return unwrapPaginatedResponse<Integration>(response);
  }

  async get(connectionId: string): Promise<Integration> {
    return this.http.request<Integration>(
      `/integrations/${encodeURIComponent(connectionId)}`
    );
  }

  async listResourceKinds(
    connectionId: string,
    params: ListParams = {}
  ): Promise<NormalizedList<IntegrationResourceKind>> {
    const response = await this.http.request<unknown>(
      `/integrations/${encodeURIComponent(connectionId)}/resource-kinds`,
      { params }
    );
    return unwrapPaginatedResponse<IntegrationResourceKind>(response);
  }

  async listResources(
    connectionId: string,
    resourceKind: string,
    params: ListParams = {}
  ): Promise<NormalizedList<IntegrationResourceObj>> {
    const response = await this.http.request<unknown>(
      `/integrations/${encodeURIComponent(connectionId)}/resource-kinds/${encodeURIComponent(resourceKind)}/resources`,
      { params }
    );
    return unwrapPaginatedResponse<IntegrationResourceObj>(response);
  }

  async getResource(resourceId: string): Promise<IntegrationResourceObj> {
    return this.http.request<IntegrationResourceObj>(
      `/integrations/resources/${encodeURIComponent(resourceId)}`
    );
  }
}
