import type { PayStatementSummary } from '../types/index.js';
import { CompanyScopedResource } from './_base.js';

/**
 * GET /apihub-payroll/v1/companies/{companyId}/employees/{employeeId}/paystatement/summary/{year}
 */
export class PayStatementsResource extends CompanyScopedResource {
  async getYearlySummary(
    employeeId: string,
    year: number,
    opts: { companyId?: string } = {}
  ): Promise<PayStatementSummary> {
    const cid = this.resolveCompany(opts.companyId);
    return this.http.request<PayStatementSummary>(
      `/apihub-payroll/v1/companies/${cid}/employees/${encodeURIComponent(
        employeeId
      )}/paystatement/summary/${year}`
    );
  }
}
