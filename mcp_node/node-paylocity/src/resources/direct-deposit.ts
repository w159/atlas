import type { DirectDeposit, LegacyListParams, NormalizedList } from '../types/index.js';
import { unwrapLegacyArray } from '../pagination.js';
import { CompanyScopedResource } from './_base.js';

/**
 * Legacy: GET /api/v2/companies/{companyId}/employees/{employeeId}/directDeposit
 */
export class DirectDepositResource extends CompanyScopedResource {
  async list(
    employeeId: string,
    params: LegacyListParams & { companyId?: string } = {}
  ): Promise<NormalizedList<DirectDeposit>> {
    const { companyId, ...rest } = params;
    const cid = this.resolveCompany(companyId);
    const response = await this.http.request<unknown>(
      `/api/v2/companies/${cid}/employees/${encodeURIComponent(employeeId)}/directDeposit`,
      { params: rest }
    );
    return unwrapLegacyArray<DirectDeposit>(response);
  }
}
