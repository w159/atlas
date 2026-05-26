/**
 * Ticket fixtures
 */

import type { Ticket, TicketListResponse, TicketComment, TicketForm } from '../../src/types/tickets.js';

export const list: TicketListResponse = {
  tickets: [
    {
      id: 3001,
      ticketNumber: 'TKT-001',
      subject: 'Server maintenance request',
      description: 'Monthly server maintenance needed',
      status: 'OPEN',
      priority: 'MEDIUM',
      organizationId: 1,
      requesterName: 'John Doe',
      requesterEmail: 'john@example.com',
      createTime: 1704067200000,
      updateTime: 1704153600000,
    },
    {
      id: 3002,
      ticketNumber: 'TKT-002',
      subject: 'Network connectivity issue',
      description: 'VPN not connecting',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      organizationId: 1,
      deviceId: 101,
      requesterName: 'Jane Smith',
      requesterEmail: 'jane@example.com',
      assigneeName: 'Tech Support',
      createTime: 1704150000000,
      updateTime: 1704153600000,
    },
  ],
  totalCount: 2,
};

export const single: Ticket = list.tickets[0]!;

export const created: Ticket = {
  id: 3003,
  ticketNumber: 'TKT-003',
  subject: 'New ticket',
  status: 'OPEN',
  priority: 'LOW',
  organizationId: 1,
  createTime: Date.now(),
  updateTime: Date.now(),
};

export const updated: Ticket = {
  ...single,
  subject: 'Updated ticket subject',
  status: 'IN_PROGRESS',
  updateTime: Date.now(),
};

export const comments: TicketComment[] = [
  {
    id: 4001,
    ticketId: 3001,
    authorName: 'Tech Support',
    body: 'Working on this issue.',
    internal: false,
    createTime: 1704153600000,
  },
];

export const commentCreated: TicketComment = {
  id: 4002,
  ticketId: 3001,
  authorName: 'Admin',
  body: 'New comment added.',
  internal: false,
  createTime: Date.now(),
};

export const forms: TicketForm[] = [
  {
    id: 1,
    name: 'Default Form',
    description: 'Default ticket form',
    isDefault: true,
    isActive: true,
    fields: [
      {
        id: 1,
        name: 'priority',
        label: 'Priority',
        type: 'SELECT',
        required: true,
        options: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      },
    ],
  },
];
