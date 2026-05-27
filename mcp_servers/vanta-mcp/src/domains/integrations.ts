import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { jsonResult, errorResult, listTool } from './_helpers.js';

function getTools(): Tool[] {
  return [
    listTool('vanta_integrations_list', 'List Vanta connected integrations (AWS, Okta, GitHub, etc.) with sync status. Use to find a connectionId before calling resource or resource-kind tools.'),
    {
      name: 'vanta_integrations_get',
      description: 'Get a single Vanta integration by connectionId (required). Returns sync status, last sync timestamp, and configuration details.',
      inputSchema: {
        type: 'object' as const,
        properties: { connectionId: { type: 'string' } },
        required: ['connectionId'],
      },
    },
    {
      name: 'vanta_integrations_list_resource_kinds',
      description: 'List resource kinds exposed by a Vanta integration (e.g. ec2_instance, s3_bucket) by connectionId (required). Use to discover what resource types can be queried before calling vanta_integrations_list_resources.',
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
      description: 'List Vanta integration resources of a specific kind; requires connectionId and resourceKind (both required). Use to enumerate cloud resources (e.g. all EC2 instances or S3 buckets) inventoried by the integration.',
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
      description: 'Get a single Vanta integration resource by resourceId (required). Returns resource attributes, compliance findings, and linked controls.',
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
