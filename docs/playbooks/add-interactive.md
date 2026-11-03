# Build a diagram or interactive widget

Add interaction only when it shows a mechanism better than prose and a static
figure. Every widget must still make sense without JavaScript.

## Choose the smallest tool

| Need                                       | Use                                                            | Example                                        |
| ------------------------------------------ | -------------------------------------------------------------- | ---------------------------------------------- |
| Static figure                              | `<DiagramFrame caption>` with inline SVG in an Astro component | —                                              |
| Select parts of a figure                   | Astro component with SVG and a small `<script>`                | `src/components/diagrams/IndexedMemory.astro`  |
| Coupled state, step-by-step traces, inputs | React island with a pure model in `src/lib/`                   | `ArrayExplorer.tsx` + `src/lib/array-model.ts` |

Keep large SVG in a component, not in MDX. Import lesson-specific components in
the lesson file; hydrated islands need `client:visible`.

## Requirements

- Put algorithm logic in a pure, deterministic model and unit-test every state
  transition, boundary and invalid input.
- Give each SVG a `title`/`desc`, and give every clickable hotspot an equivalent
  native button. Hotspots need `role="button"`, `tabindex="0"` and
  Enter/Space handling.
- Announce results in an element with `role="status"`; put input errors in
  `role="alert"`.
- Never convey state by color alone; add labels, borders or pressed state.
- Prefer manual stepping. Never require animation or timing to understand a
  mechanism, and respect reduced motion.
- Style with tokens only (`pnpm lint` enforces font sizes and colors) and check
  both themes.
- Add a Playwright step that performs the main interaction with the keyboard.

## Done when

- [ ] Model tests and a component or browser test cover the interaction.
- [ ] The lesson text explains the same mechanism for readers without JavaScript.
- [ ] Keyboard, screen-reader announcements, mobile width and both themes
      were checked.
