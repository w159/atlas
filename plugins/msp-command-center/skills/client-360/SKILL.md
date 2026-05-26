---
name: client-360
description: Build a complete 360° profile of a single client across every MSP platform in parallel — tickets, devices, alerts, M365 health, training risk, zero-trust posture. Use when user asks "tell me everything about client X", before QBRs, or when responding to a customer call.
---

# Client 360°

## Pipeline

Input: client name. Resolve to platform-specific IDs in parallel:
- ConnectWise: `cw_search_companies`
- CIPP: `cipp_list_tenants` then match by display name/domain
- NinjaOne: `ninjaone_organizations_list` then match
- Auvik: `auvik_tenants_list`
- ThreatLocker: `threatlocker_organizations_list_children`
- KnowBe4: `knowbe4_account_get` (only if separate account per client) or `knowbe4_groups_list` filter

**Phase 2 — Massively parallel per platform** (single message, concurrency 8):
- CW: open tickets, project list, last 30d time entries
- CIPP: tenant alignment + drift + alert queue + license usage
- Ninja: device count, alerts active, offline devices
- Auvik: device inventory, open alerts, last 24h stats
- TL: pending approvals, recent blocks, computer count
- KnowBe4: group risk score history, recent phishing failures

**Phase 3 — Synthesize in `ctx_execute`**:
- Service-health score 0-100.
- "What's on fire right now" list.
- "Notable wins" (closed tickets last 30d, training improvements).
- Recommended QBR talking points.

**Output**: 1-page client snapshot, then a deep-dive section per platform.

## Rules

- Always pull in parallel. A 6-platform serial pull is ~60s; parallel is ~10s.
- Use cached resolution map at `~/.tech-agent/msp/client_id_map.json` keyed by client name.
