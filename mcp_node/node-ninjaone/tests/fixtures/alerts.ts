/**
 * Alert fixtures
 */

import type { Alert } from '../../src/types/alerts.js';

export const list: Alert[] = [
  {
    uid: 'alert-uid-001',
    id: 2001,
    deviceId: 101,
    organizationId: 1,
    message: 'CPU usage exceeded 90%',
    severity: 'MAJOR',
    sourceType: 'CPU',
    status: 'OPEN',
    createTime: 1704153600000,
  },
  {
    uid: 'alert-uid-002',
    id: 2002,
    deviceId: 102,
    organizationId: 1,
    message: 'Disk space below 10%',
    severity: 'CRITICAL',
    sourceType: 'DISK_SPACE',
    status: 'OPEN',
    createTime: 1704150000000,
  },
];

export const single: Alert = list[0]!;
