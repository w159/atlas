/**
 * Audit log types.
 */

export interface SpanningAuditEntry {
  id: string;
  timestamp: string;
  actor?: string;
  action?: string;
  target?: string;
  message?: string;
  [key: string]: unknown;
}

/** Date-range params accepted by the audit endpoint. */
export interface AuditListParams {
  /** ISO-8601 start of the range (inclusive). */
  from?: string;
  /** ISO-8601 end of the range (exclusive). */
  to?: string;
}
