# Foundation implementation

Baseline: [ANVAYA_BOOTSTRAP.md](ANVAYA_BOOTSTRAP.md). Scope is Milestones 0–3;
only Arrays and the smaller Hash Maps sample. No remote changes or deployment.

- [x] **0 — Discover:** read baseline fully; inspect empty Git repository and tools;
      verify Astro prerequisites and package registry; record architecture decisions.
- [x] **1 — Foundation:** strict Astro/MDX, selective React, typed content/path data,
      responsive shell, theme, home/path/concept/lesson routes; check and build.
- [x] **2 — Teaching implementation:** Arrays, accessible diagram, step explorer, two tested labs,
      Hash Maps sample; browser interaction and visual verification.
- [x] **3 — Quality:** validators, unit/component/E2E tests, CI, authoring/design
      documentation, measured final verification.

Environment: Node 24.14.0 (LTS series), pnpm 9.15.9. Registry confirms Astro 7.4.2
requires Node >=22.23.4. Registry networking needs the approved pnpm escalation.
Exact dependencies are recorded in `pnpm-lock.yaml`. Lesson status stays draft
until owner review; automated checks do not certify conceptual mastery.

Milestone 1 checkpoint: `pnpm check` passed (0 errors/warnings, 2 deprecation hints),
`pnpm build` passed and validated all six pages and internal links/anchors.
TypeScript 6.0.3 selected because current Astro checker and typescript-eslint do
not support TypeScript 7 yet. Astro development telemetry disabled locally.

Milestones 2–3 implementation and local checks are complete. Final checks have
zero type errors, warnings or hints; 41 unit/component/reference-lab tests and
16 desktop/mobile browser tests pass. Eight light/dark home/Arrays accessibility
scans report no violations. See [verification evidence](docs/VERIFICATION.md).

Owner review of lesson concepts and independent exercise attempts remain open;
neither lesson is marked reviewed. Milestone 4 (progress, sync, full-text search,
offline support and private deployment) remains deferred. Next single lesson to
consider after studying these drafts: two pointers.
