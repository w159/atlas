/**
 * Configuration types and defaults for the NinjaOne client
 */

/**
 * NinjaOne regional endpoints
 */
export type NinjaOneRegion = 'us' | 'eu' | 'oc' | 'ca' | 'us2' | 'fed';

/**
 * Regional base URLs
 */
export const REGION_URLS: Record<NinjaOneRegion, string> = {
  us: 'https://app.ninjarmm.com',
  eu: 'https://eu.ninjarmm.com',
  oc: 'https://oc.ninjarmm.com',
  ca: 'https://ca.ninjarmm.com',
  us2: 'https://us2.ninjarmm.com',
  fed: 'https://fed.ninjarmm.com',
};

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  /** Whether rate limiting is enabled (default: true) */
  enabled: boolean;
  /** Maximum requests per window (default: 100) */
  maxRequests: number;
  /** Window duration in milliseconds (default: 60000 = 1 minute) */
  windowMs: number;
  /** Threshold percentage to start throttling (default: 0.8 = 80%) */
  throttleThreshold: number;
  /** Delay between retries on 429 (default: 5000ms) */
  retryAfterMs: number;
  /** Maximum retry attempts on rate limit errors (default: 3) */
  maxRetries: number;
}

/**
 * Default rate limit configuration for NinjaOne
 * Conservative defaults to avoid hitting API limits
 */
export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  enabled: true,
  maxRequests: 100,
  windowMs: 60_000, // 1 minute
  throttleThreshold: 0.8, // 80%
  retryAfterMs: 5_000,
  maxRetries: 3,
};

/**
 * OAuth scopes available for NinjaOne
 */
export type NinjaOneScope = 'monitoring' | 'management' | 'control';

/**
 * Configuration for the NinjaOne client
 */
export interface NinjaOneConfig {
  /** OAuth 2.0 Client ID */
  clientId: string;
  /** OAuth 2.0 Client Secret */
  clientSecret: string;
  /** Region for the API endpoint (default: 'us') */
  region?: NinjaOneRegion;
  /** Explicit base URL (alternative to region) */
  baseUrl?: string;
  /** OAuth scopes (default: ['monitoring', 'management']) */
  scopes?: NinjaOneScope[];
  /** Rate limiting configuration */
  rateLimit?: Partial<RateLimitConfig>;
}

/**
 * Resolved configuration with all defaults applied
 */
export interface ResolvedConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  scopes: NinjaOneScope[];
  rateLimit: RateLimitConfig;
}

/**
 * Resolves a configuration object by applying defaults
 */
export function resolveConfig(config: NinjaOneConfig): ResolvedConfig {
  // Determine base URL
  let baseUrl: string;
  if (config.baseUrl) {
    // Remove trailing slash if present
    baseUrl = config.baseUrl.replace(/\/$/, '');
  } else {
    const region = config.region ?? 'us';
    const regionUrl = REGION_URLS[region];
    if (!regionUrl) {
      throw new Error(`Invalid region: ${region}. Valid regions are: us, eu, oc, ca, us2, fed`);
    }
    baseUrl = regionUrl;
  }

  return {
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    baseUrl,
    scopes: config.scopes ?? ['monitoring', 'management'],
    rateLimit: {
      ...DEFAULT_RATE_LIMIT_CONFIG,
      ...config.rateLimit,
    },
  };
}
