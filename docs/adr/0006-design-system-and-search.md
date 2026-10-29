# 0006 — Design system and search

Date: 2026-10-28. Status: accepted; implemented locally.

## Context

The owner found the UI unattractive. A review found 41 distinct font sizes and
unused spacing tokens. System fonts rendered differently on each OS, and
lesson prose ran to about 115 characters per line. Every page used the same
large-hero template, and long collections were rendered as large cards. Search
rendered every lesson card and filtered substrings, which reached 3.3 MB of
HTML at 3,000 lessons.

## Decision

- Self-host Inter and JetBrains Mono through `@fontsource-variable` packages.
  They are local build assets, consistent with the no-CDN rule.
- Adopt a 9-step type scale, a 4px spacing scale, radius and elevation tokens,
  and per-subject tones. Enforce font-size and color tokens with
  `scripts/lint-styles.mjs`.
- Use a curated Lucide icon set (`@lucide/astro`, rendered to inline SVG at
  build time) instead of mixed Unicode glyphs.
- Define four page types (dashboard, catalog, reading, practice) and shared
  catalog components. Use lists rather than cards for long collections.
- Keep a 70ch reading measure for prose, with wider figures, code and widgets.
- Replace the card filter with Pagefind: a static, chunked full-text index
  built after `astro build`, with ranked results and section links. Without a
  build (`pnpm dev`) the search page explains how to get an index.

## Consequences

The site keeps the cool-neutral, blue-accent direction of ADR 0003 with
consistent typography on every platform. The search page is about 20 KB at
3,000 lessons, and indexing takes under 2 s. Screenshot baselines wait for
owner approval of the design.
