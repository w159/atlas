import type { PayGrade, ModernListParams, NormalizedList } from '../types/index.js';
import { unwrapModernPage } from '../pagination.js';
import { CompanyScopedResource } from './_base.js';

/**
 * GET /apihub-positionmanagement/v1/companies/{companyId}/paygrades
 */
export class PayGradesResource extends CompanyScopedResource {
  async list(
    params: ModernListParams & { companyId?: string } = {}
  ): Promise<NormalizedList<PayGrade>> {
    const { companyId, ...rest } = params;
    const cid = this.resolveCompany(companyId);
    const response = await this.http.request<unknown>(
      `/apihub-positionmanagement/v1/companies/${cid}/paygrades`,
      { params: rest }
    );
    return unwrapModernPage<PayGrade>(response);
  }
}
