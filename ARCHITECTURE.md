<!-- Architecture contract -->
<!-- Scope: repository-wide implementation design -->
<!-- Audience: autonomous coding agents and maintainers -->

# Architecture Contract

This document is the implementation contract for this repository.
It is optimized for human contributors and coding agents.

## 1) Mission

Build a static, developer-first personal website with three content domains:

- Projects (case studies)
- Writing (editorial posts)
- Reviews (verdict-driven critiques)

Hard goals:

- Clean, maintainable architecture
- Image-forward content model
- Strong typed content validation
- Zero backend runtime
- GitHub Pages deployment with custom domain

## 2) Stack And Runtime Constraints

- Astro + TypeScript + MDX + Tailwind CSS v4
- React is allowed only for isolated interactive islands
- No backend, CMS, auth, comments, or database
- Keep output static-first and lightweight

## 3) Source-Of-Truth Map

- Routing: `src/pages/`
- Content entries: `src/content/{projects,writing,reviews}/`
- Content assets: `src/assets/content/{projects,writing,reviews}/<slug>/`
- Collection schema: `src/content.config.ts`
- Shared content queries: `src/lib/content.ts`
- Site config: `src/config/site.ts`
- Global layout: `src/layouts/BaseLayout.astro`
- Post layout: `src/layouts/PostLayout.astro`
- Global styles: `src/styles/global.css`
- Deploy workflow: `.github/workflows/deploy.yml`
- Domain config: `astro.config.mjs` and `public/CNAME`

## 4) Canonical Route Contract

- `/`
- `/projects`
- `/projects/[slug]` via `src/pages/projects/[...slug].astro`
- `/writing`
- `/writing/[slug]` via `src/pages/writing/[...slug].astro`
- `/reviews`
- `/reviews/[slug]` via `src/pages/reviews/[...slug].astro`
- `/about`
- `/404`

Rules:

- Keep detail routes catch-all (`[...slug].astro`) for nested content support.
- Keep URLs lowercase and hyphen-separated.
- Never reintroduce `blog` naming.

## 5) Collection Contract

Global rules:

- Every entry must include `title`, `pubDate`, `cover`, and `coverAlt`.
- Cover images must be local assets.
- Public pages must exclude archived entries.
- Writing public pages must exclude drafts.
- Sort default is newest first by `pubDate`.

Writing required fields:

- `title`, `description`, `pubDate`, `category`, `cover`, `coverAlt`

Projects required fields:

- `title`, `summary`, `pubDate`, `year`, `status`, `category`, `stack`, `cover`, `coverAlt`

Reviews required fields:

- `title`, `description`, `pubDate`, `type`, `cover`, `coverAlt`

Schema rules:

- Use `z` from `astro/zod`.
- Use explicit validators.
- Use explicit URL validator (`z.url()` preferred).
- Keep schema strict and explicit.

## 6) Data Query Contract

Implement collection filtering and sorting in shared helpers where possible.

Minimum behavior for public datasets:

```ts
projects: !data.archived;
writing: !data.draft && !data.archived;
reviews: !data.archived;
```

When only top N entries are needed, partial selection is allowed.

## 7) Content And UI Contract

Home page sections:

- Hero
- Featured Projects
- Latest Writing
- Latest Reviews

Listing pages must show image-backed cards.

Detail pages must support rich body content and optional inline media.

Supported media components (v1):

- `src/components/content/Figure.astro`
- `src/components/content/YouTubeEmbed.astro`

Public-facing copy must remain English.

## 8) SEO And Domain Contract

- Every page needs meaningful title and description.
- Keep title format consistent.
- Keep sitemap enabled.
- Set production domain in `astro.config.mjs` (`site`).
- Keep domain string in `public/CNAME`.
- Canonical and OG URLs should derive from `Astro.site` (single source of truth).

## 9) Accessibility Contract

- All images require meaningful alt text.
- Heading hierarchy must stay logical.
- Keyboard navigation must remain functional.
- Focus states must remain visible.
- Contrast must remain readable in dark mode.

## 10) Performance Contract

- Prefer static rendering and `.astro` components.
- Hydrate only when interactivity is necessary.
- Avoid heavy dependencies without clear need.
- Keep media optimized and local when possible.

## 11) Change Safety Contract

When making non-trivial edits:

1. Preserve architecture boundaries.
2. Keep naming consistent (`writing`, never `blog`).
3. Avoid partial renames and half-migrations.
4. Verify imports after moves.
5. Run quality gates before finishing.

## 12) Quality Gates

Required before merge:

```bash
pnpm format
pnpm check
pnpm build
```

Manual checks:

- Changed routes render correctly
- Cards show cover images
- No old `blog` naming remains
- English copy consistency maintained

## 13) Out Of Scope (Without Explicit Approval)

- Backend runtime
- CMS integration
- Auth or user accounts
- Comment systems
- Dynamic database features
- Large runtime-heavy UI systems

## 14) Agent Handoff Notes

When handing tasks between agents, include:

- Target files
- Behavioral constraints
- Expected public behavior
- Validation commands run and outcomes

Keep this contract updated when architecture rules change.

## 15) Companion Reference

For expanded operational guidance that used to live in the long README (authoring templates, workflow checklists, and future backlog), see:

- `docs/WORKFLOW_REFERENCE.md`

Rule of use:

- `ARCHITECTURE.md` stays concise and normative.
- `docs/WORKFLOW_REFERENCE.md` stays expansive and reusable.

## 16) Governance Topology

Policy topology and scoped policy paths are indexed in:

- `docs/AGENT_MAP.md`

Rule-level governance changes are recorded in:

- `docs/DECISIONS.md`
