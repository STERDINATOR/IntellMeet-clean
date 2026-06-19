# Phase 1 — Enterprise Foundations (RBAC/ABAC + Universal Audit + ERD alignment)

Status: initializing implementation.

Goals:
- Align persistence layer to the full ERD.
- Add fine-grained authorization (RBAC + ABAC) with tenant scoping.
- Add universal audit logging persisted for REST writes and realtime actions.

Modules to introduce:
- `/enterprise/authz/` RBAC/ABAC policy evaluation
- `/enterprise/audit/` persisted audit log writer + middleware
- `/enterprise/integrity/` FK integrity checks for service-level writes

Next tasks:
1. Expand `Backend/src/models.ts` (and/or refactor into separate model modules) to include missing ERD entities/relationships.
2. Wire authorization guards into every mutating endpoint in routes.
3. Add socket event authorization + audit persistence.

