# Design system

Anvaya uses cool neutral surfaces, blue accents and compact sans-serif typography.
The owner's infrastructure and agent documentation sites inform the visual
patterns: clear page heroes, persistent navigation, bordered teaching panels,
semantic diagram colors and restrained gradients. All implementation and lesson
content are Anvaya's own. The decision is recorded in
[ADR 0003](adr/0003-subject-catalog-and-reference-design.md).

`src/styles/global.css` owns light/dark semantic tokens. Light mode combines a
cool gray canvas with white panels; dark mode uses charcoal and slate. Use `--bg`,
`--surface`, `--subtle`, `--text`, `--muted`, `--border`, `--accent` and
`--accent-soft`. Filled accent controls use `--accent-ink` for legible labels.
Success, warning, error and information each have text and soft-background tokens.
Diagram selection must include labels, borders or pressed state as well as color.
Code uses locally generated Shiki dual themes. Fonts are system/local, with no
remote requests or external artwork.

Spacing, radii, shadows, type families/scale, article measure and sticky offsets
live alongside these tokens. Desktop navigation uses a 64px header, a 252px
sidebar, readable article width and a separate lesson outline. Breakpoints follow
available space: the sidebar becomes a mobile drawer at 760px and the lesson
outline moves into the reading flow at 1150px. Tables/code scroll inside their
own containers.

## Discovery and study

Global navigation offers Overview, Explore subjects, Learning paths and concept
search. The Explore disclosure and global sidebar link to populated root
categories; they do not enumerate every lesson or subject. Explore provides
category drill-down, Back, breadcrumbs and query/history restoration. Subject
pages collect actual paths and canonical lessons, including standalone lessons.
Only subjects with lessons or nonempty paths appear in discovery.

During study, the sidebar shows the active path and collapsible sections, and
highlights the current lesson. Breadcrumbs provide subject location; the separate
On this page navigation follows lesson headings. A validated optional `?path=`
selects another path membership and its previous/next lessons. Direct links and
unknown context use the default path, or the first membership if none is set.
Canonical lesson URLs remain independent of category organization.

Desktop search submits to the concept index, where the query is restored and
matched against title, summary, tags and subject/category context. Mobile has a
search link and a labeled navigation drawer. Menu and Escape manage expanded
state and focus; the reading surface is inert while the drawer is open. Native
category links, disclosures and the full catalog remain useful without scripts.

## Interaction and accessibility

All controls need visible focus, discernible names and practical touch targets.
SVG interactions need title/description, keyboard activation, matching native
button alternatives and polite text feedback. Static explanation must remain
useful without JavaScript. Manual stepping is the default: time and animation
are never required to understand a mechanism. Respect reduced motion in CSS.

Applicable states include disabled controls during a trace, input errors with
`role=alert`, step/result feedback with `role=status`, deterministic reset,
no-results search with count, and clipboard failure with manual-copy guidance.
Storage is optional: only theme preference is persisted; invalid values mean
System. No progress or completion is implied by navigation.

Before merging visual work inspect desktop/mobile, light/dark, narrow or 200%
zoom layouts, keyboard focus, label legibility and overflow. Axe scans are a
regression guardrail, not a declaration of full WCAG conformance.
