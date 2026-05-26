---
name: fleet-health-sweep
description: One-pass fleet health sweep across every NinjaOne organization — alerts, offline devices, failing services, stale agents. Use when user says "fleet status", "morning RMM check", "any fires".
---

# Fleet Health Sweep (NinjaOne)

## Pipeline

1. `ninjaone_organizations_list`.
2. **Parallel per org** (concurrency 6):
   - `ninjaone_alerts_summary`
   - `ninjaone_organizations_devices`
3. **Per device (top problem orgs only, top-20)**:
   - `ninjaone_devices_get` to get last_contact, OS, agent_version
4. **In `ctx_execute`**:
   - Score org: open_alerts (×3) + offline_devices_>24h (×2) + agent_stale (×1).
   - Surface devices offline >7d (likely decommissioned, recommend audit).
5. **Output**:
   - Worst-5 orgs with top 3 issues each.
   - Stale-agent list (one shot remediation candidates).
   - Healthy section.

## Performance

- Skip per-device deep fetches on healthy orgs.
- Cache last sweep at `~/.tech-agent/ninja/lastsweep.json` for delta reporting.
