import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { jsonResult, errorResult, listTool, getTool } from './_helpers.js';

function getTools(): Tool[] {
  return [
    listTool('vanta_controls_list', 'List Vanta GRC controls; optionally filter by frameworkMatchesAny (array of framework IDs) to narrow to a specific compliance framework. Returns control names, statuses, and owners.', {
      frameworkMatchesAny: {
        type: 'array',
        items: { type: 'string' },
        description: 'Restrict to controls present in any of these framework IDs.',
      },
    }),
    getTool('vanta_controls_get', 'Get a single Vanta GRC control by ID (required). Returns status, description, linked tests, and assigned owners.', 'id', 'Control ID'),
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = await getClient();
  switch (toolName) {
    case 'vanta_controls_list':
      logger.info('API call: controls.list', args);
      return jsonResult(await client.controls.list(args));
    case 'vanta_controls_get':
      logger.info('API call: controls.get', { id: args.id });
      return jsonResult(await client.controls.get(args.id as string));
    default:
      return errorResult(`Unknown tool: ${toolName}`);
  }
}

export const controlsHandler: DomainHandler = { getTools, handleCall };
