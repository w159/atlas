import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { jsonResult, errorResult, listTool, getTool } from './_helpers.js';

function getTools(): Tool[] {
  return [
    listTool('vanta_vendors_list', 'List Vanta third-party vendors with risk tier, review status, and associated controls. Use to audit vendor security posture or find vendors pending review.'),
    getTool('vanta_vendors_get', 'Get a single Vanta vendor record by ID (required). Returns risk tier, last review date, questionnaire status, and linked controls.', 'id', 'Vendor ID'),
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = await getClient();
  switch (toolName) {
    case 'vanta_vendors_list':
      logger.info('API call: vendors.list', args);
      return jsonResult(await client.vendors.list(args));
    case 'vanta_vendors_get':
      return jsonResult(await client.vendors.get(args.id as string));
    default:
      return errorResult(`Unknown tool: ${toolName}`);
  }
}

export const vendorsHandler: DomainHandler = { getTools, handleCall };
