import type { DomainName, DomainHandler } from '../utils/types.js';

const domainCache = new Map<DomainName, DomainHandler>();

export async function getDomainHandler(domain: DomainName): Promise<DomainHandler> {
  const cached = domainCache.get(domain);
  if (cached) return cached;

  let handler: DomainHandler;
  switch (domain) {
    case 'employees':         handler = (await import('./employees.js')).employeesHandler; break;
    case 'legacy_employees':  handler = (await import('./legacy_employees.js')).legacyEmployeesHandler; break;
    case 'earnings':          handler = (await import('./earnings.js')).earningsHandler; break;
    case 'deductions':        handler = (await import('./deductions.js')).deductionsHandler; break;
    case 'taxes':             handler = (await import('./taxes.js')).taxesHandler; break;
    case 'direct_deposit':    handler = (await import('./direct_deposit.js')).directDepositHandler; break;
    case 'cost_centers':      handler = (await import('./cost_centers.js')).costCentersHandler; break;
    case 'pay_grades':        handler = (await import('./pay_grades.js')).payGradesHandler; break;
    case 'job_codes':         handler = (await import('./job_codes.js')).jobCodesHandler; break;
    case 'pay_statements':    handler = (await import('./pay_statements.js')).payStatementsHandler; break;
    case 'lookup_codes':      handler = (await import('./lookup_codes.js')).lookupCodesHandler; break;
    default:
      throw new Error(`Unknown domain: ${domain as string}`);
  }

  domainCache.set(domain, handler);
  return handler;
}
