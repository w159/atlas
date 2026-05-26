export interface DeviceInfo {
  id: string;
  deviceType?: string;
  deviceName?: string;
  ipAddresses?: string[];
  macAddress?: string;
  lastSeenTime?: string;
  discoverTime?: string;
  firstSeenTime?: string;
  makeModel?: string;
  firmwareVersion?: string;
  operatingSystem?: string;
  serialNumber?: string;
  modelNumber?: string;
  description?: string;
  vendor?: string;
  location?: string;
  manageStatus?: 'unmanaged' | 'managed' | 'privileged';
  onlineStatus?: 'online' | 'offline' | 'unreachable';
  deviceStatus?: 'up' | 'down' | 'unknown';
}

export interface DeviceDetails extends DeviceInfo {
  parentDevice?: string;
  rootDevice?: string;
  devicePrimaryIp?: string;
  systemObjectId?: string;
  snmpSysName?: string;
  snmpSysLocation?: string;
  snmpSysDescr?: string;
  snmpSysContact?: string;
  snmpSysUpTime?: number;
  networkPrimaryIp?: string;
  remotelySupportable?: boolean;
}

export interface DeviceWarranty {
  id: string;
  warrantyExpired?: boolean;
  warrantyExpiryDate?: string;
  supportExpired?: boolean;
  supportExpiryDate?: string;
  supportLevel?: string;
}

export interface DeviceLifecycle {
  id: string;
  endOfLife?: boolean;
  endOfLifeDate?: string;
  endOfSale?: boolean;
  endOfSaleDate?: string;
  endOfSupport?: boolean;
  endOfSupportDate?: string;
}