import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { jsonResult, errorResult, listTool, getTool } from './_helpers.js';

function getTools(): Tool[] {
  return [
    listTool('vanta_people_list', 'List workforce members.', {
      emailAndNameFilter: { type: 'string', description: 'Free-text filter against email/name.' },
      groupIdsMatchesAny: { type: 'array', items: { type: 'string' }, description: 'Restrict to people in any of these group IDs.' },
    }),
    getTool('vanta_people_get', 'Get a single person by ID.', 'id', 'Person ID'),
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = await getClient();
  switch (toolName) {
    case 'vanta_people_list':
      logger.info('API call: people.list', args);
      return jsonResult(await client.people.list(args));
    case 'vanta_people_get':
      return jsonResult(await client.people.get(args.id as string));
    default:
      return errorResult(`Unknown tool: ${toolName}`);
  }
}

export const peopleHandler: DomainHandler = { getTools, handleCall };
