import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';

function getTools(): Tool[] {
  return [
    {
      name: 'blumira_agents_devices_list',
      description: 'List Blumira agent-enrolled devices in the organization. Returns device IDs, hostnames, and status. Use to audit agent coverage.',
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
      description: 'Get details of a single Blumira agent device by device_id (required). Returns OS, last-seen, and connection state.',
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
      description: 'List Blumira agent enrollment keys in the organization. Returns key IDs and labels. Use to identify which keys are active for agent provisioning.',
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
      description: 'Get a single Blumira agent enrollment key by key_id (required). Returns the key value and associated metadata.',
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
  try {
    const client = await getClient();

    switch (toolName) {
      case 'blumira_agents_devices_list': {
        logger.info('API call: agents.listDevices', args);
        const res = await client.agents.listDevices(args as any);
        return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
      }
      case 'blumira_agents_devices_get': {
        const id = args.device_id as string;
        if (!id) return { content: [{ type: 'text' as const, text: 'Error: device_id is required (UUID string).' }], isError: true };
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
        if (!id) return { content: [{ type: 'text' as const, text: 'Error: key_id is required (UUID string).' }], isError: true };
        logger.info('API call: agents.getKey', { id });
        const res = await client.agents.getKey(id);
        return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
      }
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${toolName}` }], isError: true };
    }
  } catch (error: any) {
    const status = error?.status ?? error?.statusCode ?? '';
    const body = error?.body ? JSON.stringify(error.body).slice(0, 200) : '';
    const hint = status === 401 || status === 403
      ? 'Verify BLUMIRA_JWT_TOKEN or BLUMIRA_CLIENT_ID + BLUMIRA_CLIENT_SECRET are correct.'
      : 'Check that your Blumira credentials are valid and the API is reachable.';
    const msg = `Blumira API error${status ? ` (HTTP ${status})` : ''}: ${error?.message ?? String(error)}${body ? ` — ${body}` : ''}. ${hint}`;
    logger.error('Tool call failed', { tool: toolName, error: msg });
    return { content: [{ type: 'text' as const, text: msg }], isError: true };
  }
}

export const agentsHandler: DomainHandler = { getTools, handleCall };
