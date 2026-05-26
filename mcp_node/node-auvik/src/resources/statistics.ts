import type { HttpClient } from '../http.js';
import type { JsonApiResponse, Page, PaginationOptions } from '../types/json-api.js';
import type {
  StatisticsOptions,
  DeviceStatistics,
  InterfaceStatistics,
  ServiceStatistics,
  ComponentStatistics,
  SnmpPollerStatistics
} from '../types/statistics.js';
import { paginate } from '../pagination.js';

export class StatisticsResource {
  constructor(private getClient: () => Promise<HttpClient>) {}

  async getDeviceStatistics(options: StatisticsOptions & PaginationOptions): Promise<Page<DeviceStatistics>> {
    const { fromTime, thruTime, tenantId, pageSize, pageAfter, filters = {}, ...rest } = options;
    const params = {
      fromTime,
      thruTime,
      ...(tenantId && { tenantId }),
      ...filters,
      ...rest,
      ...(pageSize && { 'page[first]': pageSize }),
      ...(pageAfter && { 'page[after]': pageAfter }),
    };

    const client = await this.getClient();
    const response = await client.request<JsonApiResponse<DeviceStatistics>>('/stat/device', { params });
    const data = Array.isArray(response.data) ? response.data : [response.data];

    return {
      data: data.map(item => ({ id: item.id, type: item.type, ...item.attributes })),
      links: response.links || {},
      meta: response.meta || {},
    };
  }

  async *getDeviceStatisticsAll(options: StatisticsOptions & { filters?: Record<string, unknown> }): AsyncIterable<DeviceStatistics> {
    const { fromTime, thruTime, tenantId, filters = {}, ...rest } = options;
    const params = {
      fromTime,
      thruTime,
      ...(tenantId && { tenantId }),
      ...filters,
      ...rest,
    };

    const client = await this.getClient();
    for await (const page of paginate<DeviceStatistics>(client, '/stat/device', params)) {
      for (const stat of page.data) {
        yield stat;
      }
    }
  }

  async getInterfaceStatistics(options: StatisticsOptions & PaginationOptions): Promise<Page<InterfaceStatistics>> {
    const { fromTime, thruTime, tenantId, pageSize, pageAfter, filters = {}, ...rest } = options;
    const params = {
      fromTime,
      thruTime,
      ...(tenantId && { tenantId }),
      ...filters,
      ...rest,
      ...(pageSize && { 'page[first]': pageSize }),
      ...(pageAfter && { 'page[after]': pageAfter }),
    };

    const client = await this.getClient();
    const response = await client.request<JsonApiResponse<InterfaceStatistics>>('/stat/interface', { params });
    const data = Array.isArray(response.data) ? response.data : [response.data];

    return {
      data: data.map(item => ({ id: item.id, type: item.type, ...item.attributes })),
      links: response.links || {},
      meta: response.meta || {},
    };
  }

  async *getInterfaceStatisticsAll(options: StatisticsOptions & { filters?: Record<string, unknown> }): AsyncIterable<InterfaceStatistics> {
    const { fromTime, thruTime, tenantId, filters = {}, ...rest } = options;
    const params = {
      fromTime,
      thruTime,
      ...(tenantId && { tenantId }),
      ...filters,
      ...rest,
    };

    const client = await this.getClient();
    for await (const page of paginate<InterfaceStatistics>(client, '/stat/interface', params)) {
      for (const stat of page.data) {
        yield stat;
      }
    }
  }

  async getServiceStatistics(options: StatisticsOptions & PaginationOptions): Promise<Page<ServiceStatistics>> {
    const { fromTime, thruTime, tenantId, pageSize, pageAfter, filters = {}, ...rest } = options;
    const params = {
      fromTime,
      thruTime,
      ...(tenantId && { tenantId }),
      ...filters,
      ...rest,
      ...(pageSize && { 'page[first]': pageSize }),
      ...(pageAfter && { 'page[after]': pageAfter }),
    };

    const client = await this.getClient();
    const response = await client.request<JsonApiResponse<ServiceStatistics>>('/stat/service', { params });
    const data = Array.isArray(response.data) ? response.data : [response.data];

    return {
      data: data.map(item => ({ id: item.id, type: item.type, ...item.attributes })),
      links: response.links || {},
      meta: response.meta || {},
    };
  }

  async *getServiceStatisticsAll(options: StatisticsOptions & { filters?: Record<string, unknown> }): AsyncIterable<ServiceStatistics> {
    const { fromTime, thruTime, tenantId, filters = {}, ...rest } = options;
    const params = {
      fromTime,
      thruTime,
      ...(tenantId && { tenantId }),
      ...filters,
      ...rest,
    };

    const client = await this.getClient();
    for await (const page of paginate<ServiceStatistics>(client, '/stat/service', params)) {
      for (const stat of page.data) {
        yield stat;
      }
    }
  }

  async getComponentStatistics(options: StatisticsOptions & PaginationOptions): Promise<Page<ComponentStatistics>> {
    const { fromTime, thruTime, tenantId, pageSize, pageAfter, filters = {}, ...rest } = options;
    const params = {
      fromTime,
      thruTime,
      ...(tenantId && { tenantId }),
      ...filters,
      ...rest,
      ...(pageSize && { 'page[first]': pageSize }),
      ...(pageAfter && { 'page[after]': pageAfter }),
    };

    const client = await this.getClient();
    const response = await client.request<JsonApiResponse<ComponentStatistics>>('/stat/component', { params });
    const data = Array.isArray(response.data) ? response.data : [response.data];

    return {
      data: data.map(item => ({ id: item.id, type: item.type, ...item.attributes })),
      links: response.links || {},
      meta: response.meta || {},
    };
  }

  async *getComponentStatisticsAll(options: StatisticsOptions & { filters?: Record<string, unknown> }): AsyncIterable<ComponentStatistics> {
    const { fromTime, thruTime, tenantId, filters = {}, ...rest } = options;
    const params = {
      fromTime,
      thruTime,
      ...(tenantId && { tenantId }),
      ...filters,
      ...rest,
    };

    const client = await this.getClient();
    for await (const page of paginate<ComponentStatistics>(client, '/stat/component', params)) {
      for (const stat of page.data) {
        yield stat;
      }
    }
  }

  async getSnmpPollerStatistics(options: StatisticsOptions & PaginationOptions): Promise<Page<SnmpPollerStatistics>> {
    const { fromTime, thruTime, tenantId, pageSize, pageAfter, filters = {}, ...rest } = options;
    const params = {
      fromTime,
      thruTime,
      ...(tenantId && { tenantId }),
      ...filters,
      ...rest,
      ...(pageSize && { 'page[first]': pageSize }),
      ...(pageAfter && { 'page[after]': pageAfter }),
    };

    const client = await this.getClient();
    const response = await client.request<JsonApiResponse<SnmpPollerStatistics>>('/stat/snmpPoller', { params });
    const data = Array.isArray(response.data) ? response.data : [response.data];

    return {
      data: data.map(item => ({ id: item.id, type: item.type, ...item.attributes })),
      links: response.links || {},
      meta: response.meta || {},
    };
  }

  async *getSnmpPollerStatisticsAll(options: StatisticsOptions & { filters?: Record<string, unknown> }): AsyncIterable<SnmpPollerStatistics> {
    const { fromTime, thruTime, tenantId, filters = {}, ...rest } = options;
    const params = {
      fromTime,
      thruTime,
      ...(tenantId && { tenantId }),
      ...filters,
      ...rest,
    };

    const client = await this.getClient();
    for await (const page of paginate<SnmpPollerStatistics>(client, '/stat/snmpPoller', params)) {
      for (const stat of page.data) {
        yield stat;
      }
    }
  }
}