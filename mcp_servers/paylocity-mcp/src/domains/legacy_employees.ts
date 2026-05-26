import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { jsonResult, errorResult, legacyListTool, getTool } from './_helpers.js';

function getTools(): Tool[] {
  return [
    legacyListTool(
      'paylocity_legacy_employees_list',
      'List employees via the legacy /api/v2 endpoint. Returns a raw JSON array (no pagination).'
    ),
    getTool(
      'paylocity_legacy_employees_get',
      'Get a single employee by ID via the legacy /api/v2 endpoint.',
      { employeeId: { type: 'string', description: 'Paylocity employeeId' } },
      ['employeeId']
    ),
  ];
}

async function handleCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<CallToolResult> {
  const client = await getClient();
  switch (toolName) {
    case 'paylocity_legacy_employees_list':
      logger.info('API call: legacyEmployees.list', args);
      return jsonResult(await client.legacyEmployees.list(args));
    case 'paylocity_legacy_employees_get': {
      const { employeeId, ...rest } = args as { employeeId: string; [k: string]: unknown };
      return jsonResult(await client.legacyEmployees.get(employeeId, rest));
    }
    default:
      return errorResult(`Unknown tool: ${toolName}`);
  }
}

export const legacyEmployeesHandler: DomainHandler = { getTools, handleCall };
