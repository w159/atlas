import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { elicitSelection } from '../utils/elicitation.js';

function getTools(): Tool[] {
  return [
    {
      name: 'threatlocker_approvals_list',
      description: 'List ThreatLocker software approval requests; filter by status (Pending/Approved/Denied), searchText, or childOrganizations. Use to review pending application allow requests.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          status: { type: 'string', description: 'Filter by approval status (e.g. Pending, Approved, Denied).' },
          pageNumber: { type: 'number', description: 'Page number for pagination (default: 1).' },
          pageSize: { type: 'number', description: 'Page size — records per page (default: 50).' },
          searchText: { type: 'string', description: 'Free-text search filter applied to application name, path, or requestor.' },
          childOrganizations: { type: 'boolean', description: 'When true, includes approval requests from child organizations.' },
        },
      },
    },
    {
      name: 'threatlocker_approvals_get',
      description: 'Get details of a single ThreatLocker approval request by approvalRequestId (required). Returns application name, hash, requestor, and current status.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          approvalRequestId: { type: 'string', description: 'UUID string identifying the ThreatLocker approval request.' },
        },
        required: ['approvalRequestId'],
      },
    },
    {
      name: 'threatlocker_approvals_pending_count',
      description: 'Get the count of pending ThreatLocker approval requests. Use for a quick dashboard check before listing full approval details.',
      inputSchema: {
        type: 'object' as const,
        properties: {},
      },
    },
    {
      name: 'threatlocker_approvals_get_permit_application',
      description: 'Get permit application details (allowed hash, policy assignment) for a ThreatLocker approval request by approvalRequestId (required). Use before approving to review what will be permitted.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          approvalRequestId: { type: 'string', description: 'UUID string identifying the ThreatLocker approval request.' },
        },
        required: ['approvalRequestId'],
      },
    },
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = await getClient();

  switch (toolName) {
    case 'threatlocker_approvals_list': {
      // Elicitation: if no status filter provided, ask for status preference
      let status = args.status as string | undefined;
      if (!status) {
        const elicited = await elicitSelection(
          'Select approval request status:',
          ['Pending', 'Approved', 'Denied', 'All'],
          'Pending'
        );
        status = elicited || 'Pending';
      }

      const params = {
        status: status === 'All' ? undefined : status,
        pageNumber: args.pageNumber as number | undefined,
        pageSize: args.pageSize as number | undefined,
        searchText: args.searchText as string | undefined,
        childOrganizations: args.childOrganizations as boolean | undefined,
      };
      logger.info('API call: approvalRequests.list', params);
      const result = await client.approvalRequests.list(params);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
    case 'threatlocker_approvals_get': {
      const approvalRequestId = args.approvalRequestId as string;
      logger.info('API call: approvalRequests.get', { approvalRequestId });
      const approval = await client.approvalRequests.get(approvalRequestId);
      return { content: [{ type: 'text', text: JSON.stringify(approval, null, 2) }] };
    }
    case 'threatlocker_approvals_pending_count': {
      logger.info('API call: approvalRequests.pendingCount');
      const count = await client.approvalRequests.pendingCount();
      return { content: [{ type: 'text', text: JSON.stringify(count, null, 2) }] };
    }
    case 'threatlocker_approvals_get_permit_application': {
      const approvalRequestId = args.approvalRequestId as string;
      logger.info('API call: approvalRequests.getPermitApplication', { approvalRequestId });
      const permitApp = await client.approvalRequests.getPermitApplication(approvalRequestId);
      return { content: [{ type: 'text', text: JSON.stringify(permitApp, null, 2) }] };
    }
    default:
      return { content: [{ type: 'text', text: `Unknown tool: ${toolName}` }], isError: true };
  }
}

export const approvalRequestsHandler: DomainHandler = { getTools, handleCall };