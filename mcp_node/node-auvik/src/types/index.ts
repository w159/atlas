export * from './json-api.js';
export * from './tenants.js';
export * from './devices.js';
export * from './networks.js';
export * from './interfaces.js';
export * from './configuration.js';
export * from './entity.js';
export * from './component.js';
export * from './alerts.js';
export * from './statistics.js';
export * from './billing.js';

export type AuvikRegion = 'us1' | 'us2' | 'us3' | 'us4' | 'eu1' | 'eu2' | 'au1' | 'ca1';

export interface AuvikClientConfig {
  username: string;
  apiKey: string;
  region?: AuvikRegion;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  fetchImpl?: typeof fetch;
}