/**
 * MSW handlers mocking the Spanning Cloud Backup API.
 *
 * All three platform base URLs are mocked so we can verify platform → URL
 * resolution. Header presence is asserted via {@link recordedHeaders}.
 */

import { http, HttpResponse } from 'msw';

const M365 = 'https://o365-api.spanningbackup.com/external';
const GWS = 'https://api.spanningbackup.com/external';
const SF = 'https://salesforce-api.spanningbackup.com';

interface RestoreRecord {
  id: string;
  userId: string;
  service: string;
  status: string;
  pollsRemainingBeforeTerminal: number;
  terminalStatus: string;
  error?: string;
}

const restores = new Map<string, RestoreRecord>();

/** Captured headers from the most recent request — used to assert auth. */
export const recordedHeaders: { last: Record<string, string> } = { last: {} };

function record(req: Request): void {
  const obj: Record<string, string> = {};
  req.headers.forEach((v, k) => {
    obj[k.toLowerCase()] = v;
  });
  recordedHeaders.last = obj;
}

export function resetMockState(): void {
  restores.clear();
  recordedHeaders.last = {};
}

export const handlers = [
  // ---------- M365 ----------

  // Users — paginated across two pages
  http.get(`${M365}/users`, ({ request }) => {
    record(request);
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor');
    if (!cursor) {
      return HttpResponse.json({
        items: [
          { id: 'u1', email: 'a@acme.com' },
          { id: 'u2', email: 'b@acme.com' },
        ],
        next: 'page-2',
      });
    }
    if (cursor === 'page-2') {
      return HttpResponse.json({
        items: [{ id: 'u3', email: 'c@acme.com' }],
        next: null,
      });
    }
    return HttpResponse.json({ items: [], next: null });
  }),

  http.get(`${M365}/users/u1`, ({ request }) => {
    record(request);
    return HttpResponse.json({ id: 'u1', email: 'a@acme.com', displayName: 'Alice' });
  }),

  // Services
  http.get(`${M365}/users/u1/services`, ({ request }) => {
    record(request);
    return HttpResponse.json({
      items: [
        { name: 'mail', enabled: true },
        { name: 'drive', enabled: true },
        { name: 'calendar', enabled: true },
      ],
      next: null,
    });
  }),

  // Backups
  http.get(`${M365}/users/u1/services/mail/backups`, ({ request }) => {
    record(request);
    return HttpResponse.json({
      items: [
        { id: 'b1', userId: 'u1', service: 'mail', startedAt: '2026-04-30T00:00:00Z', status: 'success' },
        { id: 'b2', userId: 'u1', service: 'mail', startedAt: '2026-04-29T00:00:00Z', status: 'success' },
      ],
      next: null,
    });
  }),

  // Restores — POST queues
  http.post(`${M365}/users/:userId/services/:service/restores`, ({ request, params }) => {
    record(request);
    const userId = String(params['userId']);
    const service = String(params['service']);
    if (userId === 'user-conflict') {
      return HttpResponse.json(
        { message: 'Restore already in progress for these items' },
        { status: 409 }
      );
    }
    const id = `r-${Math.random().toString(36).slice(2, 8)}`;
    restores.set(id, {
      id,
      userId,
      service,
      status: 'queued',
      pollsRemainingBeforeTerminal: 1,
      terminalStatus: 'completed',
    });
    return HttpResponse.json({ id, userId, service, status: 'queued' });
  }),

  // Restores — GET polls
  http.get(`${M365}/restores/:restoreId`, ({ request, params }) => {
    record(request);
    const restoreId = String(params['restoreId']);
    const rec = restores.get(restoreId);
    if (!rec) {
      return HttpResponse.json({ message: 'Restore not found' }, { status: 404 });
    }
    if (rec.pollsRemainingBeforeTerminal > 0) {
      rec.pollsRemainingBeforeTerminal -= 1;
      rec.status = 'running';
    } else {
      rec.status = rec.terminalStatus;
    }
    return HttpResponse.json({ ...rec });
  }),

  // Audit
  http.get(`${M365}/audit`, ({ request }) => {
    record(request);
    return HttpResponse.json({
      items: [{ id: 'a1', timestamp: '2026-04-30T00:00:00Z', action: 'backup' }],
      next: null,
    });
  }),

  // License
  http.get(`${M365}/license`, ({ request }) => {
    record(request);
    return HttpResponse.json({ platform: 'm365', purchasedSeats: 100, usedSeats: 42 });
  }),

  // Error fixtures (mounted on /users/<sentinel>)
  http.get(`${M365}/users/UNAUTH`, ({ request }) => {
    record(request);
    return HttpResponse.json({ message: 'unauthorized' }, { status: 401 });
  }),
  http.get(`${M365}/users/FORBIDDEN`, ({ request }) => {
    record(request);
    return HttpResponse.json({ message: 'forbidden' }, { status: 403 });
  }),
  http.get(`${M365}/users/MISSING`, ({ request }) => {
    record(request);
    return HttpResponse.json({ message: 'not found' }, { status: 404 });
  }),
  http.get(`${M365}/users/RATE_LIMITED`, ({ request }) => {
    record(request);
    return HttpResponse.json(
      { message: 'rate limited' },
      { status: 429, headers: { 'Retry-After': '0' } }
    );
  }),
  http.get(`${M365}/users/SERVER_ERROR`, ({ request }) => {
    record(request);
    return HttpResponse.json({ message: 'boom' }, { status: 500 });
  }),

  // ---------- GWS ----------

  http.get(`${GWS}/users`, ({ request }) => {
    record(request);
    return HttpResponse.json({
      items: [{ id: 'gws-1', email: 'g@acme.com' }],
      next: null,
    });
  }),

  // ---------- Salesforce ----------

  http.get(`${SF}/users`, ({ request }) => {
    record(request);
    return HttpResponse.json({
      items: [{ id: '0051a000001abcdAAA', email: 'sf@acme.com' }],
      next: null,
    });
  }),
];
