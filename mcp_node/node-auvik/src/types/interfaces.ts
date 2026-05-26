export interface InterfaceInfo {
  id: string;
  interfaceName?: string;
  interfaceType?: string;
  interfaceStatus?: 'up' | 'down' | 'dormant' | 'unknown';
  adminStatus?: 'up' | 'down' | 'testing';
  macAddress?: string;
  description?: string;
  speed?: number;
  duplex?: 'full' | 'half' | 'unknown';
  mtu?: number;
  lastChange?: string;
  ifIndex?: number;
  deviceId?: string;
  ipAddresses?: string[];
}