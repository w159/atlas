import { http, HttpResponse } from 'msw';

const BASE_URL = 'https://portalapi.g.threatlocker.com/portalapi';

export const handlers = [
  // Computers
  http.post(`${BASE_URL}/Computer/ComputerGetByAllParameters`, () =>
    HttpResponse.json({
      totalItems: 2,
      items: [
        { id: 1, name: 'WORKSTATION-01', domain: 'corp.local', lastSeen: '2024-04-29T10:00:00Z', operatingSystem: 'Windows 10', organizationId: 1 },
        { id: 2, name: 'LAPTOP-02', domain: 'corp.local', lastSeen: '2024-04-29T09:30:00Z', operatingSystem: 'Windows 11', organizationId: 1 },
      ],
    })
  ),

  http.get(`${BASE_URL}/Computer/ComputerGetForEditById`, ({ request }) => {
    const url = new URL(request.url);
    const computerId = url.searchParams.get('computerId');
    return HttpResponse.json({
      id: Number(computerId),
      name: 'WORKSTATION-01',
      domain: 'corp.local',
      lastSeen: '2024-04-29T10:00:00Z',
      operatingSystem: 'Windows 10',
      organizationId: 1,
    });
  }),

  http.post(`${BASE_URL}/ComputerCheckin/ComputerCheckinGetByParameters`, () =>
    HttpResponse.json({
      totalItems: 1,
      items: [
        { id: 1, computerId: 1, checkinTime: '2024-04-29T10:00:00Z', version: '7.1.0', status: 'online' },
      ],
    })
  ),

  // Computer Groups
  http.get(`${BASE_URL}/ComputerGroup/ComputerGroupGetGroupAndComputer`, () =>
    HttpResponse.json({
      groups: [
        { id: 1, name: 'Default Group', description: 'Default computer group', organizationId: 1, computersCount: 5 },
        { id: 2, name: 'Servers', description: 'Server computer group', organizationId: 1, computersCount: 2 },
      ],
    })
  ),

  http.get(`${BASE_URL}/ComputerGroup/ComputerGroupGetDropdownByOrganizationId`, () =>
    HttpResponse.json({
      groups: [
        { id: 1, name: 'Default Group', organizationId: 1 },
        { id: 2, name: 'Servers', organizationId: 1 },
      ],
    })
  ),

  // Approval Requests
  http.post(`${BASE_URL}/ApprovalRequest/ApprovalRequestGetByParameters`, () =>
    HttpResponse.json({
      totalItems: 1,
      items: [
        {
          id: 1,
          applicationName: 'notepad.exe',
          filePath: 'C:\\Windows\\System32\\notepad.exe',
          status: 'pending',
          requestedBy: 'user@corp.local',
          requestedAt: '2024-04-29T09:00:00Z',
          computerId: 1,
          organizationId: 1,
        },
      ],
    })
  ),

  http.get(`${BASE_URL}/ApprovalRequest/ApprovalRequestGetById`, ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('approvalRequestId');
    return HttpResponse.json({
      id: Number(id),
      applicationName: 'notepad.exe',
      filePath: 'C:\\Windows\\System32\\notepad.exe',
      status: 'pending',
      requestedBy: 'user@corp.local',
      requestedAt: '2024-04-29T09:00:00Z',
      computerId: 1,
      organizationId: 1,
    });
  }),

  http.get(`${BASE_URL}/ApprovalRequest/ApprovalRequestGetCount`, () =>
    HttpResponse.json({ count: 5 })
  ),

  http.get(`${BASE_URL}/ApprovalRequest/ApprovalRequestGetPermitApplicationById`, ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('approvalRequestId');
    return HttpResponse.json({
      id: Number(id),
      applicationPath: 'C:\\Windows\\System32\\notepad.exe',
      approvalRequestId: Number(id),
      status: 'approved',
    });
  }),

  // Audit Log
  http.post(`${BASE_URL}/ActionLog/ActionLogGetByParametersV2`, () =>
    HttpResponse.json({
      totalItems: 1,
      items: [
        {
          id: 1,
          actionType: 'application_blocked',
          timestamp: '2024-04-29T09:00:00Z',
          userId: 1,
          computerId: 1,
          description: 'Application blocked by policy',
          details: { application: 'notepad.exe', policy: 'Default Policy' },
        },
      ],
    })
  ),

  http.get(`${BASE_URL}/ActionLog/ActionLogGetByIdV2`, ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('actionLogId');
    return HttpResponse.json({
      id: Number(id),
      actionType: 'application_blocked',
      timestamp: '2024-04-29T09:00:00Z',
      userId: 1,
      computerId: 1,
      description: 'Application blocked by policy',
      details: { application: 'notepad.exe', policy: 'Default Policy' },
    });
  }),

  http.get(`${BASE_URL}/ActionLog/ActionLogGetAllForFileHistoryV2`, () =>
    HttpResponse.json({
      logs: [
        {
          id: 1,
          actionType: 'file_access',
          timestamp: '2024-04-29T09:00:00Z',
          userId: 1,
          computerId: 1,
          description: 'File accessed',
          details: { filePath: 'C:\\Windows\\System32\\notepad.exe' },
        },
      ],
    })
  ),

  // Organizations
  http.post(`${BASE_URL}/Organization/OrganizationGetChildOrganizationsByParameters`, () =>
    HttpResponse.json({
      totalItems: 1,
      items: [
        { id: 2, name: 'Child Org', parentOrganizationId: 1, computersCount: 10 },
      ],
    })
  ),

  http.get(`${BASE_URL}/Organization/OrganizationGetAuthKeyById`, () =>
    HttpResponse.json({
      key: 'auth-key-12345',
      organizationId: 1,
    })
  ),

  http.get(`${BASE_URL}/Organization/OrganizationGetForMoveComputers`, () =>
    HttpResponse.json({
      organizations: [
        { id: 1, name: 'Main Org', computersCount: 20 },
        { id: 2, name: 'Child Org', parentOrganizationId: 1, computersCount: 10 },
      ],
    })
  ),

  // Error responses for testing
  http.post(`${BASE_URL}/test/unauthorized`, () =>
    new HttpResponse(null, { status: 401 })
  ),

  http.post(`${BASE_URL}/test/rate-limit`, () =>
    new HttpResponse(null, { status: 429, headers: { 'retry-after': '1' } })
  ),
];