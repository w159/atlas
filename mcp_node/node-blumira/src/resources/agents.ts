import type { HttpClient } from '../http.js';
import type {
  AgentDevice,
  AgentKey,
  PaginatedResponse,
  PaginationParams,
} from '../types/index.js';

export class AgentsResource {
  constructor(private readonly http: HttpClient) {}

  // ── Devices ──

  async listDevices(params?: PaginationParams): Promise<PaginatedResponse<AgentDevice>> {
    return this.http.request<PaginatedResponse<AgentDevice>>('/org/agents/devices', {
      params: params as Record<string, unknown>,
    });
  }

  async getDevice(deviceId: string): Promise<AgentDevice> {
    return this.http.request<AgentDevice>(`/org/agents/devices/${deviceId}`);
  }

  // ── Keys ──

  async listKeys(params?: PaginationParams): Promise<PaginatedResponse<AgentKey>> {
    return this.http.request<PaginatedResponse<AgentKey>>('/org/agents/keys', {
      params: params as Record<string, unknown>,
    });
  }

  async getKey(keyId: string): Promise<AgentKey> {
    return this.http.request<AgentKey>(`/org/agents/keys/${keyId}`);
  }
}
