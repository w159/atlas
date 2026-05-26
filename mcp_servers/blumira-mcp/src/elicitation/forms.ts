import type { Server } from '@modelcontextprotocol/sdk/server/index.js';

export async function elicitCredentials(
  server: Server,
): Promise<{ jwtToken?: string; clientId?: string; clientSecret?: string } | null> {
  try {
    const result = await (server as any).elicitInput({
      mode: 'form',
      message:
        'Blumira API credentials are required. Provide either a JWT token OR OAuth2 Client ID + Client Secret.',
      requestedSchema: {
        type: 'object',
        properties: {
          jwt_token: {
            type: 'string',
            title: 'JWT Token',
            description: 'Your Blumira API JWT token (Bearer token) — leave blank if using OAuth below',
          },
          client_id: {
            type: 'string',
            title: 'Client ID',
            description: 'Blumira OAuth2 Client ID',
          },
          client_secret: {
            type: 'string',
            title: 'Client Secret',
            description: 'Blumira OAuth2 Client Secret',
          },
        },
        required: [],
      },
    });

    if (result?.action === 'accept' && result.content) {
      const jwt = result.content.jwt_token as string | undefined;
      const cid = result.content.client_id as string | undefined;
      const csec = result.content.client_secret as string | undefined;

      if (jwt) return { jwtToken: jwt };
      if (cid && csec) return { clientId: cid, clientSecret: csec };
    }
  } catch {
    // Elicitation not supported by client
  }

  return null;
}
