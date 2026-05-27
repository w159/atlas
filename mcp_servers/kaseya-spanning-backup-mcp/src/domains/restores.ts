import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';

function getTools(): Tool[] {
  return [
    {
      name: 'spanning_restores_queue',
      description:
        'DESTRUCTIVE: Queue a restore from a backup for a user/service — overwrites existing data in the target mailbox/drive/calendar. Asynchronous — returns a restoreId; poll with spanning_restores_get or spanning_restores_wait_for. The payload shape varies by service (mail vs drive vs calendar) — pass the JSON the API expects for your target.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          userId: { type: 'string', description: 'Spanning user ID (opaque string from spanning_users_list).' },
          service: { type: 'string', description: 'Service name to restore (e.g. mail, drive, calendar, contacts). Use spanning_services_list to enumerate valid values.' },
          backupId: { type: 'string', description: 'ID of the specific backup / restore-point to restore from (from spanning_backups_list).' },
          destination: { type: 'string', description: 'Optional restore destination override — e.g. an alternative mailbox address. Omit to restore to the original user.' },
          itemIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional list of item IDs to restore for a partial restore. Omit to restore all items from the backup.',
          },
          extra: {
            type: 'object',
            description: 'Optional additional service-specific properties merged into the restore request body (see Spanning API docs for the target service).',
            additionalProperties: true,
          },
        },
        required: ['userId', 'service'],
      },
    },
    {
      name: 'spanning_restores_get',
      description: 'Get the current status of a queued Spanning restore by restoreId (required). Returns state (pending/running/completed/failed) and progress info.',
      inputSchema: {
        type: 'object' as const,
        properties: { restoreId: { type: 'string', description: 'Restore ID.' } },
        required: ['restoreId'],
      },
    },
    {
      name: 'spanning_restores_wait_for',
      description:
        'Poll a restore until it reaches a terminal status (completed, failed, cancelled) or times out. Default interval 30s, default timeout 10 minutes — chosen to stay inside Spanning\'s 100 req/min budget.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          restoreId: { type: 'string', description: 'Restore ID.' },
          intervalMs: { type: 'number', description: 'Polling interval in milliseconds (default 30000, minimum 5000).' },
          timeoutMs: { type: 'number', description: 'Total wait timeout in milliseconds (default 600000).' },
        },
        required: ['restoreId'],
      },
    },
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  try {
    const client = getClient();
    switch (toolName) {
      case 'spanning_restores_queue': {
        const userId = args.userId as string;
        const service = args.service as string;
        if (!userId) return { content: [{ type: 'text', text: 'Error: userId is required (opaque string from spanning_users_list).' }], isError: true };
        if (!service) return { content: [{ type: 'text', text: 'Error: service is required (e.g. mail, drive, calendar, contacts — see spanning_services_list).' }], isError: true };
        const extra = (args.extra as Record<string, unknown> | undefined) || {};
        const payload: Record<string, unknown> = { ...extra };
        if (args.backupId !== undefined) payload['backupId'] = args.backupId;
        if (args.destination !== undefined) payload['destination'] = args.destination;
        if (args.itemIds !== undefined) payload['itemIds'] = args.itemIds;
        logger.info('API call: restores.queue', { userId, service, payloadKeys: Object.keys(payload) });
        const result = await client.restores.queue(userId, service, payload);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'spanning_restores_get': {
        const restoreId = args.restoreId as string;
        if (!restoreId) return { content: [{ type: 'text', text: 'Error: restoreId is required (string from spanning_restores_queue).' }], isError: true };
        logger.info('API call: restores.get', { restoreId });
        const result = await client.restores.get(restoreId);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'spanning_restores_wait_for': {
        const restoreId = args.restoreId as string;
        if (!restoreId) return { content: [{ type: 'text', text: 'Error: restoreId is required (string from spanning_restores_queue).' }], isError: true };
        const intervalMs = Math.max((args.intervalMs as number | undefined) ?? 30_000, 5_000);
        const timeoutMs = (args.timeoutMs as number | undefined) ?? 600_000;
        logger.info('API call: restores.waitFor', { restoreId, intervalMs, timeoutMs });
        const result = await client.restores.waitFor(restoreId, { intervalMs, timeoutMs });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${toolName}` }], isError: true };
    }
  } catch (error: any) {
    const status = error?.status ?? error?.statusCode ?? '';
    const hint = status === 401 || status === 403
      ? 'Verify SPANNING_ADMIN_EMAIL and SPANNING_API_TOKEN environment variables are correct.'
      : 'Check Spanning API credentials (SPANNING_ADMIN_EMAIL, SPANNING_API_TOKEN) and platform setting (SPANNING_PLATFORM).';
    const msg = `Spanning API error${status ? ` (HTTP ${status})` : ''}: ${error?.message ?? String(error)}. ${hint}`;
    logger.error('Tool call failed', { tool: toolName, error: msg });
    return { content: [{ type: 'text', text: msg }], isError: true };
  }
}

export const restoresHandler: DomainHandler = { getTools, handleCall };
