/**
 * Backup run types — one record per day per service per user.
 */

// eslint-disable-next-line @typescript-eslint/ban-types -- (string & {}) preserves literal autocomplete
export type BackupStatus = 'success' | 'partial' | 'failed' | (string & {});

export interface SpanningBackup {
  id: string;
  userId: string;
  service: string;
  startedAt: string;
  completedAt?: string;
  status: BackupStatus;
  itemCount?: number;
  [key: string]: unknown;
}
