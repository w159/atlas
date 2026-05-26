import type { DomainName, DomainHandler } from '../utils/types.js';

const domainCache = new Map<DomainName, DomainHandler>();

export async function getDomainHandler(domain: DomainName): Promise<DomainHandler> {
  const cached = domainCache.get(domain);
  if (cached) return cached;

  let handler: DomainHandler;
  switch (domain) {
    case 'frameworks':           handler = (await import('./frameworks.js')).frameworksHandler; break;
    case 'controls':             handler = (await import('./controls.js')).controlsHandler; break;
    case 'tests':                handler = (await import('./tests.js')).testsHandler; break;
    case 'documents':            handler = (await import('./documents.js')).documentsHandler; break;
    case 'integrations':         handler = (await import('./integrations.js')).integrationsHandler; break;
    case 'people':               handler = (await import('./people.js')).peopleHandler; break;
    case 'vendors':              handler = (await import('./vendors.js')).vendorsHandler; break;
    case 'risk_scenarios':       handler = (await import('./risk_scenarios.js')).riskScenariosHandler; break;
    case 'vulnerabilities':      handler = (await import('./vulnerabilities.js')).vulnerabilitiesHandler; break;
    case 'policies':             handler = (await import('./policies.js')).policiesHandler; break;
    case 'monitored_computers':  handler = (await import('./monitored_computers.js')).monitoredComputersHandler; break;
    default:
      throw new Error(`Unknown domain: ${domain as string}`);
  }

  domainCache.set(domain, handler);
  return handler;
}
