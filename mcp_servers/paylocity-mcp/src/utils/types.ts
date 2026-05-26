import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export type DomainName =
  | 'employees'
  | 'legacy_employees'
  | 'earnings'
  | 'deductions'
  | 'taxes'
  | 'direct_deposit'
  | 'cost_centers'
  | 'pay_grades'
  | 'job_codes'
  | 'pay_statements'
  | 'lookup_codes';

export type CallToolResult = {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
};

export interface DomainHandler {
  getTools(): Tool[];
  handleCall(
    toolName: string,
    args: Record<string, unknown>,
    extra?: unknown
  ): Promise<CallToolResult>;
}
