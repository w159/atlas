---
name: child-org-rollup
description: Walk the ThreatLocker MSP child-org tree and roll up computer counts, pending approvals, and recent block volume per child org. Use when user asks "TL status across all clients", "which clients have backlog", or for MSP-wide reporting.
---

# Child-Org Rollup (ThreatLocker)

## Pipeline

1. `threatlocker_organizations_list_children` (recurse if hierarchical).
2. **Parallel per child** (concurrency 6):
   - `threatlocker_computers_list` (count only — request limit=1 + pagination meta if API supports)
   - `threatlocker_approvals_pending_count`
   - `threatlocker_audit_search` action_type=blocked, last 24h, limit=1 + total
3. **In `ctx_execute`**:
   - Build table: org, endpoints, pending_approvals, blocks_24h, blocks_per_endpoint.
   - Flag: approvals > 25 (backlog), blocks_per_endpoint > 5 (policy noise or active threat).
4. **Output**: ranked table; top-3 orgs needing attention with one-line reasoning.
