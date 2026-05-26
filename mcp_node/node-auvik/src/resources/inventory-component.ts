import type { HttpClient } from '../http.js';
import type { JsonApiResponse, Page, PaginationOptions } from '../types/json-api.js';
import type { ComponentInfo } from '../types/component.js';
import { paginate } from '../pagination.js';

export class InventoryComponentResource {
  constructor(private getClient: () => Promise<HttpClient>) {}

  async listInfo(options: PaginationOptions = {}): Promise<Page<ComponentInfo>> {
    const { pageSize, pageAfter, filters = {} } = options;
    const params = {
      ...filters,
      ...(pageSize && { 'page[first]': pageSize }),
      ...(pageAfter && { 'page[after]': pageAfter }),
    };

    const client = await this.getClient();
    const response = await client.request<JsonApiResponse<ComponentInfo>>('/inventory/component/info', { params });
    const data = Array.isArray(response.data) ? response.data : [response.data];

    return {
      data: data.map(item => ({ id: item.id, type: item.type, ...item.attributes })),
      links: response.links || {},
      meta: response.meta || {},
    };
  }

  async *listInfoAll(filters: Record<string, string> = {}): AsyncIterable<ComponentInfo> {
    const client = await this.getClient();
    for await (const page of paginate<ComponentInfo>(client, '/inventory/component/info', filters)) {
      for (const component of page.data) {
        yield component;
      }
    }
  }
}