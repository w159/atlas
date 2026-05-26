---
name: full-offboard
description: Execute a complete M365 user offboarding playbook with evidence capture and rollback bundle. Use when user says "offboard X", "terminate user", "employee departure for tenant Y".
---

# Full Offboard (CIPP)

**Destructive. Confirm each phase.**

## Pipeline

### Phase 1 — Capture (read-only, parallel)
- `cipp_list_user_groups`, `cipp_list_user_devices`, `cipp_list_mailbox_permissions`, `cipp_list_mfa_users` (filter user)
- Save snapshot to `~/.tech-agent/cipp/offboard/<tenant>/<upn>-<timestamp>.json` for rollback evidence.

### Phase 2 — Mailbox handling (confirm options)
- Ask user: convert to shared? forward to manager? out-of-office message? grant delegate? retention duration?
- Execute via `cipp_set_out_of_office`, `cipp_set_email_forwarding`, mailbox permission delegation.

### Phase 3 — Identity lockdown (serial, confirm each)
1. `cipp_revoke_sessions`
2. `cipp_disable_user`
3. `cipp_reset_password` (random) — needed for some tenants before disable
4. `cipp_offboard_user` (CIPP's bundled offboard if granular control not needed)

### Phase 4 — Cleanup
- Remove from non-distribution groups (preserve mail-enabled until handover done).
- Reclaim licenses (note in output — license removal is a follow-up action).

### Phase 5 — Documentation
- Output run-book of what was done + the snapshot path for rollback.
- If `connectwise-psa-ops` present, create a ticket with full audit trail.

## Rules

- NEVER skip Phase 1 snapshot.
- ALWAYS keep mailbox accessible (shared or forwarded) before disabling unless user explicitly says otherwise.
