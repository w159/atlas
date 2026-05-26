import { RateLimiter } from './rate-limiter.js';
import { PaylocityAuthManager } from './auth.js';
import {
  ServiceError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ValidationError,
  extractErrorDetails,
} from './errors.js';

export interface HttpClientConfig {
  baseUrl: string;
  auth: PaylocityAuthManager;
  maxRetries: number;
  rateLimiter: RateLimiter;
}

export interface RequestOptions {
  method?: string;
  params?: Record<string, unknown>;
  body?: unknown;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly auth: PaylocityAuthManager;
  private readonly maxRetries: number;
  private readonly rateLimiter: RateLimiter;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl;
    this.auth = config.auth;
    this.maxRetries = config.maxRetries;
    this.rateLimiter = config.rateLimiter;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', params, body } = options;

    let url = `${this.baseUrl}${path}`;
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === '') continue;
        if (Array.isArray(value)) {
          for (const v of value) searchParams.append(key, String(v));
        } else {
          searchParams.set(key, String(value));
        }
      }
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    let lastError: Error | null = null;
    let didRefreshAuth = false;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      if (attempt > 0) {
        // Exponential backoff with jitter, capped at 60s.
        const base = Math.min(1000 * 2 ** (attempt - 1), 60_000);
        const jitter = Math.floor(Math.random() * 250);
        await new Promise(r => setTimeout(r, base + jitter));
      }

      await this.rateLimiter.acquire();

      const token = await this.auth.getAccessToken();
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      };
      if (body) headers['Content-Type'] = 'application/json';

      let response: Response;
      try {
        response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });
      } catch (err) {
        lastError = err as Error;
        continue;
      }

      if (response.ok) {
        if (response.status === 204) return {} as T;
        const ct = response.headers.get('content-type');
        if (ct?.includes('application/json')) return response.json() as Promise<T>;
        return {} as T;
      }

      let responseBody: unknown;
      const rawText = await response.text();
      try {
        responseBody = JSON.parse(rawText);
      } catch {
        responseBody = rawText;
      }

      const fallback = `Paylocity HTTP ${response.status} ${response.statusText || ''}`.trim();
      const details = extractErrorDetails(responseBody, fallback);

      switch (response.status) {
        case 400:
          throw new ValidationError(
            details.message,
            details.validationErrors || [],
            responseBody,
            details.traceId
          );
        case 401:
          if (!didRefreshAuth) {
            didRefreshAuth = true;
            await this.auth.refresh();
            continue;
          }
          throw new AuthenticationError(details.message, responseBody, details.traceId);
        case 403:
          throw new ForbiddenError(details.message, responseBody, details.traceId);
        case 404:
          throw new NotFoundError(details.message, responseBody, details.traceId);
        case 429: {
          const retryAfter = parseInt(response.headers.get('retry-after') || '5', 10);
          if (attempt < this.maxRetries) {
            await new Promise(r => setTimeout(r, retryAfter * 1000));
            continue;
          }
          throw new RateLimitError(
            details.message,
            retryAfter,
            responseBody,
            details.traceId
          );
        }
        default:
          if (response.status >= 500) {
            lastError = new ServerError(details.message, responseBody, details.traceId);
            if (attempt < this.maxRetries) continue;
            throw lastError;
          }
          throw new ServiceError(details.message, response.status, responseBody, details.traceId);
      }
    }

    throw lastError || new Error('Request failed after retries');
  }
}
