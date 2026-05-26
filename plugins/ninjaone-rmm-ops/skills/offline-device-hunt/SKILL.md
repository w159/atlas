---
name: offline-device-hunt
description: Find devices that haven't checked in within a threshold across all orgs, classify as transient vs persistent vs decommissioned. Use when user asks "what's offline", "stale devices", or for quarterly cleanup.
---

# Offline Device Hunt (NinjaOne)

## Pipeline

1. `ninjaone_organizations_list`.
2. Parallel per org: `ninjaone_organizations_devices` with fields incl. `last_contact`.
3. **In `ctx_execute`**:
   - Bucket: <1h ok, 1-24h transient, 1-7d persistent, 7-30d candidate-stale, >30d decommission candidate.
4. **Output**:
   - Per-org table with counts per bucket.
   - Targeted action lists: which to ticket vs which to retire.
   - Total reclaimable license count if decommissioned.
