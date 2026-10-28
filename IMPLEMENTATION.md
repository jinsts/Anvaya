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

## Design and discovery refinement — 2026-10-28

Owner-approved follow-on: [ADR 0003](docs/adr/0003-subject-catalog-and-reference-design.md).

- [x] Replace the warm green/serif design with cool neutrals, blue accents,
      compact sans-serif type and coordinated light/dark teaching surfaces.
- [x] Implement Explore and subject overview using shared category/subject data.
- [x] Separate global discovery from contextual path sections and lesson outline.
- [x] Support standalone and shared lessons, preserving canonical URLs and an
      optional validated path context. Keep both existing lessons as drafts.
- [x] Finish integrated quality checks, browser review and verification evidence:
      50 unit/component tests, 28 desktop/mobile browser tests, 16 clean axe scans,
      type checks, lint, formatting, static build and internal-link validation.
      See [verification evidence](docs/VERIFICATION.md).

No additional curriculum, learner progress storage, services or remote changes
are part of this increment. Optional Milestone 4 remains deferred.
