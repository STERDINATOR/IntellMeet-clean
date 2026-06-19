# AuthZ (RBAC/ABAC) — Phase 1

This module introduces a centralized authorization contract and enforcement middleware.

Current repo status:
- Existing DB persistence includes `User.role` (admin/manager/member).
- Full ERD authorization entities (roles/permissions/user-role mappings/policy rules) are not yet present.

So this phase implements:
- A policy evaluation contract (`policy.ts`)
- Middleware (`requireAuthz`) that authorizes based on current role

Once the full ERD authz entities are added, the evaluator can be upgraded to load persisted policies.

