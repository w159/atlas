---
name: cross-platform-incident
description: Unified incident response that correlates a single symptom across Auvik (network), NinjaOne (RMM), CIPP (M365), ThreatLocker (endpoint), and produces a single root-cause hypothesis with action plan. Use when user says "investigate incident X", "everything is broken at client Y", or during active IR.
---

# Cross-Platform Incident Response

The MSP "war room in one skill." Given a client + time window, correlates events across all telemetry sources.

## Pipeline

### Phase 1 — Resolve client across platforms (parallel, see `client-360`).

### Phase 2 — Time-bounded telemetry pull (parallel, concurrency 8)
- Auvik: `auvik_alerts_list` window + `auvik_statistics_*` for top devices
- NinjaOne: `ninjaone_alerts_list` window + `ninjaone_devices_activities` for affected hosts
- ThreatLocker: `threatlocker_audit_search` window action_type=blocked + `threatlocker_approvals_list` pending
- CIPP: `cipp_list_audit_logs` window (signIn, directory changes)
- ConnectWise: `cw_search_tickets` opened in window

### Phase 3 — Timeline reconstruction (`ctx_execute`)
- Merge all events on a unified timeline.
- Detect causality: 1st-event-by-time → downstream effects.
- Common patterns the code should classify:
  - **Network outage**: Auvik first, then Ninja device-offline storm.
  - **Endpoint compromise**: TL blocks → CIPP suspicious signin → Ninja activity anomaly.
  - **M365 outage**: CIPP-only, no Ninja/Auvik signal.
  - **Misconfig**: Auvik config change → downstream symptoms.

### Phase 4 — Output
- Root cause hypothesis (with confidence %).
- Supporting evidence (3-5 events with timestamps).
- Recommended immediate actions (per platform).
- Suggested CW ticket draft with full timeline.

## Rules

- Never propose write actions automatically — output a numbered action list for user approval.
- Always cap timeline at 200 events; over that, summarize buckets and let user drill down.
