# Anvaya

Connect concepts. Build understanding.

A personal engineering learning platform: learn → visualize → experiment →
practise → recall → revisit. The first foundation contains one substantial Arrays
lesson and a smaller Hash Maps sample. Both are drafts awaiting owner review.

The approved architecture and acceptance criteria are in
[ANVAYA_BOOTSTRAP.md](ANVAYA_BOOTSTRAP.md); see
[IMPLEMENTATION.md](IMPLEMENTATION.md) for milestone progress and verification.
Measured results and browser-review limits are in [VERIFICATION.md](docs/VERIFICATION.md).

## Run locally

Use the runtime in `.node-version` (Node 24.14.0, Node 24 LTS) and pnpm 9.15.9,
recorded in `packageManager`. Install that pnpm version using your preferred
package-manager installation method. Then, at the repository root:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by Astro (normally `http://localhost:4321`). For the
actual static production output:

```sh
pnpm build
pnpm preview
```

Serve over HTTP; double-clicking files with `file://` is unsupported. No API keys,
accounts, backend, remote fonts or runtime services are required. Astro development
telemetry can be disabled with `pnpm astro telemetry disable`. This repository
does not configure any deployment.

## Quality gate

```sh
pnpm check
pnpm format:check
pnpm lint
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

On a fresh Linux CI machine, use `pnpm exec playwright install --with-deps chromium`
to install browser system libraries too. The E2E suite starts its own production
preview on `127.0.0.1:4321`; build first and leave that port free. It runs desktop
Chromium and mobile Chromium emulation, scans light/dark pages with axe, and saves
screenshots and traces under ignored `test-results/` and `playwright-report/`.
Real iOS/WebKit and manual screen-reader certification are not implied.

`pnpm build` validates generated local links, assets, anchors, unique IDs, headings,
image alternatives and lesson recaps. Astro validates frontmatter and MDX;
the catalog rejects missing path/prerequisite references and cycles.

## Practise locally

Read [the Arrays lab](labs/dsa/arrays/README.md), implement its `starter.ts`, then run
`pnpm lab:arrays`. This command intentionally fails on unfinished TODOs.
`pnpm test:labs` verifies the supplied reference solutions and Hash Maps example;
the normal quality suite excludes unfinished learner attempts.

## Where things live

- `src/content/lessons/`: canonical MDX and metadata.
- `src/data/paths.ts`: ordered curriculum; navigation and routes derive from it.
- `src/layouts/`, `src/components/`: Astro shell/teaching components and one React island.
- `src/lib/`: pure array logic and catalog validation.
- `labs/`: exercises, contracts, solutions and reproducible worked examples.
- `scripts/validate-build.mjs`: production output validation.
- `tests/`: unit, component and browser behavior tests.
- `docs/`: [authoring](docs/AUTHORING_GUIDE.md), [design](docs/DESIGN_SYSTEM.md),
  [learning standards](docs/LEARNING_STANDARDS.md), and [ADRs](docs/adr/).

## Boundaries and troubleshooting

Theme preference uses only `anvaya:theme:v1` in this browser's localStorage.
Clear it through browser site-data controls, or choose System. Blocked/corrupt
storage falls back gracefully. Learner progress, syncing, PWA caching, additional
curricula and remote hosting are deferred. The home offers a stable starting point
rather than claiming progress it does not store.

If install fails, verify Node/pnpm versions and registry connectivity; do not
replace the lockfile with another package manager's file. A TypeScript-major bump
must be compatible with Astro's checker and ESLint (currently TypeScript 6).
If preview exits, check port 4321 and permission to bind a loopback server.
If Chromium cannot launch, install its OS dependencies and check sandbox policy.
Never report browser verification as passed if the browser did not run.

No push, hosting, public release, or open-source license is authorized by this
bootstrap. A remote host must protect every page and asset before private use.
