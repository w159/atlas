---
name: utilization-report
description: Compute technician utilization with billable vs non-billable mix, top customers, and stuck-ticket overhead. Use when user asks "utilization report", "how is the team", "billable hours this week".
---

# Utilization Report (ConnectWise)

## Pipeline

1. `cw_members_list` (active only).
2. **Parallel per member** (concurrency 6): `cw_search_time_entries` for the date window the user gave (default last 7 days).
3. **In `ctx_execute`**:
   - Sum hours per member, split billable/non-billable, internal/customer.
   - Compute utilization% against target (default 75%).
   - Identify gaps: members below 50% — possible undertracking vs. underwork.
4. **Output**:
   - Per-member table sorted by utilization desc.
   - Outliers section (over 100% — quality risk; under 40% — investigate).
   - Top 5 customers by hours consumed.

## Performance

- Time-entry queries are expensive; always date-bound and parallelize per member.
