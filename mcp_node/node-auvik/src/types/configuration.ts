export interface ConfigurationInfo {
  id: string;
  backupDate?: string;
  configType?: string;
  hasBackup?: boolean;
  lastBackupTime?: string;
  runningConfig?: boolean;
  configSize?: number;
  deviceId?: string;
  retrievalStatus?: 'success' | 'failed' | 'pending' | 'not-applicable';
}