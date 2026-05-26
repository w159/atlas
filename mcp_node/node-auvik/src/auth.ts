export function buildBasicAuth(username: string, apiKey: string): string {
  const credentials = `${username}:${apiKey}`;
  const encoded = Buffer.from(credentials, 'utf-8').toString('base64');
  return `Basic ${encoded}`;
}