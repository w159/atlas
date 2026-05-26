import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { jsonResult, errorResult, listTool, getTool } from './_helpers.js';

function getTools(): Tool[] {
  return [
    listTool('vanta_policies_list', 'List approved workspace policies.'),
    getTool('vanta_policies_get', 'Get a single policy by ID.', 'id', 'Policy ID'),
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = await getClient();
  switch (toolName) {
    case 'vanta_policies_list':
      logger.info('API call: policies.list', args);
      return jsonResult(await client.policies.list(args));
    case 'vanta_policies_get':
      return jsonResult(await client.policies.get(args.id as string));
    default:
      return errorResult(`Unknown tool: ${toolName}`);
  }
}

export const policiesHandler: DomainHandler = { getTools, handleCall };
