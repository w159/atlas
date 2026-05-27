import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { jsonResult, errorResult, getTool } from './_helpers.js';

function getTools(): Tool[] {
  return [
    getTool(
      'paylocity_pay_statements_summary',
      'Get the yearly pay statement summary for a Paylocity employee (employeeId and year both required). Returns gross pay, net pay, deductions, and taxes by pay period for the calendar year.',
      {
        employeeId: { type: 'string', description: 'Paylocity employeeId' },
        year: {
          type: 'number',
          description: 'Calendar year (e.g. 2024).',
        },
      },
      ['employeeId', 'year']
    ),
  ];
}

async function handleCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<CallToolResult> {
  const client = await getClient();
  switch (toolName) {
    case 'paylocity_pay_statements_summary': {
      const { employeeId, year, companyId } = args as {
        employeeId?: string;
        year?: number;
        companyId?: string;
      };
      if (!employeeId) return errorResult('employeeId is required');
      if (typeof year !== 'number') return errorResult('year (number) is required');
      logger.info('API call: payStatements.getYearlySummary', { employeeId, year });
      return jsonResult(
        await client.payStatements.getYearlySummary(employeeId, year, { companyId })
      );
    }
    default:
      return errorResult(`Unknown tool: ${toolName}`);
  }
}

export const payStatementsHandler: DomainHandler = { getTools, handleCall };
