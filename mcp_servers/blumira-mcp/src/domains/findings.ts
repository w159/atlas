import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';

function getTools(): Tool[] {
  return [
    {
      name: 'blumira_findings_list',
      description: 'List findings with optional filtering by status, priority, category, date ranges, and name patterns.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          page: { type: 'number', description: 'Page number (default: 1)' },
          page_size: { type: 'number', description: 'Results per page (default: 100)' },
          limit: { type: 'number', description: 'Maximum records to return (max: 5000)' },
          order_by: { type: 'string', description: 'Order by field, e.g., "created;desc"' },
          status: { type: 'number', description: 'Filter by status code (e.g., 10=Open, 40=Resolved)' },
          priority: { type: 'number', description: 'Filter by priority (1-5)' },
          category: { type: 'number', description: 'Filter by category ID' },
          name: { type: 'string', description: 'Filter by exact name' },
          'name.contains': { type: 'string', description: 'Filter by name substring' },
          'name.regex': { type: 'string', description: 'Filter by name regex' },
          created_after: { type: 'string', description: 'Created after datetime (UTC)' },
          created_before: { type: 'string', description: 'Created before datetime (UTC)' },
          modified_after: { type: 'string', description: 'Modified after datetime (UTC)' },
          modified_before: { type: 'string', description: 'Modified before datetime (UTC)' },
          blocked: { type: 'boolean', description: 'Filter by blocked status' },
        },
      },
    },
    {
      name: 'blumira_findings_get',
      description: 'Get a finding by ID.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          finding_id: { type: 'string', description: 'Finding UUID' },
        },
        required: ['finding_id'],
      },
    },
    {
      name: 'blumira_findings_details',
      description: 'Get detailed finding info including owners, resolution, category, summary, and UI URL.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          finding_id: { type: 'string', description: 'Finding UUID' },
        },
        required: ['finding_id'],
      },
    },
    {
      name: 'blumira_findings_resolve',
      description: 'Resolve a finding. Resolution IDs: 10=Valid, 20=False Positive, 30=No Action Needed, 40=Risk Accepted.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          finding_id: { type: 'string', description: 'Finding UUID' },
          resolution: { type: 'number', description: 'Resolution ID (10, 20, 30, or 40)' },
          resolution_notes: { type: 'string', description: 'Optional resolution notes' },
        },
        required: ['finding_id', 'resolution'],
      },
    },
    {
      name: 'blumira_findings_assign',
      description: 'Assign owners to a finding. Owner types: responder, analyst, manager. Empty owners array clears assignments.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          finding_id: { type: 'string', description: 'Finding UUID' },
          owner_type: { type: 'string', enum: ['responder', 'analyst', 'manager'], description: 'Type of owner' },
          owners: { type: 'array', items: { type: 'string' }, description: 'Array of user UUIDs to assign' },
        },
        required: ['finding_id', 'owner_type', 'owners'],
      },
    },
    {
      name: 'blumira_findings_comments_list',
      description: 'List comments on a finding.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          finding_id: { type: 'string', description: 'Finding UUID' },
        },
        required: ['finding_id'],
      },
    },
    {
      name: 'blumira_findings_comments_add',
      description: 'Add a comment to a finding. Body may contain HTML.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          finding_id: { type: 'string', description: 'Finding UUID' },
          body: { type: 'string', description: 'Comment body (may contain HTML)' },
          sender: { type: 'string', description: 'UUID of the commenting user (use blumira_users_list to get IDs)' },
        },
        required: ['finding_id', 'body', 'sender'],
      },
    },
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = await getClient();

  switch (toolName) {
    case 'blumira_findings_list': {
      logger.info('API call: findings.list', args);
      const res = await client.findings.list(args as any);
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    case 'blumira_findings_get': {
      const id = args.finding_id as string;
      logger.info('API call: findings.get', { id });
      const res = await client.findings.get(id);
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    case 'blumira_findings_details': {
      const id = args.finding_id as string;
      logger.info('API call: findings.getDetails', { id });
      const res = await client.findings.getDetails(id);
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    case 'blumira_findings_resolve': {
      const id = args.finding_id as string;
      logger.info('API call: findings.resolve', { id, resolution: args.resolution });
      const res = await client.findings.resolve(id, {
        resolution: args.resolution as number,
        resolution_notes: args.resolution_notes as string | undefined,
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    case 'blumira_findings_assign': {
      const id = args.finding_id as string;
      logger.info('API call: findings.assignOwners', { id, owner_type: args.owner_type });
      const res = await client.findings.assignOwners(id, {
        owner_type: args.owner_type as 'responder' | 'analyst' | 'manager',
        owners: args.owners as string[],
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    case 'blumira_findings_comments_list': {
      const id = args.finding_id as string;
      logger.info('API call: findings.listComments', { id });
      const res = await client.findings.listComments(id);
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    case 'blumira_findings_comments_add': {
      const id = args.finding_id as string;
      logger.info('API call: findings.addComment', { id });
      const res = await client.findings.addComment(id, {
        body: args.body as string,
        sender: args.sender as string,
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
    }
    default:
      return { content: [{ type: 'text' as const, text: `Unknown tool: ${toolName}` }], isError: true };
  }
}

export const findingsHandler: DomainHandler = { getTools, handleCall };
