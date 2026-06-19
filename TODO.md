# TODO — IntelliMeet Enterprise Production Build

## Phase 0 — Repo contract + route/widget mapping
- [ ] Produce UI→API→DB→realtime→audit mapping matrix (current surface area)

## Phase 1 — Data model & backend foundations (ERD → code, RBAC/ABAC, audit)
- [ ] Expand DB models to full ERD (per spec)
- [x] RBAC/ABAC enforcement (partial; expanded AI action set)
- [x] Universal audit logging foundation

## Phase 2 — AI + Knowledge + Search
- [x] Add `POST /api/ai/transcripts/search`
- [x] Add `POST /api/ai/knowledge/graph`
- [ ] Ensure compile passes (tsc) and runtime wiring works

## Phase 3 — Frontend AI Assistant “no mocks” hardening
- [ ] Refactor `Frontend/src/routes/app.ai-assistant.tsx` to remove transcriptSample/insights/mindmap/action mocks
- [ ] Wire transcript search to `/api/ai/transcripts/search`
- [ ] Wire mindmap to `/api/ai/knowledge/graph`

## Phase 4 — Verification
- [ ] Run backend typecheck + unit tests
- [ ] Manual E2E smoke: login → AI Assistant → transcript search → mindmap generation

