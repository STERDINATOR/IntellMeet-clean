# Phased Enterprise Build

This file tracks the execution plan for transforming the current IntelliMeet repository into a production-grade enterprise AI meeting/collaboration SaaS.

## Phase 0 — Repo contract + route/widget mapping
- [x] Reviewed current repo baseline (Frontend routes + Backend routes/models + docs blueprint)
- [x] Enumerated current Backend REST routers: `auth.routes`, `ai.routes`, `analytics.routes`, `domain.routes`, `user.routes`
- [x] Enumerated current Socket.IO events implemented in `Backend/src/realtime.ts`
- [x] Read core files to establish current API surface and realtime contract
- [ ] Produce UI→API→DB→realtime→audit mapping matrix (against current repo surface area)


## Phase 1 — Data model & backend foundations (ERD → code, RBAC/ABAC, audit)
- [ ] Expand DB models to full ERD (per provided ERD specification)
- [ ] Add RBAC engine (Organization/Role/Permission/UserRole)
- [ ] Add ABAC engine (user.org_id, resource owner/visibility, department/job_title/device/environment context)
- [ ] Implement universal audit logging middleware:
  - [ ] Persist all write operations (CREATE/UPDATE/DELETE/LOGIN/EXPORT/SHARE) to AuditLog
  - [ ] Persist realtime actions (meeting join/leave, chat, reactions, controls, task updates, notification:create)
- [ ] Enforce permissions in REST routes and Socket.IO handlers
- [ ] Implement FK integrity checks in services/middleware (APP_INTEGRITY)

## Phase 2 — Collaboration domain hardening
- [ ] Meetings scheduling/recurrence/templates/policies
- [ ] Meeting room lobby/approval/host controls
- [ ] Recording + transcript ingestion services (real integrations)

## Phase 3 — AI + Knowledge + Search
- [ ] AI pipeline (STT/diarization/language detection/summarization/RAG)
- [ ] Knowledge graph generation and semantic/vector search

## Phase 4 — Tasks/Docs/Notifications/Analytics
- [ ] Tasks (dependencies/mentions/recurrence/automation)
- [ ] Documents (versioning, permissions, trash/archive)
- [ ] Notification channels + delivery tracking
- [ ] Analytics + exports (CSV/XLSX/PDF)

### Phase 4.1 — AI insights persistence + analytics alignment (NEW)
- [ ] Add `AIInsights` persistence model (required by the AI assistant + analytics widgets)
- [ ] Implement backend endpoint(s):
  - [ ] `POST /api/ai/workspace/insights` (workspace-level insights for dashboard + AI assistant)
  - [ ] `POST /api/ai/transcripts/search` (transcript/segment search for AI assistant)
  - [ ] `POST /api/ai/knowledge/graph` (mindmap/knowledge graph nodes/edges for AI assistant)
- [ ] Replace `aiRecommendations` heuristic in `Backend/src/routes/analytics.routes.ts` with persisted `AIInsights`
- [ ] Ensure every AI endpoint writes audit logs and returns only workspace-scoped results (RBAC/ABAC)

## Phase 5 — Integrations + Billing + Feature Flags
- [ ] Integrations OAuth + webhooks verification
- [ ] Billing/subscriptions/usage metering
- [ ] Feature flags with auditability

## Phase 6 — DevOps + Security verification
- [ ] Docker compose + Kubernetes manifests
- [ ] GitHub Actions CI/CD
- [ ] Monitoring (Prometheus/Grafana/OpenTelemetry)
- [ ] Test coverage > 90% with security tests

## Phase X — UI “no mocks” hardening (NEW)
- [ ] Remove `Frontend/src/lib/mock.ts` driven rendering for any visible widget
- [ ] Update `Frontend/src/routes/app.ai-assistant.tsx` to remove `transcriptSample` and all hardcoded insight/mindmap UI and wire to backend AI endpoints
- [ ] Update dashboard/analytics/room/meeting-detail widgets to use backend-driven persistence (no heuristic-only widgets)
