import { describe, it, expect } from 'vitest';
import { PaylocityClient } from '../../src/index.js';

describe('PaylocityClient', () => {
  it('exposes all resources', () => {
    const c = new PaylocityClient({
      clientId: 'a',
      clientSecret: 'b',
      defaultCompanyId: 'C123',
    });
    expect(c.employees).toBeDefined();
    expect(c.legacyEmployees).toBeDefined();
    expect(c.costCenters).toBeDefined();
    expect(c.payGrades).toBeDefined();
    expect(c.jobCodes).toBeDefined();
    expect(c.earnings).toBeDefined();
    expect(c.deductions).toBeDefined();
    expect(c.localTaxes).toBeDefined();
    expect(c.directDeposit).toBeDefined();
    expect(c.payStatements).toBeDefined();
    expect(c.lookupCodes).toBeDefined();
  });

  it('throws when companyId is missing and no default is set', async () => {
    const c = new PaylocityClient({ clientId: 'good', clientSecret: 'secret' });
    await expect(c.employees.list()).rejects.toThrow(/companyId/);
  });
});
