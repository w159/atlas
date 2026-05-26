export interface BillingUsageClient {
  id: string;
  tenantId?: string;
  tenantName?: string;
  clientName?: string;
  period?: string;
  deviceCount?: number;
  billableDeviceCount?: number;
  networkDeviceCount?: number;
  serverDeviceCount?: number;
  workstationDeviceCount?: number;
  otherDeviceCount?: number;
  totalCost?: number;
}

export interface BillingUsageDevice {
  id: string;
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
  tenantId?: string;
  period?: string;
  billable?: boolean;
  cost?: number;
  lastSeenTime?: string;
}