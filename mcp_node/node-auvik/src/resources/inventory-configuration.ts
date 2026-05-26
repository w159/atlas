import type { HttpClient } from '../http.js';
import type { JsonApiResponse, Page, PaginationOptions } from '../types/json-api.js';
import type { ConfigurationInfo } from '../types/configuration.js';
import { paginate } from '../pagination.js';
import { mapJsonApiResourceArray } from '../json-api-mapper.js';

export class InventoryConfigurationResource {
  constructor(private getClient: () => Promise<HttpClient>) {}

  async list(options: PaginationOptions = {}): Promise<Page<ConfigurationInfo>> {
    const { pageSize, pageAfter, filters = {} } = options;
    const params = {
      ...filters,
      ...(pageSize && { 'page[first]': pageSize }),
      ...(pageAfter && { 'page[after]': pageAfter }),
    };

    const client = await this.getClient();
    const response = await client.request<JsonApiResponse<ConfigurationInfo>>('/inventory/configuration', { params });

    return {
      data: mapJsonApiResourceArray(response.data) as ConfigurationInfo[],
      links: response.links || {},
      meta: response.meta || {},
    };
  }

  async *listAll(filters: Record<string, string> = {}): AsyncIterable<ConfigurationInfo> {
    const client = await this.getClient();
    for await (const page of paginate<ConfigurationInfo>(client, '/inventory/configuration', filters)) {
      for (const config of page.data) {
        yield config;
      }
    }
  }

  async get(id: string): Promise<ConfigurationInfo> {
    const client = await this.getClient();
    const response = await client.request<JsonApiResponse<ConfigurationInfo>>(`/inventory/configuration/${id}`);
    const data = Array.isArray(response.data) ? response.data[0] : response.data;
    return { id: data.id, ...data.attributes } as ConfigurationInfo;
  }
}