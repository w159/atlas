/**
 * Device fixtures
 */

import type {
  Device,
  DeviceActivityListResponse,
  DeviceService,
  DeviceSoftware,
  DeviceInventory,
} from '../../src/types/devices.js';

export const list: Device[] = [
  {
    id: 101,
    organizationId: 1,
    nodeClass: 'WINDOWS_WORKSTATION',
    displayName: 'DESKTOP-001',
    status: 'ONLINE',
    system: {
      name: 'DESKTOP-001',
      manufacturer: 'Dell',
      model: 'OptiPlex 7090',
      serialNumber: 'ABC123',
    },
    os: {
      name: 'Windows 11 Pro',
      version: '10.0.22621',
      architecture: '64-bit',
    },
    lastContact: 1704153600000,
    createTime: 1704067200000,
    updateTime: 1704153600000,
  },
  {
    id: 102,
    organizationId: 1,
    nodeClass: 'WINDOWS_SERVER',
    displayName: 'SERVER-001',
    status: 'ONLINE',
    system: {
      name: 'SERVER-001',
      manufacturer: 'HP',
      model: 'ProLiant DL380',
      serialNumber: 'XYZ789',
    },
    os: {
      name: 'Windows Server 2022',
      version: '10.0.20348',
      architecture: '64-bit',
    },
    lastContact: 1704153600000,
    createTime: 1704067200000,
    updateTime: 1704153600000,
  },
];

export const single: Device = list[0]!;

export const updated: Device = {
  ...single,
  displayName: 'DESKTOP-001-UPDATED',
  updateTime: Date.now(),
};

export const activities: DeviceActivityListResponse = {
  activities: [
    {
      id: 1001,
      deviceId: 101,
      type: 'AGENT',
      status: 'SUCCESS',
      message: 'Agent check-in successful',
      time: 1704153600000,
      severity: 'NONE',
    },
    {
      id: 1002,
      deviceId: 101,
      type: 'PATCH_MANAGEMENT',
      status: 'PENDING',
      message: 'Windows Update KB5034441 pending installation',
      time: 1704150000000,
      severity: 'MINOR',
    },
  ],
};

export const services: DeviceService[] = [
  {
    name: 'Spooler',
    displayName: 'Print Spooler',
    state: 'RUNNING',
    startType: 'AUTO',
    serviceAccount: 'LocalSystem',
  },
  {
    name: 'wuauserv',
    displayName: 'Windows Update',
    state: 'RUNNING',
    startType: 'MANUAL',
    serviceAccount: 'LocalSystem',
  },
];

export const software: DeviceSoftware[] = [
  {
    name: 'Microsoft Office 365',
    publisher: 'Microsoft Corporation',
    version: '16.0.17126.20132',
    installDate: 1704067200000,
  },
  {
    name: 'Google Chrome',
    publisher: 'Google LLC',
    version: '120.0.6099.224',
    installDate: 1704067200000,
  },
];

export const inventory: DeviceInventory = {
  processors: [
    {
      name: 'Intel Core i7-12700',
      manufacturer: 'Intel',
      architecture: 'x64',
      clockSpeed: 2100,
      cores: 12,
      logicalProcessors: 20,
    },
  ],
  memory: {
    totalRam: 34359738368,
    availableRam: 17179869184,
    usagePercent: 50,
  },
  disks: [
    {
      name: 'Samsung SSD 980 PRO',
      driveLetter: 'C:',
      totalSize: 1000204886016,
      freeSpace: 500102443008,
      fileSystem: 'NTFS',
    },
  ],
};
