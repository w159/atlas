import type { AuvikRegion } from './types/index.js';
import { buildBasicAuth } from './auth.js';
import { AuvikAuthError, AuvikError } from './errors.js';

const REGIONS: AuvikRegion[] = ['us1', 'us2', 'us3', 'us4', 'eu1', 'eu2', 'au1', 'ca1'];
const REGION_TIMEOUT = 5000; // 5 seconds per region
let cachedRegion: AuvikRegion | null = null;

export async function resolveRegion(
  username: string,
  apiKey: string,
  fetchImpl: typeof fetch = globalThis.fetch
): Promise<AuvikRegion> {
  // Check environment variable override
  const envRegion = process.env.AUVIK_REGION as AuvikRegion;
  if (envRegion && REGIONS.includes(envRegion)) {
    return envRegion;
  }

  // Return cached region if available
  if (cachedRegion) {
    return cachedRegion;
  }

  const authHeader = buildBasicAuth(username, apiKey);
  const allErrors: Error[] = [];
  let hasAuthError = false;

  for (const region of REGIONS) {
    try {
      const baseUrl = `https://auvikapi.${region}.my.auvik.com/v1`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REGION_TIMEOUT);

      const response = await fetchImpl(`${baseUrl}/authentication/verify`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 200) {
        cachedRegion = region;
        return region;
      }

      if (response.status === 401) {
        hasAuthError = true;
      }

      allErrors.push(new Error(`Region ${region}: HTTP ${response.status}`));
    } catch (error) {
      allErrors.push(new Error(`Region ${region}: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  if (hasAuthError) {
    throw new AuvikAuthError('Invalid credentials - all regions returned 401');
  }

  throw new AuvikError(
    `Failed to resolve Auvik region. Tried: ${REGIONS.join(', ')}. Errors: ${allErrors.map(e => e.message).join('; ')}`
  );
}

export function clearCachedRegion(): void {
  cachedRegion = null;
}