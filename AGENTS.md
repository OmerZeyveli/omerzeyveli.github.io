# AGENTS.md

## Purpose and Workflow

- This file is the only canonical project-specific contract for agentic work.
- Direct user instructions take precedence; otherwise follow this contract.
- Keep this file focused on stable project facts, boundaries, locations, and
  quality gates.
- Applicable installed Superpowers skills own the development process. Read and
  follow them for brainstorming, planning, implementation, review, debugging,
  and verification instead of copying their workflows here.
- Store approved design specs in `docs/superpowers/specs/` and executable plans
  in `docs/superpowers/plans/`.
- Git history plus the approved design specs replace a separate governance
  decision log.

## Project and Stack

- This is a static-first personal site built with Astro 6, TypeScript, MDX, and
  Tailwind CSS v4.
- Prefer Astro components. Use React only for isolated interactive islands.
- Use pnpm and Node.js 24 or newer; respect `pnpm-lock.yaml` and
  `pnpm-workspace.yaml`.
- GitHub Pages deploys the production build through the repository workflow.
- The production domain is defined by `astro.config.mjs` and `public/CNAME`;
  keep both sources aligned.
- `pnpm dev` serves the local site at `http://localhost:4321`.

## Source Map

- Routes and page entry points: `src/pages/`.
- Content entries: `src/content/{projects,writing,reviews}/`.
- Entry media: `src/assets/content/<collection>/<slug>/`.
- Collection schemas and loaders: `src/content.config.ts`.
- Public collection queries and sorting: `src/lib/content.ts`.
- Shared page shells: `src/layouts/`.
- Reusable UI and MDX media: `src/components/`.
- Browser behavior and navigation coordination: `src/scripts/`.
- Global design tokens, utilities, and motion rules: `src/styles/global.css`.
- GitHub Pages build and deployment: `.github/workflows/deploy.yml`.

## Hard Constraints

- Keep the architecture static-first. Do not introduce a backend runtime, CMS,
  authentication, comments, or database assumptions.
- Keep authored content in `src/content/`; do not move it into `src/pages/`.
- Keep entry assets in `src/assets/content/<collection>/<slug>/`.
- Use `writing` as the collection name.
- Do not add a dependency without a clear, task-specific need.
- Keep public-facing copy in English.
- Preserve accessibility, semantic HTML, keyboard support, meaningful alt text,
  SEO metadata, canonical URLs, and sitemap behavior.
- Preserve reduced-motion handling, responsive images, lazy loading where
  appropriate, and static performance.
- Keep changes minimal and scoped; do not mix unrelated cleanup into a task.

## Content and Routing

- Every entry requires a local `cover` image and meaningful `coverAlt` text.
- Define collections in `src/content.config.ts` with explicit Astro Zod schemas
  using `z` from `astro/zod`; use explicit validators, including `z.url()` for
  URLs.
- Public projects and reviews exclude entries where `data.archived` is true.
- Public writing excludes entries where `data.draft` or `data.archived` is true.
- Sort public collection results newest first by `pubDate`.
- Listing routes remain `/projects`, `/writing`, and `/reviews`.
- Detail routes remain catch-all `[...slug].astro` files inside each collection
  route directory.
- Keep route components thin: use `src/lib/content.ts` for shared listing queries
  and sorting, render through layouts/components, and apply the same publication
  filters in detail-route `getStaticPaths()`.

## Client Behavior

- `src/layouts/BaseLayout.astro` owns `ClientRouter`; do not add it to
  `src/layouts/TerminalLayout.astro`, which intentionally uses full page loads.
- DOM bindings affected by client-router swaps must initialize and rebind on
  `astro:page-load`, with per-element `data-*` guards against duplicate binding.
- Repeated card covers must never receive a static `view-transition-name`.
- Keep cover morph coordination in `src/scripts/cover-morph.ts` and shared name
  generation in `src/lib/transitions.ts`; name only the matching cover during
  navigation.
- Gate pointer-driven effects behind `(hover: hover) and (pointer: fine)` and
  respect `prefers-reduced-motion` in CSS and browser scripts.

## Quality Gates

- Inspect affected files and adjacent contracts before changing behavior.
- Keep edits narrow and preserve established naming and folder conventions.
- Run `pnpm format`, `pnpm check`, and `pnpm build` before completion.
- Require `pnpm check` to report 0 errors, 0 warnings, and 0 hints.
- Smoke-check every changed route and interaction, including client navigation,
  full-page terminal navigation, keyboard behavior, pointer gating, and reduced
  motion when relevant.
- Review the final diff for unintended content, asset, schema, route, dependency,
  or generated-file changes.
- Report exactly what changed, why it changed, and the exact result of every
  required command and smoke check.
