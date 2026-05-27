import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';

function getTools(): Tool[] {
  return [
    {
      name: 'spanning_services_list',
      description:
        'List the backed-up services for one user (e.g. mail, drive, calendar, contacts). Tells you what is actually protected for that account.',
      inputSchema: {
        type: 'object' as const,
        properties: { userId: { type: 'string', description: 'Spanning user ID.' } },
        required: ['userId'],
      },
    },
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = getClient();
  switch (toolName) {
    case 'spanning_services_list': {
      const userId = args.userId as string;
      logger.info('API call: services.list', { userId });
      const result = await client.services.list(userId);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
    default:
      return { content: [{ type: 'text', text: `Unknown tool: ${toolName}` }], isError: true };
  }
}

export const servicesHandler: DomainHandler = { getTools, handleCall };
