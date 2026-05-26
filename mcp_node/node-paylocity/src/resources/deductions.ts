import type { Deduction, LegacyListParams, NormalizedList } from '../types/index.js';
import { unwrapLegacyArray } from '../pagination.js';
import { CompanyScopedResource } from './_base.js';

/**
 * Legacy: GET /api/v1/companies/{companyId}/employees/{employeeId}/deductions
 */
export class DeductionsResource extends CompanyScopedResource {
  async list(
    employeeId: string,
    params: LegacyListParams & { companyId?: string } = {}
  ): Promise<NormalizedList<Deduction>> {
    const { companyId, ...rest } = params;
    const cid = this.resolveCompany(companyId);
    const response = await this.http.request<unknown>(
      `/api/v1/companies/${cid}/employees/${encodeURIComponent(employeeId)}/deductions`,
      { params: rest }
    );
    return unwrapLegacyArray<Deduction>(response);
  }
}
