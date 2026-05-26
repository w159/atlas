import type {
  CompanyEarning,
  EmployeeEarning,
  LegacyListParams,
  ModernListParams,
  NormalizedList,
} from '../types/index.js';
import { unwrapLegacyArray, unwrapModernPage } from '../pagination.js';
import { CompanyScopedResource } from './_base.js';

/**
 * Modern company earning codes (API Hub):
 *   GET /apihub-payroll/v1/companies/{companyId}/earnings
 *
 * Legacy per-employee earnings (returns raw array):
 *   GET /api/v1/companies/{companyId}/employees/{employeeId}/earnings
 */
export class EarningsResource extends CompanyScopedResource {
  /** Modern API Hub: company-level earning codes. */
  async listCompanyEarnings(
    params: ModernListParams & { companyId?: string } = {}
  ): Promise<NormalizedList<CompanyEarning>> {
    const { companyId, ...rest } = params;
    const cid = this.resolveCompany(companyId);
    const response = await this.http.request<unknown>(
      `/apihub-payroll/v1/companies/${cid}/earnings`,
      { params: rest }
    );
    return unwrapModernPage<CompanyEarning>(response);
  }

  /** Legacy v1 employee-scoped earnings (raw array). */
  async listEmployeeEarnings(
    employeeId: string,
    params: LegacyListParams & { companyId?: string } = {}
  ): Promise<NormalizedList<EmployeeEarning>> {
    const { companyId, ...rest } = params;
    const cid = this.resolveCompany(companyId);
    const response = await this.http.request<unknown>(
      `/api/v1/companies/${cid}/employees/${encodeURIComponent(employeeId)}/earnings`,
      { params: rest }
    );
    return unwrapLegacyArray<EmployeeEarning>(response);
  }
}
