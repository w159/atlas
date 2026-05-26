/**
 * User (backed-up M365 / GWS / Salesforce account) types.
 */

export interface SpanningUser {
  id: string;
  email?: string;
  displayName?: string;
  status?: string;
  licensed?: boolean;
  lastBackupAt?: string;
  [key: string]: unknown;
}
