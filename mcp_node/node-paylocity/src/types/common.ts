export interface PaylocityClientConfig {
  clientId: string;
  clientSecret: string;
  /** Default companyId used when a resource call does not specify one. */
  defaultCompanyId?: string;
  /** Override API base URL. Defaults to production unless `sandbox` is set. */
  baseUrl?: string;
  /** When true, both token and API base default to the apisandbox.paylocity.com host. */
  sandbox?: boolean;
  /** OAuth scope. Defaults to "WebLinkAPI". */
  scope?: string;
  /** Override token URL (rarely needed; computed from sandbox/baseUrl by default). */
  tokenUrl?: string;
  maxRetries?: number;
  rateLimitPerSecond?: number;
}

/** Shared modern list params (CoreHR / API Hub). */
export interface ModernListParams {
  /** Page size — Paylocity max is 20 for cursor endpoints. */
  limit?: number;
  /** Opaque cursor returned by the previous page. */
  nextToken?: string;
  [key: string]: unknown;
}

/** Legacy list params are mostly free-form query strings. */
export interface LegacyListParams {
  [key: string]: unknown;
}

/**
 * Normalized list shape we return to MCP callers.
 *
 *   - modern API: items + nextToken (string or null)
 *   - legacy API: items only (nextToken is always null)
 */
export interface NormalizedList<T> {
  items: T[];
  nextToken: string | null;
}

/** Modern page envelope as returned by Paylocity CoreHR / API Hub. */
export interface PaylocityPageEnvelope<T> {
  data: T[];
  pagination?: {
    nextToken?: string | null;
  };
}

export interface PaylocityToken {
  accessToken: string;
  /** Epoch ms. */
  expiresAt: number;
  tokenType: string;
}
