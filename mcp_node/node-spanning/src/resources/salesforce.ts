/**
 * Salesforce placeholder resource.
 *
 * Salesforce backup endpoints share the same authentication / pagination
 * pattern as M365 / GWS but operate on Salesforce object IDs (15- or
 * 18-character, case-sensitive Salesforce-flavored IDs — NOT the
 * user-friendly identifiers from M365 / GWS).
 *
 * Type the `userId` parameter as a {@link SalesforceObjectId} when wiring
 * Salesforce-specific helpers.
 *
 * Calling any method here will throw {@link NotImplementedError}. Full
 * Salesforce support is planned — until then, instantiate the client with
 * `platform: 'salesforce'` and use the generic resources via `client.users`
 * / `client.backups` / etc., which already work against the Salesforce base
 * URL.
 */

import { NotImplementedError } from '../errors.js';

/** A 15- or 18-character Salesforce object ID. */
export type SalesforceObjectId = string;

export class SalesforceResource {
  /** Reserved for future Salesforce-specific helpers. */
  notImplemented(): never {
    throw new NotImplementedError(
      'Salesforce-specific helpers are not yet implemented. The generic users / services / backups / restores / audit / license resources work against the Salesforce base URL when the client is configured with platform: "salesforce".'
    );
  }
}
