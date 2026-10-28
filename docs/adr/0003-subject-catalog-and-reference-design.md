# Subject catalog and reference-led design

Date: 2026-10-28. Status: accepted; implemented locally.

## Context

The owner requested visual fidelity to the existing infrastructure and agent
documentation sites, and an expandable menu for learning beyond computer science.
The initial green/serif design and globally expanded lesson list do not meet that
direction. A lesson's required single path also prevents reuse across sequences.

## Decision

Use an original cool-neutral, blue-accented design with compact sans-serif type,
light/dark/system themes, bordered teaching panels and semantic diagram colors.
Reference sites inform appearance and interaction only; import no private content.

Separate discovery (categories, optional subcategories, subjects) from ordered
study (paths, optional sections, canonical lessons). Store taxonomy in typed data;
validate references and cycles. Paths own membership; a lesson may nominate a
default path, be reused in other paths, or stand alone. Keep existing lesson URLs.
Optional validated `?path=` context selects a path sidebar and adjacent lessons;
direct links and invalid context fall back to the default or first available path.

Global navigation exposes Explore, search and paths. During study the sidebar
shows the selected path, while the in-page outline shows lesson headings.
Only populated subjects/categories are shown. Use the existing two draft lessons
to validate the model; do not create a curriculum or record learner progress.

## Consequences

Adding another field of study requires content and taxonomy data, not shell edits.
Static Astro/MDX, selective React, accessible HTML and existing local labs remain
the foundation. Query context progressively enhances canonical static pages;
without JavaScript, the default path and complete catalog remain usable.
The catalog, navigation behavior, responsive layouts and both themes require
local quality checks and browser inspection before handoff. Publication is outside
this increment.
