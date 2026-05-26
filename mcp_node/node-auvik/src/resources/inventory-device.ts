import type { HttpClient } from '../http.js';
import type { JsonApiResponse, Page, PaginationOptions } from '../types/json-api.js';
import type { DeviceInfo, DeviceDetails, DeviceWarranty, DeviceLifecycle } from '../types/devices.js';
import { paginate } from '../pagination.js';

export class InventoryDeviceResource {
  constructor(private getClient: () => Promise<HttpClient>) {}

  // Device Info (v2 preferred)
  async listInfo(options: PaginationOptions = {}): Promise<Page<DeviceInfo>> {
    const { pageSize, pageAfter, filters = {} } = options;
    const params = {
      ...filters,
      ...(pageSize && { 'page[first]': pageSize }),
      ...(pageAfter && { 'page[after]': pageAfter }),
    };

    const client = await this.getClient();
    const response = await client.request<JsonApiResponse<DeviceInfo>>('/inventory/device/info', { params });
    const data = Array.isArray(response.data) ? response.data : [response.data];

    return {
      data: data.map(item => ({ id: item.id, type: item.type, ...item.attributes })),
      links: response.links || {},
      meta: response.meta || {},
    };
  }

  async *listInfoAll(filters: Record<string, string> = {}): AsyncIterable<DeviceInfo> {
    const client = await this.getClient();
    for await (const page of paginate<DeviceInfo>(client, '/inventory/device/info', filters)) {
      for (const device of page.data) {
        yield device;
      }
    }
  }

  async getInfo(id: string): Promise<DeviceInfo> {
    const client = await this.getClient();
    const response = await client.request<JsonApiResponse<DeviceInfo>>(`/inventory/device/info/${id}`);
    const data = Array.isArray(response.data) ? response.data[0] : response.data;
    return { id: data.id, ...data.attributes } as any;
  }

  // Device Extended Details (v2)
  async listExtendedDetails(options: PaginationOptions = {}): Promise<Page<DeviceDetails>> {
    const { pageSize, pageAfter, filters = {} } = options;
    const params = {
      ...filters,
      ...(pageSize && { 'page[first]': pageSize }),
      ...(pageAfter && { 'page[after]': pageAfter }),
    };

    const client = await this.getClient();
    const response = await client.request<JsonApiResponse<DeviceDetails>>('/inventory/device/info/extended-details', { params });
    const data = Array.isArray(response.data) ? response.data : [response.data];

    return {
      data: data.map(item => ({ id: item.id, type: item.type, ...item.attributes })),
      links: response.links || {},
      meta: response.meta || {},
    };
  }

  async *listExtendedDetailsAll(filters: Record<string, string> = {}): AsyncIterable<DeviceDetails> {
    const client = await this.getClient();
    for await (const page of paginate<DeviceDetails>(client, '/inventory/device/info/extended-details', filters)) {
      for (const device of page.data) {
        yield device;
      }
    }
  }

  // Device Details (v1 fallback)
  async listDetails(options: PaginationOptions = {}): Promise<Page<DeviceDetails>> {
    const { pageSize, pageAfter, filters = {} } = options;
    const params = {
      ...filters,
      ...(pageSize && { 'page[first]': pageSize }),
      ...(pageAfter && { 'page[after]': pageAfter }),
    };

    const client = await this.getClient();
    const response = await client.request<JsonApiResponse<DeviceDetails>>('/inventory/device/details', { params });
    const data = Array.isArray(response.data) ? response.data : [response.data];

    return {
      data: data.map(item => ({ id: item.id, type: item.type, ...item.attributes })),
      links: response.links || {},
      meta: response.meta || {},
    };
  }

  async *listDetailsAll(filters: Record<string, string> = {}): AsyncIterable<DeviceDetails> {
    const client = await this.getClient();
    for await (const page of paginate<DeviceDetails>(client, '/inventory/device/details', filters)) {
      for (const device of page.data) {
        yield device;
      }
    }
  }

  async getDetails(id: string): Promise<DeviceDetails> {
    const client = await this.getClient();
    const response = await client.request<JsonApiResponse<DeviceDetails>>(`/inventory/device/details/${id}`);
    const data = Array.isArray(response.data) ? response.data[0] : response.data;
    return { id: data.id, ...data.attributes } as any;
  }

  // Device Warranty
  async listWarranty(options: PaginationOptions = {}): Promise<Page<DeviceWarranty & { deviceId: string }>> {
    const { pageSize, pageAfter, filters = {} } = options;
    const params = {
      ...filters,
      ...(pageSize && { 'page[first]': pageSize }),
      ...(pageAfter && { 'page[after]': pageAfter }),
    };

    const client = await this.getClient();
    const response = await client.request<JsonApiResponse<DeviceWarranty>>('/inventory/device/warranty', { params });
    const data = Array.isArray(response.data) ? response.data : [response.data];

    return {
      data: data.map(item => ({ deviceId: item.id, id: item.id, ...item.attributes })) as (DeviceWarranty & { deviceId: string })[],
      links: response.links || {},
      meta: response.meta || {},
    };
  }

  async *listWarrantyAll(filters: Record<string, string> = {}): AsyncIterable<DeviceWarranty & { deviceId: string }> {
    const client = await this.getClient();
    for await (const page of paginate<DeviceWarranty>(client, '/inventory/device/warranty', filters)) {
      for (const warranty of page.data) {
        yield { ...warranty, deviceId: warranty.id };
      }
    }
  }

  async getWarranty(id: string): Promise<DeviceWarranty & { deviceId: string }> {
    const client = await this.getClient();
    const response = await client.request<JsonApiResponse<DeviceWarranty>>(`/inventory/device/warranty/${id}`);
    const data = Array.isArray(response.data) ? response.data[0] : response.data;
    return { deviceId: data.id, id: data.id, ...data.attributes } as DeviceWarranty & { deviceId: string };
  }

  // Device Lifecycle
  async listLifecycle(options: PaginationOptions = {}): Promise<Page<DeviceLifecycle & { deviceId: string }>> {
    const { pageSize, pageAfter, filters = {} } = options;
    const params = {
      ...filters,
      ...(pageSize && { 'page[first]': pageSize }),
      ...(pageAfter && { 'page[after]': pageAfter }),
    };

    const client = await this.getClient();
    const response = await client.request<JsonApiResponse<DeviceLifecycle>>('/inventory/device/lifecycle', { params });
    const data = Array.isArray(response.data) ? response.data : [response.data];

    return {
      data: data.map(item => ({ deviceId: item.id, id: item.id, ...item.attributes })) as (DeviceLifecycle & { deviceId: string })[],
      links: response.links || {},
      meta: response.meta || {},
    };
  }

  async *listLifecycleAll(filters: Record<string, string> = {}): AsyncIterable<DeviceLifecycle & { deviceId: string }> {
    const client = await this.getClient();
    for await (const page of paginate<DeviceLifecycle>(client, '/inventory/device/lifecycle', filters)) {
      for (const lifecycle of page.data) {
        yield { ...lifecycle, deviceId: lifecycle.id };
      }
    }
  }

  async getLifecycle(id: string): Promise<DeviceLifecycle & { deviceId: string }> {
    const client = await this.getClient();
    const response = await client.request<JsonApiResponse<DeviceLifecycle>>(`/inventory/device/lifecycle/${id}`);
    const data = Array.isArray(response.data) ? response.data[0] : response.data;
    return { deviceId: data.id, id: data.id, ...data.attributes } as DeviceLifecycle & { deviceId: string };
  }
}