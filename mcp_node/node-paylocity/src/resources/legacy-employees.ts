import type { Employee, LegacyListParams, NormalizedList } from '../types/index.js';
import { unwrapLegacyArray } from '../pagination.js';
import { CompanyScopedResource } from './_base.js';

/**
 * Legacy employees:
 *   GET /api/v2/companies/{companyId}/employees
 *   GET /api/v2/companies/{companyId}/employees/{employeeId}
 *
 * Legacy responses are raw JSON arrays (no envelope, no pagination).
 */
export class LegacyEmployeesResource extends CompanyScopedResource {
  async list(
    params: LegacyListParams & { companyId?: string } = {}
  ): Promise<NormalizedList<Employee>> {
    const { companyId, ...rest } = params;
    const cid = this.resolveCompany(companyId);
    const response = await this.http.request<unknown>(
      `/api/v2/companies/${cid}/employees`,
      { params: rest }
    );
    return unwrapLegacyArray<Employee>(response);
  }

  async get(employeeId: string, opts: { companyId?: string } = {}): Promise<Employee> {
    const cid = this.resolveCompany(opts.companyId);
    return this.http.request<Employee>(
      `/api/v2/companies/${cid}/employees/${encodeURIComponent(employeeId)}`
    );
  }
}
