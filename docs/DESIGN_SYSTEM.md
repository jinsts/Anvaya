# Design system

Anvaya uses a quiet learning workspace: warm paper surfaces, forest-green accents,
serif headings, system sans-serif prose and monospace indices/code. No remote
font requests, external artwork or decorative motion.

`src/styles/global.css` owns light/dark semantic tokens. Use `--bg`, `--surface`,
`--subtle`, `--text`, `--muted`, `--border`, `--accent` and its soft variant. Status
colors (success/warning/error/info) pair with soft backgrounds. Diagram cells,
selection and edges have their own tokens; selection must include labels/borders
or pressed states as well as color. Code uses local Shiki dual themes.

Spacing tokens range from `--space-1` to `--space-16`; radii, focus, shadow,
type families/scale, article measure and sticky offsets live alongside them.
Breakpoints are CSS media queries (760px shell, 1150px lesson outline), because
custom properties cannot supply media-query thresholds. The layout collapses
based on available space, with a maximum prose measure of 74 characters.

The header is sticky; the desktop sidebar is independently scrollable. Mobile
navigation uses an explicit Menu button with expanded state and Escape-to-close.
The lesson outline moves above content on narrower screens. Avoid hiding teaching
content in responsive layouts. Tables/code can scroll within their own containers.

All controls need visible focus, discernible names and practical touch targets.
SVG interactions need title/description, keyboard activation, matching native
button alternatives and polite text feedback. Static explanation must remain
useful without JavaScript. Manual stepping is the default: time and animation
are never required to understand a mechanism. Respect reduced motion in CSS.

Applicable states: disabled controls during a trace; input error with `role=alert`;
step/result feedback with `role=status`; deterministic reset; no-results search
with count; clipboard failure with manual-copy guidance. Storage is optional:
only theme preference is persisted, and corrupted values mean System.

Before merging visual work inspect desktop/mobile, light/dark, narrow or 200%
zoom layouts, keyboard focus, label legibility and overflow. Axe checks are a
useful guardrail, not a declaration of full WCAG conformance.
