---
name: bec-rapid-response
description: Run the full Business Email Compromise containment playbook for a specific M365 user — BEC check, mailbox forwarding scan, session revoke, MFA reset, password reset, audit log capture. Use when user reports "account compromised", "BEC", "suspicious email forwarding", or "lock down user X".
---

# BEC Rapid Response (CIPP)

**This skill performs DESTRUCTIVE actions. Always confirm each step with the user before executing write tools.**

## Pipeline

### Phase 1 — Evidence (read-only, parallel)
- `cipp_bec_check` for the user
- `cipp_list_audit_logs` filtered to the user, last 7d
- `cipp_list_user_devices`
- `cipp_list_mailbox_permissions` for the user mailbox
- `cipp_list_mfa_users` (confirm MFA state)
- `cipp_list_conditional_access_policies` (confirm coverage)

### Phase 2 — Synthesize
- Score compromise likelihood (forwarding rules, unusual IPs, OAuth grants).
- Output a "kill chain" timeline.

### Phase 3 — Containment (require explicit user "go" per action)
1. `cipp_revoke_sessions` — invalidate active tokens.
2. `cipp_reset_password` — force change.
3. `cipp_reset_mfa` — re-enroll second factor.
4. `cipp_set_email_forwarding` (clear) — remove malicious forward rules.
5. `cipp_disable_user` — only if user/customer requests full lockout.

### Phase 4 — Documentation
- Emit a ConnectWise ticket draft (use `connectwise-psa-ops` if available) with the timeline, actions taken, and recommended follow-ups.

## Performance

- Phase 1 must be one parallel batch.
- Containment actions must be serial and confirmed.
