import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';

function getTools(): Tool[] {
  return [
    {
      name: 'blumira_users_list',
      description: 'List users in the organization. Returns user IDs, emails, names, and roles.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          page: { type: 'number', description: 'Page number' },
          page_size: { type: 'number', description: 'Results per page' },
          limit: { type: 'number', description: 'Maximum records' },
          order_by: { type: 'string', description: 'Order by field' },
        },
      },
    },
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = await getClient();

  switch (toolName) {
    case 'blumira_users_list': {
      logger.info('API call: users.list', args);
      const res = await client.users.list(args as any);
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    default:
      return { content: [{ type: 'text' as const, text: `Unknown tool: ${toolName}` }], isError: true };
  }
}

export const usersHandler: DomainHandler = { getTools, handleCall };
