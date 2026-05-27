import type { DomainName, DomainHandler } from '../utils/types.js';

const cache = new Map<DomainName, DomainHandler>();

export async function getDomainHandler(domain: DomainName): Promise<DomainHandler> {
  const cached = cache.get(domain);
  if (cached) return cached;

  let handler: DomainHandler;
  switch (domain) {
    case 'users': handler = (await import('./users.js')).usersHandler; break;
    case 'services': handler = (await import('./services.js')).servicesHandler; break;
    case 'backups': handler = (await import('./backups.js')).backupsHandler; break;
    case 'restores': handler = (await import('./restores.js')).restoresHandler; break;
    case 'audit': handler = (await import('./audit.js')).auditHandler; break;
    case 'license': handler = (await import('./license.js')).licenseHandler; break;
    default:
      throw new Error(`Unknown domain: ${domain as string}`);
  }
  cache.set(domain, handler);
  return handler;
}
