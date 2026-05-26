import { VantaClient } from 'node-vanta';
import { logger } from './logger.js';

let _client: VantaClient | null = null;
let _credKey: string | null = null;

interface Credentials {
  clientId: string;
  clientSecret: string;
  baseUrl?: string;
}

export function getCredentials(): Credentials | null {
  const clientId = process.env.VANTA_CLIENT_ID;
  const clientSecret = process.env.VANTA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    logger.warn('Missing VANTA_CLIENT_ID or VANTA_CLIENT_SECRET');
    return null;
  }
  const baseUrl = process.env.VANTA_BASE_URL || undefined;
  return { clientId, clientSecret, baseUrl };
}

export function resetClient(): void {
  _client = null;
  _credKey = null;
  logger.debug('Reset Vanta client');
}

export async function getClient(): Promise<VantaClient> {
  const creds = getCredentials();
  if (!creds) {
    throw new Error(
      'No Vanta API credentials configured. Set VANTA_CLIENT_ID and VANTA_CLIENT_SECRET. ' +
        'Optionally set VANTA_BASE_URL to override the default https://api.vanta.com/v1.'
    );
  }

  const key = `${creds.clientId}:${creds.baseUrl || ''}`;
  if (_client && _credKey === key) return _client;

  _client = new VantaClient(creds);
  _credKey = key;
  logger.info('Created Vanta API client', { baseUrl: creds.baseUrl || '(default)' });
  return _client;
}
