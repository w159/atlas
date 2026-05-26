import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';

function getTools(): Tool[] {
  return [
    {
      name: 'blumira_agents_devices_list',
      description: 'List agent devices in the organization.',
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
    {
      name: 'blumira_agents_devices_get',
      description: 'Get an agent device by ID.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          device_id: { type: 'string', description: 'Device UUID' },
        },
        required: ['device_id'],
      },
    },
    {
      name: 'blumira_agents_keys_list',
      description: 'List agent keys in the organization.',
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
    {
      name: 'blumira_agents_keys_get',
      description: 'Get an agent key by ID.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          key_id: { type: 'string', description: 'Key UUID' },
        },
        required: ['key_id'],
      },
    },
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = await getClient();

  switch (toolName) {
    case 'blumira_agents_devices_list': {
      logger.info('API call: agents.listDevices', args);
      const res = await client.agents.listDevices(args as any);
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    case 'blumira_agents_devices_get': {
      const id = args.device_id as string;
      logger.info('API call: agents.getDevice', { id });
      const res = await client.agents.getDevice(id);
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    case 'blumira_agents_keys_list': {
      logger.info('API call: agents.listKeys', args);
      const res = await client.agents.listKeys(args as any);
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    case 'blumira_agents_keys_get': {
      const id = args.key_id as string;
      logger.info('API call: agents.getKey', { id });
      const res = await client.agents.getKey(id);
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    default:
      return { content: [{ type: 'text' as const, text: `Unknown tool: ${toolName}` }], isError: true };
  }
}

export const agentsHandler: DomainHandler = { getTools, handleCall };
