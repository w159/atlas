import { http, HttpResponse } from 'msw';

const BASE_URL = 'https://api.blumira.com/public-api/v1';

export const handlers = [
  // Health
  http.get(`${BASE_URL}/health`, () => {
    return HttpResponse.json({
      status: 'OK',
      data: {
        api_name: 'Blumira Public API',
        build_time: '2024-03-27T16:22:03Z',
        commit_hash: 'oe5d4300',
      },
    });
  }),

  // Findings list
  http.get(`${BASE_URL}/org/findings`, () => {
    return HttpResponse.json({
      status: 'OK',
      data: [
        {
          finding_id: 'aaa-111',
          short_id: 'F-24-01-ABCD',
          name: 'Active Directory Domain Admin Created',
          analysis: 'Detected suspicious activity.',
          status: 10,
          status_name: 'Open',
          priority: 4,
          type_name: 'Suspect',
          org_id: 'org-001',
          org_name: 'Test Org',
          created: '2024-01-15T10:00:00.000',
          modified: '2024-01-15T12:00:00.000',
        },
      ],
      meta: { page: 1, page_size: 100, total_items: 1, total_pages: 1 },
      links: { self: '/v1/org/findings?page=1', next: null, prev: null },
    });
  }),

  // Finding by ID
  http.get(`${BASE_URL}/org/findings/:findingId`, ({ params }) => {
    return HttpResponse.json({
      status: 'OK',
      data: {
        finding_id: params.findingId,
        short_id: 'F-24-01-ABCD',
        name: 'Active Directory Domain Admin Created',
        analysis: 'Detected suspicious activity.',
        status: 10,
        status_name: 'Open',
        priority: 4,
        type_name: 'Suspect',
        org_id: 'org-001',
        org_name: 'Test Org',
        created: '2024-01-15T10:00:00.000',
        modified: '2024-01-15T12:00:00.000',
      },
    });
  }),

  // Finding comments
  http.get(`${BASE_URL}/org/findings/:findingId/comments`, () => {
    return HttpResponse.json([
      {
        id: 'comm-001',
        body: '<p>Investigation started</p>',
        age: 3600,
        sender: { id: 'user-001', email: 'user@example.com', first_name: 'Jane', last_name: 'Doe' },
      },
    ]);
  }),

  // Resolve finding
  http.post(`${BASE_URL}/org/findings/:findingId/resolve`, () => {
    return HttpResponse.json({ status: 'OK' });
  }),

  // Assign owners
  http.post(`${BASE_URL}/org/findings/:findingId/assign`, () => {
    return HttpResponse.json({ status: 'OK' });
  }),

  // Add comment
  http.post(`${BASE_URL}/org/findings/:findingId/comments`, () => {
    return HttpResponse.json({
      id: 'comm-002',
      body: '<p>New comment</p>',
      age: 0,
      sender: { id: 'user-001', email: 'user@example.com', first_name: 'Jane', last_name: 'Doe' },
    });
  }),

  // Devices
  http.get(`${BASE_URL}/org/agents/devices`, () => {
    return HttpResponse.json({
      status: 'OK',
      data: [
        {
          device_id: 'dev-001',
          hostname: 'ws001',
          arch: 'amd64',
          plat: 'windows',
          description: null,
          is_domain_controller: false,
          is_excluded: false,
          is_isolated: false,
          is_sleeping: false,
          isolation_requested: false,
          key_id: 'key-001',
          keyname: 'Production Key',
          org_id: 'org-001',
          alive: '2024-01-15T10:00:00.000',
          created: '2024-01-01T00:00:00.000',
          modified: '2024-01-15T10:00:00.000',
        },
      ],
      meta: { page: 1, page_size: 100, total_items: 1, total_pages: 1 },
      links: { self: '/v1/org/agents/devices?page=1', next: null, prev: null },
    });
  }),

  // Keys
  http.get(`${BASE_URL}/org/agents/keys`, () => {
    return HttpResponse.json({
      status: 'OK',
      data: [
        {
          key_id: 'key-001',
          description: 'Production Key',
          agent_count: 10,
          agent_seat_count: 50,
          org_id: 'org-001',
          created: '2024-01-01T00:00:00.000',
          modified: '2024-01-15T10:00:00.000',
        },
      ],
      meta: { page: 1, page_size: 100, total_items: 1, total_pages: 1 },
      links: { self: '/v1/org/agents/keys?page=1', next: null, prev: null },
    });
  }),

  // Users
  http.get(`${BASE_URL}/org/users`, () => {
    return HttpResponse.json({
      status: 'OK',
      data: [
        {
          id: 'user-001',
          email: 'user@example.com',
          first_name: 'Jane',
          last_name: 'Doe',
          org_roles: [{ role_id: 40, role_name: 'responder' }],
        },
      ],
      meta: { page: 1, page_size: 100, total_items: 1, total_pages: 1 },
      links: { self: '/v1/org/users?page=1', next: null, prev: null },
    });
  }),

  // Resolutions
  http.get(`${BASE_URL}/resolutions`, () => {
    return HttpResponse.json([
      { id: 10, name: 'Valid' },
      { id: 20, name: 'False Positive' },
      { id: 30, name: 'No Action Needed' },
      { id: 40, name: 'Risk Accepted' },
    ]);
  }),

  // MSP Accounts
  http.get(`${BASE_URL}/msp/accounts`, () => {
    return HttpResponse.json({
      status: 'OK',
      data: [
        { account_id: 'acct-001', name: 'Client Alpha', open_findings: 5 },
        { account_id: 'acct-002', name: 'Client Beta', open_findings: 0 },
      ],
      meta: { page: 1, page_size: 100, total_items: 2, total_pages: 1 },
      links: { self: '/v1/msp/accounts?page=1', next: null, prev: null },
    });
  }),

  // MSP Account detail
  http.get(`${BASE_URL}/msp/accounts/:accountId`, ({ params }) => {
    if (params.accountId === 'findings') return undefined as any; // pass through
    return HttpResponse.json({
      status: 'OK',
      data: {
        account_id: params.accountId,
        name: 'Client Alpha',
        open_findings: 5,
        license: 'PRO',
        agent_count_available: 40,
        agent_count_used: 10,
        user_count: 15,
      },
    });
  }),

  // MSP All Findings
  http.get(`${BASE_URL}/msp/accounts/findings`, () => {
    return HttpResponse.json({
      status: 'OK',
      data: [
        {
          finding_id: 'msp-f-001',
          short_id: 'F-24-02-MSP1',
          name: 'Brute Force Login Attempt',
          analysis: 'Multiple failed login attempts detected.',
          status: 10,
          status_name: 'Open',
          priority: 3,
          type_name: 'Threat',
          org_id: 'acct-001',
          org_name: 'Client Alpha',
          created: '2024-01-20T08:00:00.000',
          modified: '2024-01-20T08:30:00.000',
        },
      ],
      meta: { page: 1, page_size: 100, total_items: 1, total_pages: 1 },
      links: { self: '/v1/msp/accounts/findings?page=1', next: null, prev: null },
    });
  }),

  // MSP Account Findings
  http.get(`${BASE_URL}/msp/accounts/:accountId/findings`, () => {
    return HttpResponse.json({
      status: 'OK',
      data: [],
      meta: { page: 1, page_size: 100, total_items: 0, total_pages: 0 },
      links: { self: '/v1/msp/accounts/acct-001/findings?page=1', next: null, prev: null },
    });
  }),

  // MSP Account Users
  http.get(`${BASE_URL}/msp/accounts/:accountId/users`, () => {
    return HttpResponse.json({
      status: 'OK',
      data: [],
      meta: { page: 1, page_size: 100, total_items: 0, total_pages: 0 },
      links: { self: '/v1/msp/accounts/acct-001/users?page=1', next: null, prev: null },
    });
  }),

  // MSP Account Devices
  http.get(`${BASE_URL}/msp/accounts/:accountId/agents/devices`, () => {
    return HttpResponse.json({
      status: 'OK',
      data: [],
      meta: { page: 1, page_size: 100, total_items: 0, total_pages: 0 },
      links: { self: '', next: null, prev: null },
    });
  }),

  // MSP Account Keys
  http.get(`${BASE_URL}/msp/accounts/:accountId/agents/keys`, () => {
    return HttpResponse.json({
      status: 'OK',
      data: [],
      meta: { page: 1, page_size: 100, total_items: 0, total_pages: 0 },
      links: { self: '', next: null, prev: null },
    });
  }),
];
