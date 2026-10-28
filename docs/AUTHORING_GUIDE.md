# Authoring one lesson

Read the baseline's learning anatomy and source policy first. Add only a lesson
you actually intend to study; do not pre-generate paths of shallow placeholders.

1. Add `src/content/lessons/<subject>/<slug>.mdx`. Its collection ID is the nested
   path without `.mdx`, such as `dsa/arrays`.
2. Supply metadata using the schema in `src/lib/lesson-schema.ts`.
3. Register the subject and its category in `src/data/taxonomy.ts` if needed.
   Categories can have a parent; the same model supports any field of study.
   Add categories when there is something to study, rather than placeholders.
4. Optionally add the lesson ID to an ordered path in `src/data/paths.ts`. A path
   uses either `lessons` or `sections: [{ id, title, lessons }]`. Paths can reuse
   canonical lessons, even across subjects. Set the lesson's optional `path` to
   its default path; omit it for standalone content. No shell edits are needed.
5. Add tested examples/exercises under `labs/<subject>/<slug>/`. Prefer importing
   actual source with `?raw` for code displays so examples cannot silently drift.
6. Run the README quality gate; inspect the actual page at desktop/mobile widths
   and both themes. Draft status stays until genuine owner review.

## Metadata

```yaml
---
title: 'Descriptive concept title'
summary: 'A concrete sentence describing what the learner will understand.'
subject: dsa
path: dsa-foundations
difficulty: foundation
estimatedMinutes: 20
learningObjectives:
  - Explain one mechanism in your own words
prerequisites: [dsa/arrays]
tags: [one-relevant-tag]
status: draft
sources:
  - label: 'A real primary reference you have read'
    url: 'https://tc39.es/ecma262/'
---
```

This shows syntax, not content to copy unchanged. Use genuine consulted sources.
`difficulty` is foundation/intermediate/advanced; `status` is
draft/reviewed/published. Reviewed/published require `reviewedAt` (ISO date).
Subjects must exist in the taxonomy. A default `path`, when supplied, must
contain this lesson. Paths own membership and ordering; do not copy a lesson to
put it into a second sequence. `pathLessonIds()` and `pathSections()` normalize
flat and sectioned paths. A non-default membership uses `?path=<id>` for its
sidebar and adjacent lessons; direct links retain the canonical URL.

Prerequisites use canonical IDs, must exist, and cannot form cycles. Stable IDs
are lowercase kebab-case segments; preserve links when renaming. Sources cannot
be placeholders. At least one objective and source are required.

## Teaching outline

Start with a reason to care and the prerequisites. Build an intuition, then show
the mechanism and its limits. Add a formal model, verified code with expected
results, costs with assumptions, use cases, misconceptions, independent practice,
reasoning checks and `## Two-minute recap`. Sources and previous/next navigation
are rendered from metadata. See Arrays for a complete, custom-composed example;
short reference lessons need not match its length.

## Component catalog

| Component         | Contract                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| `LessonLayout`    | Renders metadata, objectives, prerequisites, outline, sources and adjacent lessons automatically |
| `SectionTOC`      | Generated heading links with active-section indication                                           |
| `Callout`         | `title`, optional `variant` info/warning/success, prose children                                 |
| `DiagramFrame`    | `caption` and SVG/HTML children; give each graphic a meaningful accessible description           |
| `IndexedMemory`   | Specific index/address mechanism with buttons and keyboard-operable SVG hotspots                 |
| `CodeExample`     | `title`, actual `code`, optional `output`, `language` ts/js/bash; copy and result display        |
| `ComplexityTable` | Current array-specific cost table; generalize only when another lesson needs the pattern         |
| `LabCard`         | `title`, local `command`, exercise children                                                      |
| `ConceptCheck`    | Unique `id`, question, options `{label, explanation, correct?}`; require reasoning feedback      |
| `ArrayExplorer`   | Pure-model React widget, MDX uses `client:visible`                                               |

Imports in a nested lesson are relative to the file. Astro components cannot be
React-hydrated. Keep large SVG outside MDX. Use blank lines around markdown inside
JSX containers, and put block `<details>`/`<summary>` tags on separate lines.
Use a unique anchor/name for each interactive widget. Check snippets and sources
actually render correctly; a type check does not compile all MDX narrative.

## Review and AI assistance

Use [LEARNING_STANDARDS.md](LEARNING_STANDARDS.md) as the concise review gate,
with the blueprint as the authoritative requirements. Tests are necessary evidence
for code behavior, not proof of prose accuracy. Leave uncertain claims explicitly
unverified or remove them. Do not fabricate personal study experiences, reviewed
dates, source citations or command results. Owner review promotes content status;
editing a lesson does not record learner mastery.
