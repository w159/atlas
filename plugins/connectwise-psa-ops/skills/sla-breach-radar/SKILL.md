---
name: sla-breach-radar
description: Scan all open ConnectWise tickets for at-risk or breached SLAs with a per-customer rollup. Use when user asks "what's about to breach SLA", "any tickets in jeopardy", or hourly via /loop.
---

# SLA Breach Radar (ConnectWise)

## Pipeline

1. `cw_search_tickets` open, fields: id, summary, sla, dateEntered, lastUpdated, respondedFlag, resolvedFlag, company, priority, status.
2. **In code** (`ctx_execute`):
   - Compute `time_to_respond_remaining`, `time_to_plan_remaining`, `time_to_resolve_remaining` per SLA profile.
   - Bucket: BREACHED, <1h, <4h, <24h, healthy.
3. Per breached/risk ticket: `cw_get_ticket_notes` last 3 entries — surface whether tech is engaged.
4. **Output**:
   - "Hot list" — tickets needing action in the next hour.
   - Per-customer rollup of breach counts.
   - Worst owner — highest count of at-risk tickets (no shaming, factual).

## Loop usage

- Designed to be invoked via `/loop 1h /cw-sla-radar`. Maintain a small cache at `~/.tech-agent/cw/last_breach.json` to only re-alert when state changes.
