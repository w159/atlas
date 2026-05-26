---
name: risk-heatmap
description: Build a current risk heatmap across users and groups with 90-day trend deltas. Use when user asks for "risk overview", "who's risky", "risk trending", or before QBRs.
---

# Risk Heatmap (KnowBe4)

## Pipeline

1. `knowbe4_reporting_risk_overview` — account-level baseline.
2. `knowbe4_groups_list` then **parallel** `knowbe4_groups_risk_score_history` (concurrency 6).
3. **Top-risk drilldown**: `knowbe4_users_list` filter group, parallel `knowbe4_users_risk_score_history` for top-50 risk score.
4. **In `ctx_execute`**:
   - Compute 30/60/90d deltas per user and group.
   - Identify "trending worse" (delta > +5) and "trending better" (delta < -5).
5. **Output**:
   - Heatmap grid (group × risk bucket).
   - Top 10 newly-risky users.
   - Top 10 most-improved (for QBR storytelling).

## Performance

- All history calls must run concurrently. Aggregation strictly in code.
