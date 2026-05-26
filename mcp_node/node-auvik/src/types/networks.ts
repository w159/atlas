export interface NetworkInfo {
  id: string;
  networkType?: string;
  networkName?: string;
  ipAddress?: string;
  subnetMask?: string;
  networkAddress?: string;
  broadcastAddress?: string;
  defaultGateway?: string;
  vlanId?: number;
  description?: string;
  dhcpEnabled?: boolean;
  scope?: 'internal' | 'external' | 'unknown';
  networkScanEnabled?: boolean;
}

export interface NetworkDetails extends NetworkInfo {
  primaryCollector?: string;
  networkPrimaryIp?: string;
  deviceCount?: number;
  discoveredDeviceCount?: number;
  deviceOnlineCount?: number;
  deviceOfflineCount?: number;
}