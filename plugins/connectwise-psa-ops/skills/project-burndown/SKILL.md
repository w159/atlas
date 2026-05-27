---
name: project-burndown
description: Burn-down and health analysis for a ConnectWise project: phases, tickets, time spent vs. budget, ETA projection. Use when user asks "how's project X going", "is project Y on track", "project status update".
---

# Project Burn-Down (ConnectWise)

## Pipeline

1. `cw_get_project` for the named project (resolve by name if needed via `cw_search_projects`).
2. **Parallel**:
   - `cw_search_project_tickets` filter by `projectId` (phases inferred from ticket phase field)
   - `cw_search_time_entries` filter by `projectId`
3. **Compute**:
   - Hours_spent vs. budgeted_hours per phase.
   - Velocity = closed_tickets / week last 4 weeks.
   - ETA = open_remaining / velocity, vs. due_date.
   - Risk: ETA > due_date OR hours_spent > 80% with <80% tickets closed.
4. **Output**:
   - Status: GREEN/YELLOW/RED with one-line reason.
   - Burn-down ascii chart (week-by-week).
   - Top 5 blockers (open tickets oldest first).
   - Recommended action.
