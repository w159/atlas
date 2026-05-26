import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { jsonResult, errorResult, modernListTool } from './_helpers.js';

function getTools(): Tool[] {
  return [
    modernListTool(
      'paylocity_cost_centers_list',
      'List the cost-center catalog (modern API Hub time).'
    ),
  ];
}

async function handleCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<CallToolResult> {
  const client = await getClient();
  switch (toolName) {
    case 'paylocity_cost_centers_list':
      logger.info('API call: costCenters.list', args);
      return jsonResult(await client.costCenters.list(args));
    default:
      return errorResult(`Unknown tool: ${toolName}`);
  }
}

export const costCentersHandler: DomainHandler = { getTools, handleCall };
