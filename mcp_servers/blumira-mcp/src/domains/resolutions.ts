import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';

function getTools(): Tool[] {
  return [
    {
      name: 'blumira_resolutions_list',
      description: 'List available resolution options for findings (e.g., 10=Valid, 20=False Positive, 30=No Action Needed, 40=Risk Accepted).',
      inputSchema: {
        type: 'object' as const,
        properties: {},
      },
    },
  ];
}

async function handleCall(toolName: string, _args: Record<string, unknown>): Promise<CallToolResult> {
  const client = await getClient();

  switch (toolName) {
    case 'blumira_resolutions_list': {
      logger.info('API call: resolutions.list');
      const res = await client.resolutions.list();
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    default:
      return { content: [{ type: 'text' as const, text: `Unknown tool: ${toolName}` }], isError: true };
  }
}

export const resolutionsHandler: DomainHandler = { getTools, handleCall };
