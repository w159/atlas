import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { jsonResult, errorResult, listTool } from './_helpers.js';

function getTools(): Tool[] {
  return [
    listTool('vanta_integrations_list', 'List connected integrations (AWS, Okta, GitHub, etc.).'),
    {
      name: 'vanta_integrations_get',
      description: 'Get a single integration by connectionId.',
      inputSchema: {
        type: 'object' as const,
        properties: { connectionId: { type: 'string' } },
        required: ['connectionId'],
      },
    },
    {
      name: 'vanta_integrations_list_resource_kinds',
      description: 'List the resource kinds an integration exposes (e.g. ec2_instance, s3_bucket).',
      inputSchema: {
        type: 'object' as const,
        properties: {
          connectionId: { type: 'string' },
          pageSize: { type: 'number' },
          pageCursor: { type: 'string' },
        },
        required: ['connectionId'],
      },
    },
    {
      name: 'vanta_integrations_list_resources',
      description: 'List resources of a specific kind under an integration.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          connectionId: { type: 'string' },
          resourceKind: { type: 'string' },
          pageSize: { type: 'number' },
          pageCursor: { type: 'string' },
        },
        required: ['connectionId', 'resourceKind'],
      },
    },
    {
      name: 'vanta_integrations_get_resource',
      description: 'Get a single integration resource by ID.',
      inputSchema: {
        type: 'object' as const,
        properties: { resourceId: { type: 'string' } },
        required: ['resourceId'],
      },
    },
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = await getClient();
  switch (toolName) {
    case 'vanta_integrations_list':
      logger.info('API call: integrations.list', args);
      return jsonResult(await client.integrations.list(args));
    case 'vanta_integrations_get':
      return jsonResult(await client.integrations.get(args.connectionId as string));
    case 'vanta_integrations_list_resource_kinds': {
      const { connectionId, ...rest } = args as { connectionId: string; [k: string]: unknown };
      return jsonResult(await client.integrations.listResourceKinds(connectionId, rest));
    }
    case 'vanta_integrations_list_resources': {
      const { connectionId, resourceKind, ...rest } = args as { connectionId: string; resourceKind: string; [k: string]: unknown };
      return jsonResult(await client.integrations.listResources(connectionId, resourceKind, rest));
    }
    case 'vanta_integrations_get_resource':
      return jsonResult(await client.integrations.getResource(args.resourceId as string));
    default:
      return errorResult(`Unknown tool: ${toolName}`);
  }
}

export const integrationsHandler: DomainHandler = { getTools, handleCall };
