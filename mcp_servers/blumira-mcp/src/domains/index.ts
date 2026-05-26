import type { DomainName, DomainHandler } from '../utils/types.js';

const domainCache = new Map<DomainName, DomainHandler>();

export async function getDomainHandler(domain: DomainName): Promise<DomainHandler> {
  const cached = domainCache.get(domain);
  if (cached) return cached;

  let handler: DomainHandler;
  switch (domain) {
    case 'findings': {
      const { findingsHandler } = await import('./findings.js');
      handler = findingsHandler;
      break;
    }
    case 'agents': {
      const { agentsHandler } = await import('./agents.js');
      handler = agentsHandler;
      break;
    }
    case 'users': {
      const { usersHandler } = await import('./users.js');
      handler = usersHandler;
      break;
    }
    case 'msp': {
      const { mspHandler } = await import('./msp.js');
      handler = mspHandler;
      break;
    }
    case 'resolutions': {
      const { resolutionsHandler } = await import('./resolutions.js');
      handler = resolutionsHandler;
      break;
    }
    default:
      throw new Error(`Unknown domain: ${domain}`);
  }

  domainCache.set(domain, handler);
  return handler;
}
