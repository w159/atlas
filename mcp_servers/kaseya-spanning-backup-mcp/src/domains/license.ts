import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';

function getTools(): Tool[] {
  return [
    {
      name: 'spanning_license_get',
      description: 'Get the current license / seat usage for the connected Spanning org.',
      inputSchema: { type: 'object' as const, properties: {} },
    },
  ];
}

async function handleCall(toolName: string, _args: Record<string, unknown>): Promise<CallToolResult> {
  const client = getClient();
  switch (toolName) {
    case 'spanning_license_get': {
      logger.info('API call: license.get');
      const result = await client.license.get();
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
    default:
      return { content: [{ type: 'text', text: `Unknown tool: ${toolName}` }], isError: true };
  }
}

export const licenseHandler: DomainHandler = { getTools, handleCall };
