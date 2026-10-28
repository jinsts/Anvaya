# 0001 — Static-first learning platform

Date: 2026-10-27. Status: accepted baseline (D-003, D-004, D-008).

Use Astro static output, MDX content collections and native Astro layouts/SVG.
Use React only for the stateful Arrays explorer. Prefer small browser scripts for
theme, search, diagram selection and copy controls. No backend or runtime service.

This preserves custom teaching experiences while most pages remain static HTML.
Build/preview require HTTP; file-URL parity and offline caching are deferred.
Use the installed Node 24 LTS series, pin 24.14.0, and pnpm 9.15.9. Astro 7.4.2
was checked against its registry engine declaration (Node >=22.23.4).

References consulted: [Astro installation](https://docs.astro.build/en/install-and-setup/),
[React integration](https://docs.astro.build/en/guides/integrations-guide/react/),
[Node releases](https://nodejs.org/en/about/previous-releases).
No deployment or remote repository modifications are authorized.
