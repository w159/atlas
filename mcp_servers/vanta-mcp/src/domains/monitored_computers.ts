import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { jsonResult, errorResult, listTool, getTool } from './_helpers.js';

function getTools(): Tool[] {
  return [
    listTool('vanta_monitored_computers_list', 'List endpoint agent compliance posture.', {
      complianceStatusFilterMatchesAny: {
        type: 'array',
        items: { type: 'string' },
        description: 'Filter by compliance status (e.g. COMPLIANT, NON_COMPLIANT, UNKNOWN).',
      },
    }),
    getTool('vanta_monitored_computers_get', 'Get a single monitored computer by ID.', 'id', 'Monitored computer ID'),
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = await getClient();
  switch (toolName) {
    case 'vanta_monitored_computers_list':
      logger.info('API call: monitoredComputers.list', args);
      return jsonResult(await client.monitoredComputers.list(args));
    case 'vanta_monitored_computers_get':
      return jsonResult(await client.monitoredComputers.get(args.id as string));
    default:
      return errorResult(`Unknown tool: ${toolName}`);
  }
}

export const monitoredComputersHandler: DomainHandler = { getTools, handleCall };
