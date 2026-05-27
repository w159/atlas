import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { jsonResult, errorResult, listTool, getTool } from './_helpers.js';

function getTools(): Tool[] {
  return [
    listTool('vanta_policies_list', 'List Vanta approved workspace policies with their approval status and owners. Use to enumerate policies for audit review or to find the policy ID for a specific domain (e.g. access control, incident response).'),
    getTool('vanta_policies_get', 'Get a single Vanta policy by ID (required). Returns policy content, version, last approved date, and approver.', 'id', 'Policy ID'),
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
