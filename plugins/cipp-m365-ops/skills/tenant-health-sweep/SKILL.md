---
name: tenant-health-sweep
description: One-pass health sweep across every M365 tenant — BPA, domain health, standards drift, alignment, license usage, alert queue. Use when user says "check all tenants", "monthly tenant review", or "what needs attention this morning".
---

# Tenant Health Sweep (CIPP)

## Pipeline

1. `cipp_list_tenants` → tenant IDs.
2. **Massively parallel fan-out** (concurrency 6) per tenant:
   - `cipp_list_bpa`
   - `cipp_list_domain_health`
   - `cipp_get_tenant_drift`
   - `cipp_get_tenant_alignment`
   - `cipp_list_licenses`
   - `cipp_list_alert_queue`
3. **Aggregate in code** (`ctx_execute`):
   - Score each tenant 0-100: BPA fails (×3), drift severity (×2), domain SPF/DKIM/DMARC fail (×3), license over-provision (×1), open alerts (×2).
   - Sort tenants worst-first.
4. **Output**:
   - Top 5 tenants needing attention with the 2-3 most impactful findings each.
   - Bottom section: tenants healthy (one-line each).
   - Surface any newly-failing checks vs. prior run (cache last-run scores in `~/.tech-agent/cipp/lastrun.json`).

## Performance

- Never serialize tenant queries. Always issue all 6 calls per tenant in one batch.
- Skip per-user enumeration in this skill — that's the drilldown phase.

## Hand-off

- For BEC findings → invoke `bec-rapid-response` skill.
- For standards drift remediation → emit a `cipp_create_standard_template` plan, never auto-apply.
