# 0004 — Content collections and agent authoring

Date: 2026-10-28. Status: accepted; implemented locally.

## Context

The owner wants many categories, subjects and lessons, maintained mostly by
agents. Taxonomy and paths lived in two shared TypeScript arrays, so parallel
changes conflicted and scripts could not edit them safely. Agents had to read
the full bootstrap for every lesson, rules were spread across six documents,
and nothing distinguished agent drafts or limited what they could create.

## Decision

- Store categories, subjects, paths, trusted sources and problems as YAML
  content collections, one file per entity, validated by Zod schemas and
  `validateCatalog` (references, cycles, folder/subject agreement, registered
  citation prefixes, empty sections).
- Lessons gain `shortTitle`, `drafter` (`agent` | `owner`) and
  `interviewQuestions`. Only the owner promotes status.
- Path sections may list owner-approved `planned` topics. Agents draft only
  planned topics or explicit owner requests, one lesson per change. This
  refines the bootstrap's "no curriculum generation" rule rather than lifting it.
- `AGENTS.md` becomes a short router to task playbooks in `docs/playbooks/`; the
  bootstrap is required reading only for architectural changes.
- Guard rails run in `pnpm lint`: placeholder detection in content and labs,
  and design-token enforcement. `pnpm new:lesson` and `pnpm new:problem`
  scaffold from `templates/`. `pnpm verify` runs every gate.

## Consequences

New subjects, paths and problems are small, independent files. Mistakes fail
the build with actionable messages instead of reaching review. `getCatalog()` is
memoized per build; a 3,000-lesson synthetic library builds in 37 s.
Templates intentionally fail lint until every placeholder is replaced.
