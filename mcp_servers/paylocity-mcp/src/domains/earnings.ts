import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import {
  jsonResult,
  errorResult,
  modernListTool,
  legacyListTool,
} from './_helpers.js';

function getTools(): Tool[] {
  return [
    modernListTool(
      'paylocity_earnings_company_list',
      'List company-level earning codes (modern API Hub payroll).'
    ),
    legacyListTool(
      'paylocity_earnings_employee_list',
      'List a single employee\'s earnings (legacy /api/v1).',
      { employeeId: { type: 'string', description: 'Paylocity employeeId' } }
    ),
  ];
}

async function handleCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<CallToolResult> {
  const client = await getClient();
  switch (toolName) {
    case 'paylocity_earnings_company_list':
      logger.info('API call: earnings.listCompanyEarnings', args);
      return jsonResult(await client.earnings.listCompanyEarnings(args));
    case 'paylocity_earnings_employee_list': {
      const { employeeId, ...rest } = args as { employeeId?: string; [k: string]: unknown };
      if (!employeeId) return errorResult('employeeId is required');
      logger.info('API call: earnings.listEmployeeEarnings', { employeeId });
      return jsonResult(await client.earnings.listEmployeeEarnings(employeeId, rest));
    }
    default:
      return errorResult(`Unknown tool: ${toolName}`);
  }
}

export const earningsHandler: DomainHandler = { getTools, handleCall };
