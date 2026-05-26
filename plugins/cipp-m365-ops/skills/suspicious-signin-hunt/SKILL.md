---
name: suspicious-signin-hunt
description: Hunt for risky sign-ins across all M365 tenants — impossible travel, legacy auth, MFA gaps, unusual app consents. Use when user asks "any compromised accounts", "weekly signin review", or after a tenant-wide alert.
---

# Suspicious Sign-In Hunt (CIPP)

## Pipeline

1. `cipp_list_tenants`.
2. Per tenant (concurrency 6):
   - `cipp_list_audit_logs` (last 24h, focus signIn category)
   - `cipp_list_mfa_users` (MFA state)
   - `cipp_list_conditional_access_policies`
3. **Detection rules in `ctx_execute`**:
   - Impossible travel: same UPN, geo distance / time gap > 800 km/h.
   - Legacy auth where modern auth available.
   - Sign-ins succeeding without MFA where CA should require it.
   - New OAuth app consents from non-admins.
4. **Output**: ranked list of users to investigate. For top 3, auto-invoke `cipp_bec_check` for follow-on confirmation.

## Performance

- All tenant pulls parallel. Use `ctx_execute` JS for cross-tenant correlation; never feed raw logs to context.
