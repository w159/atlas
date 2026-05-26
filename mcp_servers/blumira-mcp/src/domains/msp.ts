import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';

function getTools(): Tool[] {
  return [
    {
      name: 'blumira_msp_accounts_list',
      description: 'List MSP sub-accounts with names and open finding counts.',
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
      name: 'blumira_msp_accounts_get',
      description: 'Get MSP account details including license, agent counts, and user count.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          account_id: { type: 'string', description: 'Account UUID' },
        },
        required: ['account_id'],
      },
    },
    {
      name: 'blumira_msp_findings_all',
      description: 'List findings across all MSP accounts.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          page: { type: 'number', description: 'Page number' },
          page_size: { type: 'number', description: 'Results per page' },
          limit: { type: 'number', description: 'Maximum records' },
          status: { type: 'number', description: 'Filter by status code' },
          priority: { type: 'number', description: 'Filter by priority' },
          created_after: { type: 'string', description: 'Created after datetime (UTC)' },
          created_before: { type: 'string', description: 'Created before datetime (UTC)' },
        },
      },
    },
    {
      name: 'blumira_msp_findings_list',
      description: 'List findings for a specific MSP account.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          account_id: { type: 'string', description: 'Account UUID' },
          page: { type: 'number', description: 'Page number' },
          page_size: { type: 'number', description: 'Results per page' },
          status: { type: 'number', description: 'Filter by status code' },
          priority: { type: 'number', description: 'Filter by priority' },
        },
        required: ['account_id'],
      },
    },
    {
      name: 'blumira_msp_findings_get',
      description: 'Get a specific finding from an MSP account.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          account_id: { type: 'string', description: 'Account UUID' },
          finding_id: { type: 'string', description: 'Finding UUID' },
        },
        required: ['account_id', 'finding_id'],
      },
    },
    {
      name: 'blumira_msp_findings_resolve',
      description: 'Resolve a finding in an MSP account.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          account_id: { type: 'string', description: 'Account UUID' },
          finding_id: { type: 'string', description: 'Finding UUID' },
          resolution: { type: 'number', description: 'Resolution ID (10, 20, 30, or 40)' },
          resolution_notes: { type: 'string', description: 'Optional resolution notes' },
        },
        required: ['account_id', 'finding_id', 'resolution'],
      },
    },
    {
      name: 'blumira_msp_findings_assign',
      description: 'Assign owners to a finding in an MSP account.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          account_id: { type: 'string', description: 'Account UUID' },
          finding_id: { type: 'string', description: 'Finding UUID' },
          owner_type: { type: 'string', enum: ['responder', 'analyst', 'manager'], description: 'Type of owner' },
          owners: { type: 'array', items: { type: 'string' }, description: 'Array of user UUIDs' },
        },
        required: ['account_id', 'finding_id', 'owner_type', 'owners'],
      },
    },
    {
      name: 'blumira_msp_findings_comments_list',
      description: 'List comments on a finding in an MSP account.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          account_id: { type: 'string', description: 'Account UUID' },
          finding_id: { type: 'string', description: 'Finding UUID' },
        },
        required: ['account_id', 'finding_id'],
      },
    },
    {
      name: 'blumira_msp_findings_comments_add',
      description: 'Add a comment to a finding in an MSP account.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          account_id: { type: 'string', description: 'Account UUID' },
          finding_id: { type: 'string', description: 'Finding UUID' },
          body: { type: 'string', description: 'Comment body (may contain HTML)' },
          sender: { type: 'string', description: 'UUID of the commenting user' },
        },
        required: ['account_id', 'finding_id', 'body', 'sender'],
      },
    },
    {
      name: 'blumira_msp_devices_list',
      description: 'List agent devices for an MSP account.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          account_id: { type: 'string', description: 'Account UUID' },
          page: { type: 'number', description: 'Page number' },
          page_size: { type: 'number', description: 'Results per page' },
        },
        required: ['account_id'],
      },
    },
    {
      name: 'blumira_msp_devices_get',
      description: 'Get an agent device from an MSP account.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          account_id: { type: 'string', description: 'Account UUID' },
          device_id: { type: 'string', description: 'Device UUID' },
        },
        required: ['account_id', 'device_id'],
      },
    },
    {
      name: 'blumira_msp_keys_list',
      description: 'List agent keys for an MSP account.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          account_id: { type: 'string', description: 'Account UUID' },
          page: { type: 'number', description: 'Page number' },
          page_size: { type: 'number', description: 'Results per page' },
        },
        required: ['account_id'],
      },
    },
    {
      name: 'blumira_msp_keys_get',
      description: 'Get an agent key from an MSP account.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          account_id: { type: 'string', description: 'Account UUID' },
          key_id: { type: 'string', description: 'Key UUID' },
        },
        required: ['account_id', 'key_id'],
      },
    },
    {
      name: 'blumira_msp_users_list',
      description: 'List users for an MSP account.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          account_id: { type: 'string', description: 'Account UUID' },
          page: { type: 'number', description: 'Page number' },
          page_size: { type: 'number', description: 'Results per page' },
        },
        required: ['account_id'],
      },
    },
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = await getClient();
  const accountId = args.account_id as string;
  const findingId = args.finding_id as string;

  switch (toolName) {
    case 'blumira_msp_accounts_list': {
      logger.info('API call: msp.listAccounts', args);
      const res = await client.msp.listAccounts(args as any);
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    case 'blumira_msp_accounts_get': {
      logger.info('API call: msp.getAccount', { accountId });
      const res = await client.msp.getAccount(accountId);
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    case 'blumira_msp_findings_all': {
      logger.info('API call: msp.listAllFindings', args);
      const res = await client.msp.listAllFindings(args as any);
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    case 'blumira_msp_findings_list': {
      logger.info('API call: msp.listFindings', { accountId });
      const res = await client.msp.listFindings(accountId, args as any);
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    case 'blumira_msp_findings_get': {
      logger.info('API call: msp.getFinding', { accountId, findingId });
      const res = await client.msp.getFinding(accountId, findingId);
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    case 'blumira_msp_findings_resolve': {
      logger.info('API call: msp.resolveFinding', { accountId, findingId });
      const res = await client.msp.resolveFinding(accountId, findingId, {
        resolution: args.resolution as number,
        resolution_notes: args.resolution_notes as string | undefined,
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    case 'blumira_msp_findings_assign': {
      logger.info('API call: msp.assignFindingOwners', { accountId, findingId });
      const res = await client.msp.assignFindingOwners(accountId, findingId, {
        owner_type: args.owner_type as 'responder' | 'analyst' | 'manager',
        owners: args.owners as string[],
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    case 'blumira_msp_findings_comments_list': {
      logger.info('API call: msp.listFindingComments', { accountId, findingId });
      const res = await client.msp.listFindingComments(accountId, findingId);
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    case 'blumira_msp_findings_comments_add': {
      logger.info('API call: msp.addFindingComment', { accountId, findingId });
      const res = await client.msp.addFindingComment(accountId, findingId, {
        body: args.body as string,
        sender: args.sender as string,
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    case 'blumira_msp_devices_list': {
      logger.info('API call: msp.listDevices', { accountId });
      const res = await client.msp.listDevices(accountId, args as any);
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    case 'blumira_msp_devices_get': {
      const deviceId = args.device_id as string;
      logger.info('API call: msp.getDevice', { accountId, deviceId });
      const res = await client.msp.getDevice(accountId, deviceId);
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    case 'blumira_msp_keys_list': {
      logger.info('API call: msp.listKeys', { accountId });
      const res = await client.msp.listKeys(accountId, args as any);
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    case 'blumira_msp_keys_get': {
      const keyId = args.key_id as string;
      logger.info('API call: msp.getKey', { accountId, keyId });
      const res = await client.msp.getKey(accountId, keyId);
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    case 'blumira_msp_users_list': {
      logger.info('API call: msp.listUsers', { accountId });
      const res = await client.msp.listUsers(accountId, args as any);
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    default:
      return { content: [{ type: 'text' as const, text: `Unknown tool: ${toolName}` }], isError: true };
  }
}

export const mspHandler: DomainHandler = { getTools, handleCall };
