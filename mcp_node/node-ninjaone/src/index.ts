/**
 * node-ninjaone
 * Comprehensive, fully-typed Node.js/TypeScript library for the NinjaOne/NinjaRMM API
 */

// Main client
export { NinjaOneClient } from './client.js';

// Configuration
export type { NinjaOneConfig, RateLimitConfig, NinjaOneRegion, NinjaOneScope } from './config.js';
export { DEFAULT_RATE_LIMIT_CONFIG, REGION_URLS } from './config.js';

// Error classes
export {
  NinjaOneError,
  NinjaOneAuthenticationError,
  NinjaOneForbiddenError,
  NinjaOneNotFoundError,
  NinjaOneValidationError,
  NinjaOneRateLimitError,
  NinjaOneServerError,
} from './errors.js';

// Types
export * from './types/index.js';
