import { ThreatLockerClient } from 'node-threatlocker';
import { logger } from './logger.js';

let _client: any | null = null;
let _credKey: string | null = null;

interface Credentials {
  apiKey: string;
  organizationId?: string;
  baseUrl?: string;
}

export function getCredentials(): Credentials | null {
  const apiKey = process.env.THREATLOCKER_API_KEY;
  if (!apiKey) {
    logger.warn('Missing THREATLOCKER_API_KEY');
    return null;
  }
  const organizationId = process.env.THREATLOCKER_ORGANIZATION_ID || undefined;
  const baseUrl = process.env.THREATLOCKER_BASE_URL || undefined;
  return { apiKey, organizationId, baseUrl };
}

export function resetClient(): void {
  _client = null;
  _credKey = null;
  logger.debug('Reset ThreatLocker client');
}

export async function getClient(): Promise<any> {
  const creds = getCredentials();
  if (!creds) {
    throw new Error(
      'No ThreatLocker API credentials configured. Set THREATLOCKER_API_KEY (required). ' +
        'Optionally set THREATLOCKER_ORGANIZATION_ID for managed-org scope and ' +
        'THREATLOCKER_BASE_URL for non-default shards (e.g. https://portalapi.g.us.threatlocker.com/portalapi).'
    );
  }

  const key = `${creds.apiKey}:${creds.organizationId || ''}:${creds.baseUrl || ''}`;
  if (_client && _credKey === key) return _client;

  _client = new ThreatLockerClient(creds);
  _credKey = key;
  logger.info('Created ThreatLocker API client', {
    hasOrgScope: !!creds.organizationId,
    baseUrl: creds.baseUrl || '(default)',
  });
  return _client;
}
