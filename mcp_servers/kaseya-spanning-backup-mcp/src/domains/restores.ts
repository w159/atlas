import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';

function getTools(): Tool[] {
  return [
    {
      name: 'spanning_restores_queue',
      description:
        'Queue a restore from a backup for a user/service. Asynchronous — returns a restoreId; poll with spanning_restores_get or spanning_restores_wait_for. The payload shape varies by service (mail vs drive vs calendar) — pass the JSON the API expects for your target.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          userId: { type: 'string', description: 'Spanning user ID.' },
          service: { type: 'string', description: 'Service name (mail, drive, calendar, contacts, etc.).' },
          backupId: { type: 'string', description: 'ID of the backup / restore-point to restore from.' },
          destination: { type: 'string', description: 'Optional restore destination override (e.g. another mailbox).' },
          itemIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional list of item IDs to restore (for partial restores).',
          },
          extra: {
            type: 'object',
            description: 'Optional additional service-specific properties merged into the restore request body.',
            additionalProperties: true,
          },
        },
        required: ['userId', 'service'],
      },
    },
    {
      name: 'spanning_restores_get',
      description: 'Get the current status of a queued restore.',
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
  const client = getClient();
  switch (toolName) {
    case 'spanning_restores_queue': {
      const userId = args.userId as string;
      const service = args.service as string;
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
      logger.info('API call: restores.get', { restoreId });
      const result = await client.restores.get(restoreId);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
    case 'spanning_restores_wait_for': {
      const restoreId = args.restoreId as string;
      const intervalMs = Math.max((args.intervalMs as number | undefined) ?? 30_000, 5_000);
      const timeoutMs = (args.timeoutMs as number | undefined) ?? 600_000;
      logger.info('API call: restores.waitFor', { restoreId, intervalMs, timeoutMs });
      const result = await client.restores.waitFor(restoreId, { intervalMs, timeoutMs });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
    default:
      return { content: [{ type: 'text', text: `Unknown tool: ${toolName}` }], isError: true };
  }
}

export const restoresHandler: DomainHandler = { getTools, handleCall };
