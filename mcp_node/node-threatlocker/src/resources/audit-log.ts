import type { HttpClient } from '../http.js';
import type { AuditLogEntry, AuditLogSearchParams, PaginatedResponse } from '../types/index.js';
import { buildSearchBody } from '../types/index.js';
import { unwrapPaginatedResponse } from '../pagination.js';

export class AuditLogResource {
  constructor(private readonly http: HttpClient) {}

  async search(params: AuditLogSearchParams = {}): Promise<PaginatedResponse<AuditLogEntry>> {
    const body = buildSearchBody(params);
    const response = await this.http.request<any>('/ActionLog/ActionLogGetByParametersV2', {
      method: 'POST',
      body,
    });
    return unwrapPaginatedResponse<AuditLogEntry>(response, body.pageNumber, body.pageSize);
  }

  async get(id: number): Promise<AuditLogEntry> {
    return this.http.request<AuditLogEntry>('/ActionLog/ActionLogGetByIdV2', {
      params: { actionLogId: id },
    });
  }

  async getFileHistory(fullPath: string): Promise<AuditLogEntry[]> {
    const response = await this.http.request<{ logs?: AuditLogEntry[] }>('/ActionLog/ActionLogGetAllForFileHistoryV2', {
      params: { fullPath },
    });
    return response.logs || [];
  }
}