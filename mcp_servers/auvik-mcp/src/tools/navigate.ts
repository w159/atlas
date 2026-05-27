import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCredentials } from '../credentials.js';
import { createAuvikClient } from '../client-factory.js';
import { toMcpError } from '../errors.js';

export const navigateTool: Tool = {
  name: 'auvik_navigate',
  description: 'Follow a JSON:API links.next (or links.first/prev) absolute URL returned by a prior Auvik list call. Use this to paginate without re-encoding bracket params.',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'Absolute URL from a prior response (links.next / links.first / links.prev). Must be on auvikapi.<region>.my.auvik.com/v1/.' },
    },
    required: ['url'],
    additionalProperties: false,
  },
};

export async function handleNavigate(args: { url: string }) {
  try {
    const c = getCredentials();
    if (!c) {
      return { content: [{ type: 'text' as const, text: 'No Auvik credentials configured.' }], isError: true };
    }
    const resp = await createAuvikClient(c).followUrl(args.url);
    return { content: [{ type: 'text' as const, text: JSON.stringify(resp, null, 2) }] };
  } catch (e) {
    const m = toMcpError(e);
    return { content: [{ type: 'text' as const, text: m.message }], isError: true };
  }
}
