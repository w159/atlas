---
name: phishing-failure-cohort
description: Identify users who failed recent phishing security tests and cross-reference their training enrollment/completion status to find coverage gaps. Use when user asks "who failed phishing", "training gap analysis", or after a PST campaign concludes.
---

# Phishing Failure Cohort (KnowBe4)

## Pipeline

1. `knowbe4_phishing_security_tests_list` (last 90d).
2. **Parallel** per PST: `knowbe4_phishing_security_test_recipients` filter `failed=true`.
3. Deduplicate failing users.
4. **Cross-ref training in parallel**:
   - For each failing user: `knowbe4_training_enrollments_list` filter userId.
5. **In `ctx_execute`**:
   - Classify: failed phishing AND no relevant training enrolled = highest priority.
   - Failed phishing AND training incomplete = medium.
   - Failed phishing AND training complete = bad fit — recommend module change.
6. **Output**:
   - Tier 1: enroll now (with recommended module).
   - Tier 2: chase completion.
   - Tier 3: revise curriculum.
   - Group-level rollup so MSP can talk to client by department.
