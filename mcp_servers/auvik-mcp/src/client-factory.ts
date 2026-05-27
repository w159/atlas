import type { AuvikCredentials } from './credentials.js';

// JSON:API response shapes
export interface JsonApiResource {
  type: string;
  id: string;
  attributes?: Record<string, unknown>;
  relationships?: Record<string, unknown>;
  links?: Record<string, string>;
}

export interface JsonApiResponse<T = JsonApiResource | JsonApiResource[]> {
  data: T;
  included?: JsonApiResource[];
  links?: { self?: string; first?: string; next?: string; prev?: string };
  meta?: Record<string, unknown>;
}

export interface AuvikApiError extends Error {
  status: number;
  body: unknown;
  retryAfter?: number;
}

function makeError(status: number, body: unknown, retryAfter?: number): AuvikApiError {
  const detail =
    body && typeof body === 'object' && 'errors' in body && Array.isArray((body as any).errors)
      ? (body as any).errors.map((e: any) => e.title || e.detail || JSON.stringify(e)).join('; ')
      : typeof body === 'string'
        ? body
        : JSON.stringify(body);
  const err = new Error(`Auvik API ${status}: ${detail}`) as AuvikApiError;
  err.status = status;
  err.body = body;
  if (retryAfter !== undefined) err.retryAfter = retryAfter;
  return err;
}

// Build query string preserving JSON:API bracket syntax (filter[x]=y, page[first]=N).
// URLSearchParams percent-encodes [ and ] which Auvik rejects.
function buildQuery(params: Record<string, unknown> | undefined): string {
  if (!params) return '';
  const pairs: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    const encKey = key.replace(/\[/g, '%5B').replace(/\]/g, '%5D');
    if (Array.isArray(value)) {
      pairs.push(`${encKey}=${encodeURIComponent(value.join(','))}`);
    } else {
      pairs.push(`${encKey}=${encodeURIComponent(String(value))}`);
    }
  }
  return pairs.length ? `?${pairs.join('&')}` : '';
}

// Translate flat tool args ({ filter_deviceType: "x", page: 1, pageSize: 50 })
// to JSON:API query keys ({ "filter[deviceType]": "x", "page[first]": 50 }).
function toJsonApiParams(input: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!input) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined || v === null || v === '') continue;
    if (k.startsWith('filter_')) {
      out[`filter[${k.slice('filter_'.length)}]`] = v;
    } else if (k === 'pageSize') {
      out['page[first]'] = v;
    } else if (k === 'pageAfter') {
      out['page[after]'] = v;
    } else if (k === 'page') {
      // legacy: numeric page indexes aren't supported by Auvik; ignore
      continue;
    } else {
      out[k] = v;
    }
  }
  return out;
}

class AuvikHttpClient {
  private region: string;
  private readonly auth: string;
  private readonly maxRetries = 4;

  constructor(credentials: AuvikCredentials) {
    this.region = credentials.region || 'us1';
    this.auth = Buffer.from(`${credentials.username}:${credentials.apiKey}`).toString('base64');
  }

  private baseUrl(): string {
    return `https://auvikapi.${this.region}.my.auvik.com/v1`;
  }

  async request<T = JsonApiResponse>(path: string, params?: Record<string, unknown>): Promise<T> {
    const apiParams = toJsonApiParams(params);
    let attempt = 0;
    let url = `${this.baseUrl()}${path}${buildQuery(apiParams)}`;

    while (true) {
      const resp = await fetch(url, {
        method: 'GET',
        redirect: 'manual',
        headers: {
          Authorization: `Basic ${this.auth}`,
          Accept: 'application/json',
        },
      });

      // Region redirect — re-target and try again (preserves credentials).
      if (resp.status === 308 || resp.status === 301) {
        const location = resp.headers.get('location');
        if (!location) throw makeError(resp.status, await resp.text());
        const match = location.match(/auvikapi\.([a-z0-9]+)\.my\.auvik\.com/);
        if (match) this.region = match[1];
        url = location;
        continue;
      }

      if (resp.status === 429) {
        const retryAfter = parseInt(resp.headers.get('retry-after') || '0', 10);
        if (attempt < this.maxRetries) {
          const backoff = retryAfter > 0 ? retryAfter * 1000 : Math.min(60_000, 1000 * 2 ** attempt + Math.random() * 250);
          await new Promise((r) => setTimeout(r, backoff));
          attempt++;
          continue;
        }
        throw makeError(429, await resp.json().catch(() => null), retryAfter || undefined);
      }

      // Auvik returns application/json AND application/vnd.api+json — try JSON first either way.
      const contentType = resp.headers.get('content-type') || '';
      const looksJson = contentType.includes('json');
      let body: unknown;
      if (looksJson) {
        body = await resp.json().catch(() => null);
      } else {
        const text = await resp.text();
        try { body = text ? JSON.parse(text) : null; } catch { body = text; }
      }

      if (!resp.ok) {
        throw makeError(resp.status, body);
      }

      // Empty-body 200 (e.g. /authentication/verify) → synthesize a shape
      if (body === null || body === '') {
        return { data: null } as unknown as T;
      }
      return body as T;
    }
  }

  // Followable JSON:API navigation — used by auvik_navigate.
  async followUrl<T = JsonApiResponse>(absoluteUrl: string): Promise<T> {
    // Validate it's an Auvik API URL
    if (!/^https:\/\/auvikapi\.[a-z0-9]+\.my\.auvik\.com\/v1\//.test(absoluteUrl)) {
      throw new Error(`Refusing to follow non-Auvik URL: ${absoluteUrl}`);
    }
    const u = new URL(absoluteUrl);
    return this.request<T>(u.pathname.replace(/^\/v1/, '') + u.search, undefined);
  }
}

export interface AuvikClient {
  verify(): Promise<JsonApiResponse | { data: null }>;
  followUrl(absoluteUrl: string): Promise<JsonApiResponse>;

  tenants: {
    list(params?: Record<string, unknown>): Promise<JsonApiResponse>;
    detail(domainPrefix: string): Promise<JsonApiResponse>;
  };

  devices: {
    list(params?: Record<string, unknown>): Promise<JsonApiResponse>;
    get(deviceId: string): Promise<JsonApiResponse>;
    listDetail(params?: Record<string, unknown>): Promise<JsonApiResponse>;
    getDetail(deviceId: string): Promise<JsonApiResponse>;
    listWarranty(params?: Record<string, unknown>): Promise<JsonApiResponse>;
    listLifecycle(params?: Record<string, unknown>): Promise<JsonApiResponse>;
  };

  interfaces: {
    list(params?: Record<string, unknown>): Promise<JsonApiResponse>;
    get(interfaceId: string): Promise<JsonApiResponse>;
  };

  networks: {
    list(params?: Record<string, unknown>): Promise<JsonApiResponse>;
    get(networkId: string): Promise<JsonApiResponse>;
    listDetail(params?: Record<string, unknown>): Promise<JsonApiResponse>;
  };

  entities: {
    listNotes(params?: Record<string, unknown>): Promise<JsonApiResponse>;
    listAudits(params?: Record<string, unknown>): Promise<JsonApiResponse>;
  };

  configurations: {
    list(params?: Record<string, unknown>): Promise<JsonApiResponse>;
    get(configurationId: string): Promise<JsonApiResponse>;
  };

  components: {
    list(params?: Record<string, unknown>): Promise<JsonApiResponse>;
  };

  alerts: {
    list(params?: Record<string, unknown>): Promise<JsonApiResponse>;
    get(alertId: string): Promise<JsonApiResponse>;
  };

  statistics: {
    device(statId: string, params: Record<string, unknown>): Promise<JsonApiResponse>;
    interface(statId: string, params: Record<string, unknown>): Promise<JsonApiResponse>;
  };

  billing: {
    clientUsage(params: Record<string, unknown>): Promise<JsonApiResponse>;
  };
}

class RealAuvikClient implements AuvikClient {
  private http: AuvikHttpClient;
  constructor(credentials: AuvikCredentials) {
    this.http = new AuvikHttpClient(credentials);
  }

  verify() {
    return this.http.request('/authentication/verify');
  }

  followUrl(absoluteUrl: string) {
    return this.http.followUrl(absoluteUrl);
  }

  tenants = {
    list: (params?: Record<string, unknown>) => this.http.request('/tenants', params),
    detail: (domainPrefix: string) =>
      this.http.request('/tenants/detail', { tenantDomainPrefix: domainPrefix }),
  };

  devices = {
    list: (params?: Record<string, unknown>) => this.http.request('/inventory/device/info', params),
    get: (id: string) => this.http.request(`/inventory/device/info/${encodeURIComponent(id)}`),
    listDetail: (params?: Record<string, unknown>) =>
      this.http.request('/inventory/device/detail', params),
    getDetail: (id: string) =>
      this.http.request(`/inventory/device/detail/${encodeURIComponent(id)}`),
    listWarranty: (params?: Record<string, unknown>) =>
      this.http.request('/inventory/device/warranty', params),
    listLifecycle: (params?: Record<string, unknown>) =>
      this.http.request('/inventory/device/lifecycle', params),
  };

  interfaces = {
    list: (params?: Record<string, unknown>) => this.http.request('/inventory/interface/info', params),
    get: (id: string) => this.http.request(`/inventory/interface/info/${encodeURIComponent(id)}`),
  };

  networks = {
    list: (params?: Record<string, unknown>) => this.http.request('/inventory/network/info', params),
    get: (id: string) => this.http.request(`/inventory/network/info/${encodeURIComponent(id)}`),
    listDetail: (params?: Record<string, unknown>) =>
      this.http.request('/inventory/network/detail', params),
  };

  entities = {
    listNotes: (params?: Record<string, unknown>) => this.http.request('/inventory/entity/note', params),
    listAudits: (params?: Record<string, unknown>) => this.http.request('/inventory/entity/audit', params),
  };

  configurations = {
    list: (params?: Record<string, unknown>) => this.http.request('/inventory/configuration', params),
    get: (id: string) => this.http.request(`/inventory/configuration/${encodeURIComponent(id)}`),
  };

  components = {
    list: (params?: Record<string, unknown>) => this.http.request('/inventory/component/info', params),
  };

  alerts = {
    list: (params?: Record<string, unknown>) => this.http.request('/alert/history/info', params),
    get: (id: string) => this.http.request(`/alert/history/info/${encodeURIComponent(id)}`),
  };

  statistics = {
    device: (statId: string, params: Record<string, unknown>) =>
      this.http.request(`/stat/device/${encodeURIComponent(statId)}`, params),
    interface: (statId: string, params: Record<string, unknown>) =>
      this.http.request(`/stat/interface/${encodeURIComponent(statId)}`, params),
  };

  billing = {
    clientUsage: (params: Record<string, unknown>) =>
      this.http.request('/billing/usage/client', params),
  };
}

export function createAuvikClient(credentials: AuvikCredentials): AuvikClient {
  return new RealAuvikClient(credentials);
}
