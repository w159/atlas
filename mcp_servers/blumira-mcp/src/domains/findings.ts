import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';

function getTools(): Tool[] {
  return [
    {
      name: 'blumira_findings_list',
      description: 'List Blumira SIEM findings; filter by status (10=Open, 40=Resolved), priority (1–5), category, date range, or name pattern. Returns finding IDs and summary fields.',
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
          created_after: { type: 'string', description: 'ISO 8601 datetime (UTC) lower bound for creation time, e.g. 2024-01-01T00:00:00Z.' },
          created_before: { type: 'string', description: 'ISO 8601 datetime (UTC) upper bound for creation time.' },
          modified_after: { type: 'string', description: 'ISO 8601 datetime (UTC) lower bound for last-modified time.' },
          modified_before: { type: 'string', description: 'ISO 8601 datetime (UTC) upper bound for last-modified time.' },
          blocked: { type: 'boolean', description: 'Filter by blocked status' },
        },
      },
    },
    {
      name: 'blumira_findings_get',
      description: 'Get a Blumira finding by finding_id (required). Returns status, priority, category, and timestamps.',
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
      description: 'Get extended Blumira finding detail (owners, resolution, category summary, UI URL) by finding_id (required). Use when basic get lacks enough context.',
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
      description: 'VISIBLE-TO-OTHERS: Resolve a Blumira finding — changes finding status visible to all team members. Requires finding_id and resolution code: 10=Valid, 20=False Positive, 30=No Action Needed, 40=Risk Accepted. Optional resolution_notes.',
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
      description: 'VISIBLE-TO-OTHERS: Assign owners to a Blumira finding — changes are visible to all team members. Specify finding_id, owner_type (responder|analyst|manager), and owners array of user UUIDs (use blumira_users_list to look up UUIDs). Pass empty array to clear.',
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
      description: 'List all comments on a Blumira finding by finding_id (required). Use to review investigation notes before adding a new comment.',
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
      description: 'VISIBLE-TO-OTHERS: Add a comment to a Blumira finding — visible to all team members with access to the finding. Requires finding_id, body (HTML allowed), and sender UUID (use blumira_users_list to get IDs).',
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
  try {
    const client = await getClient();

    switch (toolName) {
      case 'blumira_findings_list': {
        logger.info('API call: findings.list', args);
        const res = await client.findings.list(args as any);
        return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
      }
      case 'blumira_findings_get': {
        const id = args.finding_id as string;
        if (!id) return { content: [{ type: 'text' as const, text: 'Error: finding_id is required (UUID string).' }], isError: true };
        logger.info('API call: findings.get', { id });
        const res = await client.findings.get(id);
        return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
      }
      case 'blumira_findings_details': {
        const id = args.finding_id as string;
        if (!id) return { content: [{ type: 'text' as const, text: 'Error: finding_id is required (UUID string).' }], isError: true };
        logger.info('API call: findings.getDetails', { id });
        const res = await client.findings.getDetails(id);
        return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
      }
      case 'blumira_findings_resolve': {
        const id = args.finding_id as string;
        if (!id) return { content: [{ type: 'text' as const, text: 'Error: finding_id is required (UUID string).' }], isError: true };
        if (args.resolution === undefined) return { content: [{ type: 'text' as const, text: 'Error: resolution is required (integer: 10=Valid, 20=False Positive, 30=No Action Needed, 40=Risk Accepted).' }], isError: true };
        logger.info('API call: findings.resolve', { id, resolution: args.resolution });
        const res = await client.findings.resolve(id, {
          resolution: args.resolution as number,
          resolution_notes: args.resolution_notes as string | undefined,
        });
        return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
      }
      case 'blumira_findings_assign': {
        const id = args.finding_id as string;
        if (!id) return { content: [{ type: 'text' as const, text: 'Error: finding_id is required (UUID string).' }], isError: true };
        if (!args.owner_type) return { content: [{ type: 'text' as const, text: 'Error: owner_type is required (responder|analyst|manager).' }], isError: true };
        if (!args.owners) return { content: [{ type: 'text' as const, text: 'Error: owners is required (array of user UUID strings; pass empty array to clear).' }], isError: true };
        logger.info('API call: findings.assignOwners', { id, owner_type: args.owner_type });
        const res = await client.findings.assignOwners(id, {
          owner_type: args.owner_type as 'responder' | 'analyst' | 'manager',
          owners: args.owners as string[],
        });
        return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
      }
      case 'blumira_findings_comments_list': {
        const id = args.finding_id as string;
        if (!id) return { content: [{ type: 'text' as const, text: 'Error: finding_id is required (UUID string).' }], isError: true };
        logger.info('API call: findings.listComments', { id });
        const res = await client.findings.listComments(id);
        return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
      }
      case 'blumira_findings_comments_add': {
        const id = args.finding_id as string;
        if (!id) return { content: [{ type: 'text' as const, text: 'Error: finding_id is required (UUID string).' }], isError: true };
        if (!args.body) return { content: [{ type: 'text' as const, text: 'Error: body is required (string, HTML allowed).' }], isError: true };
        if (!args.sender) return { content: [{ type: 'text' as const, text: 'Error: sender is required (user UUID from blumira_users_list).' }], isError: true };
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

export const findingsHandler: DomainHandler = { getTools, handleCall };
