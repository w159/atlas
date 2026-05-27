import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';

function getTools(): Tool[] {
  return [
    {
      name: 'threatlocker_organizations_list_children',
      description: 'List ThreatLocker child (managed) organizations; optionally filter by searchText. Returns organization IDs needed to scope the managedOrganizationId header for child-org operations.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          searchText: { type: 'string', description: 'Free-text search applied to organization name.' },
          pageNumber: { type: 'number', description: 'Page number for pagination (default: 1).' },
          pageSize: { type: 'number', description: 'Page size — records per page (default: 50).' },
        },
      },
    },
    {
      name: 'threatlocker_organizations_get_auth_key',
      description: 'Get the ThreatLocker organization auth key for the current org. Used when deploying new ThreatLocker agents to enroll computers.',
      inputSchema: {
        type: 'object' as const,
        properties: {},
      },
    },
    {
      name: 'threatlocker_organizations_for_move_computers',
      description: 'Get ThreatLocker organizations available as move destinations for computers. Use before reassigning a computer to a different managed organization.',
      inputSchema: {
        type: 'object' as const,
        properties: {},
      },
    },
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = await getClient();

  switch (toolName) {
    case 'threatlocker_organizations_list_children': {
      const params = {
        searchText: args.searchText as string | undefined,
        pageNumber: args.pageNumber as number | undefined,
        pageSize: args.pageSize as number | undefined,
      };
      logger.info('API call: organizations.listChildren', params);
      const result = await client.organizations.listChildren(params);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
    case 'threatlocker_organizations_get_auth_key': {
      logger.info('API call: organizations.getAuthKey');
      const authKey = await client.organizations.getAuthKey();
      return { content: [{ type: 'text', text: JSON.stringify(authKey, null, 2) }] };
    }
    case 'threatlocker_organizations_for_move_computers': {
      logger.info('API call: organizations.forMoveComputers');
      const organizations = await client.organizations.forMoveComputers();
      return { content: [{ type: 'text', text: JSON.stringify(organizations, null, 2) }] };
    }
    default:
      return { content: [{ type: 'text', text: `Unknown tool: ${toolName}` }], isError: true };
  }
}

export const organizationsHandler: DomainHandler = { getTools, handleCall };