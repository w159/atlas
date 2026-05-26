/**
 * Domain handlers index
 *
 * Lazy-loads domain handlers to avoid loading everything upfront.
 */

import type { DomainHandler } from "../utils/types.js";
import type { DomainName } from "../utils/types.js";

// Cache for loaded domain handlers
const domainCache = new Map<DomainName, DomainHandler>();

/**
 * Lazy-load a domain handler
 */
export async function getDomainHandler(
  domain: DomainName
): Promise<DomainHandler> {
  const cached = domainCache.get(domain);
  if (cached) {
    return cached;
  }

  let handler: DomainHandler;

  switch (domain) {
    case "account": {
      const { accountHandler } = await import("./account.js");
      handler = accountHandler;
      break;
    }
    case "users": {
      const { usersHandler } = await import("./users.js");
      handler = usersHandler;
      break;
    }
    case "groups": {
      const { groupsHandler } = await import("./groups.js");
      handler = groupsHandler;
      break;
    }
    case "phishing": {
      const { phishingHandler } = await import("./phishing.js");
      handler = phishingHandler;
      break;
    }
    case "training": {
      const { trainingHandler } = await import("./training.js");
      handler = trainingHandler;
      break;
    }
    case "reporting": {
      const { reportingHandler } = await import("./reporting.js");
      handler = reportingHandler;
      break;
    }
    default:
      throw new Error(`Unknown domain: ${domain}`);
  }

  domainCache.set(domain, handler);
  return handler;
}

/**
 * Get all available domain names
 */
export function getAvailableDomains(): DomainName[] {
  return ["account", "users", "groups", "phishing", "training", "reporting"];
}

/**
 * Clear the domain cache (useful for testing)
 */
export function clearDomainCache(): void {
  domainCache.clear();
}
