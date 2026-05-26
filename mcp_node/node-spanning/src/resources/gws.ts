/**
 * Google Workspace placeholder resource.
 *
 * The shape of GWS endpoints is similar to M365 but URL paths differ slightly;
 * tracking the upstream OpenAPI spec was out of scope for the initial cut.
 *
 * Calling any method here will throw {@link NotImplementedError}. Full GWS
 * support is planned — until then, instantiate the client with
 * `platform: 'gws'` and use the generic resources via `client.users` /
 * `client.backups` / etc., which already work against the GWS base URL.
 */

import { NotImplementedError } from '../errors.js';

export class GwsResource {
  /** Reserved for future GWS-specific helpers. */
  notImplemented(): never {
    throw new NotImplementedError(
      'GWS-specific helpers are not yet implemented. The generic users / services / backups / restores / audit / license resources work against the Google Workspace base URL when the client is configured with platform: "gws".'
    );
  }
}
