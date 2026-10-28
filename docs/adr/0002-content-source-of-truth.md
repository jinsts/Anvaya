# 0002 — Versioned, validated teaching content

Date: 2026-10-27. Status: accepted baseline (D-004, D-007).

Canonical lessons live in MDX with a validated metadata schema. A small typed path
registry holds ordering; routes, breadcrumbs and previous/next links derive from it.
Builds reject invalid references, cycles and orphaned lessons. HTML is disposable
build output. Tests verify algorithms, not every teaching claim.

Lessons begin as drafts and remain accessible locally with an explicit review
label. Only genuine owner review may promote their status. No fabricated review
dates. Git content status and any later device-specific learner progress are separate.

Reference: [Astro content collections](https://docs.astro.build/en/guides/content-collections/).
