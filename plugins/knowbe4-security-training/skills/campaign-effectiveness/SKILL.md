---
name: campaign-effectiveness
description: Measure pre vs post training campaign risk-score deltas to quantify training ROI. Use when user asks "did training work", "campaign ROI", or for QBR evidence.
---

# Campaign Effectiveness (KnowBe4)

## Pipeline

1. Resolve campaign: `knowbe4_training_campaigns_list` → pick by name or most recent.
2. `knowbe4_training_campaigns_get` for date window.
3. `knowbe4_training_enrollments_list` for the campaign.
4. **Parallel** `knowbe4_users_risk_score_history` for every enrollee.
5. **In `ctx_execute`**:
   - Compute risk score at campaign_start, campaign_end, +30d, +60d.
   - Compute group-level mean delta.
   - Compare completers vs non-completers (control-ish).
6. **Output**:
   - Headline: "Risk dropped X points for completers vs Y for non-completers."
   - Per-group breakdown.
   - Modules associated with biggest improvement.
