import type { HttpClient } from '../http.js';
import type { JsonApiResponse, Page, PaginationOptions } from '../types/json-api.js';
import type { BillingUsageClient, BillingUsageDevice } from '../types/billing.js';
import { paginate } from '../pagination.js';

export class BillingResource {
  constructor(private getClient: () => Promise<HttpClient>) {}

  async listUsageClient(options: PaginationOptions = {}): Promise<Page<BillingUsageClient>> {
    const { pageSize, pageAfter, filters = {} } = options;
    const params = {
      ...filters,
      ...(pageSize && { 'page[first]': pageSize }),
      ...(pageAfter && { 'page[after]': pageAfter }),
    };

    const client = await this.getClient();
    const response = await client.request<JsonApiResponse<BillingUsageClient>>('/billing/usage/client', { params });
    const data = Array.isArray(response.data) ? response.data : [response.data];

    return {
      data: data.map(item => ({ id: item.id, type: item.type, ...item.attributes })),
      links: response.links || {},
      meta: response.meta || {},
    };
  }

  async *listUsageClientAll(filters: Record<string, string> = {}): AsyncIterable<BillingUsageClient> {
    const client = await this.getClient();
    for await (const page of paginate<BillingUsageClient>(client, '/billing/usage/client', filters)) {
      for (const usage of page.data) {
        yield usage;
      }
    }
  }

  async listUsageDevice(options: PaginationOptions = {}): Promise<Page<BillingUsageDevice>> {
    const { pageSize, pageAfter, filters = {} } = options;
    const params = {
      ...filters,
      ...(pageSize && { 'page[first]': pageSize }),
      ...(pageAfter && { 'page[after]': pageAfter }),
    };

    const client = await this.getClient();
    const response = await client.request<JsonApiResponse<BillingUsageDevice>>('/billing/usage/device', { params });
    const data = Array.isArray(response.data) ? response.data : [response.data];

    return {
      data: data.map(item => ({ id: item.id, type: item.type, ...item.attributes })),
      links: response.links || {},
      meta: response.meta || {},
    };
  }

  async *listUsageDeviceAll(filters: Record<string, string> = {}): AsyncIterable<BillingUsageDevice> {
    const client = await this.getClient();
    for await (const page of paginate<BillingUsageDevice>(client, '/billing/usage/device', filters)) {
      for (const usage of page.data) {
        yield usage;
      }
    }
  }
}