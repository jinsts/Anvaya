# 0005 — Interview practice and local progress

Date: 2026-10-28. Status: accepted; implemented locally.

## Context

The owner wants to prepare for technical interviews: sample questions from
reputable sources, practice problems and rehearsal. The bootstrap deferred
progress storage and spaced review until a real learner need existed;
interview preparation is that need. The baseline already specified the
storage key `anvaya:progress:v1` and a Continue learning area.

## Decision

- **Problems** are references to registered problem banks with original
  hints. They never contain statements, editorials or solutions. List
  memberships (Blind 75, NeetCode 150) are verified against published list data.
- **Interview questions** live in lesson frontmatter. They are rendered in each
  lesson and in a per-subject question drill that shows questions marked
  "review again" first, oldest first. There is no interval scheduling engine.
- **Practice tracker** at `/practice/`: filters, per-problem status and a
  timed mock interview that picks an unsolved problem and records the outcome.
- **Progress** (lesson completion, last lesson, problem status, drill
  results) is versioned, validated device-local storage with export, import
  and clear on Home. Corrupt data is ignored and blocked storage falls back to
  memory. Nothing syncs, and streaks and engagement metrics stay out of scope.
- Behavioral interview stories are personal data and are not stored in the
  repository.

## Consequences

Practice works offline on a static site without accounts. Progress is
per-browser; export is the backup and transfer path. Labs remain TypeScript;
another interview language would add a toolchain and needs an owner decision.
