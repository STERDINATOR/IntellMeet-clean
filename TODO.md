- [ ] Remove all Frontend/src/lib/mock.ts usage across all routes/components.
- [ ] Refactor Frontend/src/routes/app.projects.$id.tsx to compile: remove mock imports/usage, restore correct JSX.
- [ ] After successful refactor, delete Frontend/src/lib/mock.ts (and any remaining mock-related files).
- [ ] Refactor remaining project routes/components that still use mock (e.g., app.projects.index).
- [ ] Prefer installing mediasoup via npm in Backend; add typings or local d.ts shim as needed.
- [ ] Run frontend: npm run lint + tsc --noEmit; fix all lint/type errors.
- [ ] Run backend: npm run lint + typecheck; fix missing module/typing issues.
- [ ] Verify runtime/startup by starting both servers; fix crashes found in logs.

