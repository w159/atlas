export * from './common.js';

// Paylocity domain object types. Kept loose because the API schema surface is
// huge and the MCP server simply forwards JSON. We pin a handful of
// high-signal fields for type-aware tooling.

export interface Employee {
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  status?: { statusType?: string; statusCode?: string };
  position?: Record<string, unknown>;
  payRate?: Record<string, unknown>;
  [k: string]: unknown;
}

export interface CostCenter {
  costCenter?: string;
  name?: string;
  level?: number;
  [k: string]: unknown;
}

export interface PayGrade {
  payGradeCode?: string;
  description?: string;
  [k: string]: unknown;
}

export interface JobCode {
  jobCode?: string;
  jobTitle?: string;
  [k: string]: unknown;
}

export interface CompanyEarning {
  earningCode?: string;
  earningName?: string;
  earningType?: string;
  [k: string]: unknown;
}

export interface EmployeeEarning {
  earningCode?: string;
  rate?: number;
  effectiveDate?: string;
  [k: string]: unknown;
}

export interface Deduction {
  deductionCode?: string;
  amount?: number;
  frequency?: string;
  [k: string]: unknown;
}

export interface LocalTax {
  taxCode?: string;
  filingStatus?: string;
  [k: string]: unknown;
}

export interface DirectDeposit {
  accountType?: string;
  accountNumber?: string;
  amount?: number;
  routingNumber?: string;
  amountType?: string;
  [k: string]: unknown;
}

export interface PayStatementSummary {
  year?: number;
  totalGross?: number;
  totalNet?: number;
  [k: string]: unknown;
}

export interface LookupCode {
  code?: string;
  description?: string;
  [k: string]: unknown;
}

export interface EmployeeListParams {
  limit?: number;
  nextToken?: string;
  /**
   * CSV of expansion fields. Paylocity accepts: info, position, status,
   * payRate, futurePayRate.
   */
  include?: string;
  activeOnly?: boolean;
  testMode?: boolean;
  [k: string]: unknown;
}
