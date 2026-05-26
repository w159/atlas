/**
 * License types — seats purchased vs. seats used for the connected org.
 */

export interface SpanningLicense {
  platform: string;
  purchasedSeats: number;
  usedSeats: number;
  asOf?: string;
  [key: string]: unknown;
}
