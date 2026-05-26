import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { jsonResult, errorResult, legacyListTool } from './_helpers.js';

function getTools(): Tool[] {
  return [
    legacyListTool(
      'paylocity_direct_deposit_list',
      "List a single employee's direct deposit accounts (legacy /api/v2).",
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
    case 'paylocity_direct_deposit_list': {
      const { employeeId, ...rest } = args as { employeeId?: string; [k: string]: unknown };
      if (!employeeId) return errorResult('employeeId is required');
      logger.info('API call: directDeposit.list', { employeeId });
      return jsonResult(await client.directDeposit.list(employeeId, rest));
    }
    default:
      return errorResult(`Unknown tool: ${toolName}`);
  }
}

export const directDepositHandler: DomainHandler = { getTools, handleCall };
