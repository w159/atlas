import { buildBasicAuth } from './auth.js';
import { AuvikError, AuvikAuthError, AuvikRateLimitError, AuvikNotFoundError, AuvikServerError } from './errors.js';

export interface HttpClientConfig {
  baseUrl: string;
  username: string;
  apiKey: string;
  timeout: number;
  maxRetries: number;
  fetchImpl: typeof fetch;
}

export interface RequestOptions {
  method?: string;
  params?: Record<string, unknown>;
  body?: unknown;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly authHeader: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly fetchImpl: typeof fetch;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl;
    this.authHeader = buildBasicAuth(config.username, config.apiKey);
    this.timeout = config.timeout;
    this.maxRetries = config.maxRetries;
    this.fetchImpl = config.fetchImpl;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', params, body } = options;

    let url = `${this.baseUrl}${path}`;
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            for (const v of value) {
              searchParams.append(`${key}[]`, String(v));
            }
          } else {
            searchParams.set(key, String(value));
          }
        }
      }
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      if (attempt > 0) {
        const delay = Math.min(1000 * (2 ** (attempt - 1)) + Math.random() * 1000, 300_000);
        await new Promise(r => setTimeout(r, delay));
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const headers: Record<string, string> = {
        'Authorization': this.authHeader,
        'Accept': 'application/json',
      };

      if (body) {
        headers['Content-Type'] = 'application/json';
      }

      let response: Response;
      try {
        response = await this.fetchImpl(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
      } catch (err) {
        clearTimeout(timeoutId);
        lastError = err as Error;
        if (lastError.name === 'AbortError') {
          lastError = new Error(`Request timeout after ${this.timeout}ms`);
        }
        continue;
      }

      if (response.ok) {
        if (response.status === 204) return {} as T;
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          return response.json() as Promise<T>;
        }
        return {} as T;
      }

      const requestId = response.headers.get('x-request-id') || response.headers.get('x-amzn-requestid') || undefined;
      let responseBody: unknown;
      const rawText = await response.text().catch(() => '');

      try {
        responseBody = JSON.parse(rawText);
      } catch {
        responseBody = rawText || 'No response body';
      }

      const errorMessage = this.buildErrorMessage(response.status, responseBody, requestId);

      switch (response.status) {
        case 401:
          throw new AuvikAuthError(errorMessage, responseBody, requestId);

        case 403: {
          // Check if this is a rate limit error by examining the response body
          const isRateLimit = typeof responseBody === 'string'
            ? responseBody.toLowerCase().includes('rate limit')
            : typeof responseBody === 'object' && responseBody
            ? JSON.stringify(responseBody).toLowerCase().includes('rate limit')
            : false;

          if (isRateLimit && attempt < this.maxRetries) {
            // Exponential backoff with jitter for rate limits
            const backoffMs = Math.min(
              (1000 * (2 ** attempt)) + Math.random() * 5000,
              300_000 // Max 5 minutes
            );
            await new Promise(r => setTimeout(r, backoffMs));
            continue;
          }

          if (isRateLimit) {
            throw new AuvikRateLimitError(errorMessage, 300, responseBody, requestId);
          }

          throw new AuvikAuthError(errorMessage, responseBody, requestId);
        }

        case 404:
          throw new AuvikNotFoundError(errorMessage, responseBody, requestId);

        default:
          if (response.status >= 500) {
            lastError = new AuvikServerError(errorMessage, response.status, responseBody, requestId);
            if (attempt < this.maxRetries) continue;
            throw lastError;
          }

          throw new AuvikError(errorMessage, response.status, responseBody, requestId);
      }
    }

    throw lastError || new AuvikError('Request failed after retries');
  }

  private buildErrorMessage(status: number, responseBody: unknown, requestId?: string): string {
    let message = `HTTP ${status}`;

    if (typeof responseBody === 'string' && responseBody) {
      message += `: ${responseBody.substring(0, 200)}`;
    } else if (typeof responseBody === 'object' && responseBody) {
      const bodyStr = JSON.stringify(responseBody);
      if (bodyStr.length > 10) {
        message += `: ${bodyStr.substring(0, 200)}`;
      }
    }

    if (requestId) {
      message += ` (Request ID: ${requestId})`;
    }

    return message;
  }
}