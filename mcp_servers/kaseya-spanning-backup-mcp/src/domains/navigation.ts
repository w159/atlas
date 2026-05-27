import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainName } from '../utils/types.js';

export const DOMAINS: DomainName[] = [
  'users',
  'services',
  'backups',
  'restores',
  'audit',
  'license',
];

const domainDescriptions: Record<DomainName, string> = {
  users: 'Backed-up users (M365 mailboxes / GWS accounts / Salesforce users) — list and get.',
  services: 'Per-user service inventory — which services (mail, drive, calendar, contacts, etc.) are protected for a user.',
  backups: 'Daily backup runs for a user/service — one record per day per service per user.',
  restores: 'Restores — queue a restore from a backup, poll status, or block until terminal status.',
  audit: 'Audit log — admin actions and restore operations, optionally bounded by date range.',
  license: 'License / seat usage — purchased vs. consumed seats for the connected org.',
};

export function getNavigationTools(): Tool[] {
  return [
    {
      name: 'spanning_navigate',
      description:
        'Discover available Spanning Backup tools by domain. Returns tool names and descriptions for the selected domain. All tools are callable at any time — this is a discovery aid, not a prerequisite.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          domain: {
            type: 'string',
            enum: DOMAINS,
            description: DOMAINS.map((d) => `- ${d}: ${domainDescriptions[d]}`).join('\n'),
          },
        },
        required: ['domain'],
      },
    },
    {
      name: 'spanning_status',
      description: 'Show credentials status, platform, and available domains.',
      inputSchema: { type: 'object' as const, properties: {} },
    },
  ];
}
