import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCredentials } from '../credentials.js';
import { createAuvikClient } from '../client-factory.js';

export const statusTool: Tool = {
  name: 'auvik_status',
  description: 'Live preflight: hits GET /v1/authentication/verify and reports whether credentials work and which region they routed to (308 redirects are followed transparently).',
  inputSchema: { type: 'object', properties: {}, additionalProperties: false },
};

export async function handleStatus() {
  const c = getCredentials();
  if (!c) {
    return {
      content: [{ type: 'text' as const, text: JSON.stringify({ ok: false, reason: 'No Auvik credentials configured (AUVIK_USERNAME / AUVIK_API_KEY).' }, null, 2) }],
      isError: true,
    };
  }

  const client = createAuvikClient(c);
  try {
    await client.verify();
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          ok: true,
          configuredRegion: c.region || 'us1',
          note: 'authentication/verify returned 200. Server auto-follows 308 region redirects on subsequent calls.',
        }, null, 2),
      }],
    };
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          ok: false,
          configuredRegion: c.region || 'us1',
          status: err.status,
          message: err.message,
        }, null, 2),
      }],
      isError: true,
    };
  }
}
