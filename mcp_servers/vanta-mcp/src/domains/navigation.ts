import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainName } from '../utils/types.js';

export const DOMAINS: DomainName[] = [
  'frameworks',
  'controls',
  'tests',
  'documents',
  'integrations',
  'people',
  'vendors',
  'risk_scenarios',
  'vulnerabilities',
  'policies',
  'monitored_computers',
];

const domainDescriptions: Record<DomainName, string> = {
  frameworks: 'Compliance frameworks (SOC 2, ISO 27001, HIPAA, etc.) and their controls',
  controls: 'Individual security/compliance controls across frameworks',
  tests: 'Automated control tests with pass/fail status',
  documents: 'Evidence documents (policies, training records, attestations)',
  integrations: 'Connected integrations (AWS, Okta, GitHub, etc.) and their inventoried resources',
  people: 'Workforce members in the Vanta workspace',
  vendors: 'Third-party vendor risk records',
  risk_scenarios: 'Enterprise risk register scenarios',
  vulnerabilities: 'Discovered vulnerabilities with SLA + fix availability',
  policies: 'Approved policies (workspace policy library)',
  monitored_computers: 'Endpoint compliance posture (laptop/workstation agent data)',
};

export function getNavigationTools(): Tool[] {
  const domainLines = DOMAINS.map(d => `- ${d}: ${domainDescriptions[d]}`).join('\n');
  return [
    {
      name: 'vanta_navigate',
      description:
        'Discover available Vanta tools by domain. Returns tool names and descriptions for the selected domain. All tools are callable at any time — this is a help/discovery aid, not a prerequisite.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          domain: {
            type: 'string',
            enum: DOMAINS,
            description: `The domain to explore:\n${domainLines}`,
          },
        },
        required: ['domain'],
      },
    },
    {
      name: 'vanta_status',
      description: 'Show credentials status, base URL, and available domains.',
      inputSchema: { type: 'object' as const, properties: {} },
    },
  ];
}
