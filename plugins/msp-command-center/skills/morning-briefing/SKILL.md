---
name: morning-briefing
description: One-page MSP morning briefing pulled in parallel from Auvik, CIPP, ConnectWise, KnowBe4, NinjaOne, and ThreatLocker. Use when user says "morning briefing", "MSP dashboard", "what's on fire", or runs /loop daily.
---

# MSP Morning Briefing

The single most valuable cross-platform skill. Replaces opening 6 dashboards.

## Pipeline

**Phase 1 — Massively parallel fan-out** (one agent message, many tool calls, concurrency 8):

| Platform | Call |
|---|---|
| Auvik | `auvik_alerts_list` open + `auvik_status` |
| CIPP | `cipp_list_tenants` → for each, `cipp_list_alert_queue` + `cipp_get_tenant_drift` |
| ConnectWise | `cw_search_tickets` open + at-risk SLA filter |
| KnowBe4 | `knowbe4_reporting_risk_overview` + `knowbe4_phishing_security_tests_list` last 7d |
| NinjaOne | `ninjaone_alerts_list` active + `ninjaone_organizations_list` |
| ThreatLocker | `threatlocker_approvals_pending_count` per child org |

**Phase 2 — Aggregate in `ctx_execute`**:

- Compute per-platform "fire level" 0-5.
- Cross-correlate: any client with simultaneous Auvik alert + Ninja alert + TL block surge = top of list.
- Diff vs. yesterday's snapshot at `~/.tech-agent/msp/last_briefing.json`.

**Phase 3 — Emit single-page briefing**:

```
🔥 Active fires (cross-platform): ...
⚠️  Today's priorities:
   - Tickets SLA risk: N (top 3)
   - Pending TL approvals: N (top 3 orgs)
   - CIPP tenants drifting: N
   - KnowBe4 newly-risky users: N
✅ Healthy: ...
📈 Trends since yesterday: ...
```

## Rules

- Strict 60-second budget; if Phase 1 still running, return partial with "still pulling X".
- Never include raw JSON. All data through code aggregation.
- Cache snapshot for next run's diff.
