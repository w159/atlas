import { http, HttpResponse } from 'msw';

const TOKEN_URL = 'https://api.vanta.com/oauth/token';
const BASE_URL = 'https://api.vanta.com/v1';

// Track token mint count for refresh tests
export const tokenStats = {
  mints: 0,
  reset() { this.mints = 0; },
};

function pagedEnvelope<T>(items: T[], opts: { hasNextPage?: boolean; endCursor?: string | null } = {}) {
  return {
    results: {
      data: items,
      pageInfo: {
        hasNextPage: Boolean(opts.hasNextPage),
        endCursor: opts.endCursor ?? null,
        startCursor: null,
        hasPreviousPage: false,
      },
    },
  };
}

export const handlers = [
  // OAuth token endpoint
  http.post(TOKEN_URL, async ({ request }) => {
    const body = (await request.json()) as { client_id?: string; client_secret?: string };
    if (body?.client_id === 'bad') {
      return HttpResponse.json({ error: 'invalid_client' }, { status: 401 });
    }
    tokenStats.mints++;
    return HttpResponse.json({
      access_token: `tok-${tokenStats.mints}`,
      expires_in: 3600,
      token_type: 'Bearer',
    });
  }),

  // Frameworks list
  http.get(`${BASE_URL}/frameworks`, () =>
    HttpResponse.json(
      pagedEnvelope(
        [
          { id: 'soc2', name: 'SOC 2', productFamily: 'soc2' },
          { id: 'iso27001', name: 'ISO 27001' },
        ],
        { hasNextPage: true, endCursor: 'cur-1' }
      )
    )
  ),
  http.get(`${BASE_URL}/frameworks/soc2`, () =>
    HttpResponse.json({ id: 'soc2', name: 'SOC 2', productFamily: 'soc2' })
  ),
  http.get(`${BASE_URL}/frameworks/soc2/controls`, () =>
    HttpResponse.json(
      pagedEnvelope([{ id: 'ctrl-1', name: 'Access Control' }], { hasNextPage: false })
    )
  ),

  // Controls
  http.get(`${BASE_URL}/controls`, () =>
    HttpResponse.json(pagedEnvelope([{ id: 'ctrl-1', name: 'Access Control' }]))
  ),

  // Tests
  http.get(`${BASE_URL}/tests`, () =>
    HttpResponse.json(pagedEnvelope([{ id: 't-1', name: 'MFA enabled', status: 'OK' }]))
  ),

  // Documents
  http.get(`${BASE_URL}/documents`, () =>
    HttpResponse.json(pagedEnvelope([{ id: 'd-1', name: 'AUP', status: 'CURRENT' }]))
  ),

  // Vendors
  http.get(`${BASE_URL}/vendors`, () =>
    HttpResponse.json(pagedEnvelope([{ id: 'v-1', name: 'AWS', status: 'IN_REVIEW' }]))
  ),

  // Vulnerabilities
  http.get(`${BASE_URL}/vulnerabilities`, () =>
    HttpResponse.json(
      pagedEnvelope([
        { id: 'cve-1', title: 'CVE-2024-1234', severity: 'HIGH', isFixAvailable: true },
      ])
    )
  ),

  // Error endpoints
  http.get(`${BASE_URL}/__forbidden`, () => new HttpResponse(null, { status: 403 })),
  http.get(`${BASE_URL}/__ratelimit`, () => new HttpResponse(null, { status: 429, headers: { 'retry-after': '0' } })),

  // 401-then-200 to validate refresh-on-401
  (() => {
    let calls = 0;
    return http.get(`${BASE_URL}/__refresh_test`, () => {
      calls++;
      if (calls === 1) return new HttpResponse(null, { status: 401 });
      return HttpResponse.json(pagedEnvelope([{ id: 'after-refresh' }]));
    });
  })(),
];
