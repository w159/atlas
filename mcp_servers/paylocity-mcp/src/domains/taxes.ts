import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { jsonResult, errorResult, legacyListTool } from './_helpers.js';

function getTools(): Tool[] {
  return [
    legacyListTool(
      'paylocity_taxes_local_list',
      "List a single employee's local taxes (legacy /api/v1).",
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
    case 'paylocity_taxes_local_list': {
      const { employeeId, ...rest } = args as { employeeId?: string; [k: string]: unknown };
      if (!employeeId) return errorResult('employeeId is required');
      logger.info('API call: localTaxes.list', { employeeId });
      return jsonResult(await client.localTaxes.list(employeeId, rest));
    }
    default:
      return errorResult(`Unknown tool: ${toolName}`);
  }
}

export const taxesHandler: DomainHandler = { getTools, handleCall };
