# Add a category, subject or path

Discovery (categories → subjects) is separate from study order (paths →
sections → lessons). Each entity is one YAML file whose name is its ID
(lowercase kebab-case). Add entities only when there is something to study.

## Category: `src/content/categories/<id>.yaml`

```yaml
title: Languages
description: Learn how human languages work and how to use them.
parent: humanities # optional; another category ID
```

Root categories (without a `parent`) appear in Explore once a subject in them
has a lesson.

## Subject: `src/content/subjects/<id>.yaml`

```yaml
title: System Design
description: Reason about scale, reliability and trade-offs in distributed systems.
category: computer-science
icon: layers # a name from src/lib/icons.ts
tone: violet # blue | violet | teal | amber | rose | green
```

Lessons live in `src/content/lessons/<subject>/`. A subject appears once it has
a lesson. Choose a tone that differs from neighboring subjects.

## Path: `src/content/paths/<id>.yaml`

```yaml
title: System Design Interviews
description: Build the vocabulary and trade-off reasoning that design interviews test.
subject: system-design
order: 2 # lower sorts first; the first path is the home page's "Start here"
sections:
  - id: foundations
    title: Foundations
    lessons:
      - system-design/latency-and-throughput
    planned:
      - Caching
      - Load balancing
```

- A short path may use a flat `lessons` list (with an optional `planned` list)
  instead of `sections`.
- A lesson can appear in several paths. Its `path` frontmatter names its
  default; other paths link to it with `?path=` context.
- `planned` lists owner-approved topic titles that have no lesson yet. They
  show as "Planned" rows and are the curriculum agents may draft. Agents may
  propose planned topics in a separate change; the owner approves by merging.

## Verify

Run `pnpm build`. The catalog validator rejects unknown references, category
or prerequisite cycles, duplicate entries and empty sections. Then check the
Explore, subject and path pages.
