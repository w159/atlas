/**
 * Backup service types — the per-user services that Spanning protects
 * (mail, drive, calendar, contacts, sites, etc.).
 */

export type SpanningServiceName =
  | 'mail'
  | 'drive'
  | 'calendar'
  | 'contacts'
  | 'sites'
  | 'teams'
  // eslint-disable-next-line @typescript-eslint/ban-types -- (string & {}) preserves literal autocomplete
  | (string & {});

export interface SpanningService {
  name: SpanningServiceName;
  enabled?: boolean;
  lastBackupAt?: string;
  itemCount?: number;
  [key: string]: unknown;
}
