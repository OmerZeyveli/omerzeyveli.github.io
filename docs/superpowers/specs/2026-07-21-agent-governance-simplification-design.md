# Agent Governance Simplification Design

**Status:** Approved

**Date:** 2026-07-21

## Rationale

The repository currently spreads agent guidance across a root contract, scoped
contracts, an agent map, an architecture document, a workflow reference, and a
decision log. That graph repeats stable project facts, makes precedence harder
to follow, and asks agents to spend context rediscovering which document owns a
rule. The mandatory source-header policy also leaves generated comments and
Markdown sidecars that do not help the site run or explain its implementation.

The replacement separates stable project knowledge from development process.
One concise root `AGENTS.md` owns project facts, boundaries, source locations,
runtime invariants, and quality gates. Applicable installed Superpowers skills
own brainstorming, planning, implementation, review, and verification. This
keeps the repository contract small without losing the repeatable process that
larger changes need.

Approved designs and implementation plans become durable records under
`docs/superpowers/`. Git history plus the approved design spec replaces the old
governance decision log.

## Target Topology

- `AGENTS.md` is the only canonical project-specific agent contract.
- `CLAUDE.md` contains only `@AGENTS.md`, allowing Claude Code to import the
  same contract without duplicating it.
- `docs/superpowers/specs/` stores approved design decisions.
- `docs/superpowers/plans/` stores executable implementation plans.
- `.superpowers/` remains ignored as machine-local execution state.
- Installed Superpowers skills provide process instructions and are not copied
  into repository policy.

The legacy topology is removed: `ARCHITECTURE.md`, the policy map, scoped
`AGENTS.md` files, workflow reference, decision log, and header-migration prompt
no longer participate in governance.

## Canonical Contract Contents

The new root contract is organized around seven durable concerns:

1. Purpose and workflow: authority, the split between project facts and
   Superpowers process, and locations for approved specs and plans.
2. Project and stack: Astro 6, TypeScript, MDX, Tailwind CSS v4, narrowly scoped
   React islands, pnpm, Node.js 24 or newer, and GitHub Pages deployment.
3. Source map: routes, collections, content assets, schemas, queries, layouts,
   components, client scripts, global styles, and deployment workflow.
4. Hard constraints: static-first architecture, dependency restraint, content
   placement, English public copy, and preservation of accessibility, SEO,
   reduced motion, and static performance.
5. Content and routing: required local covers and meaningful alt text, explicit
   Astro Zod schemas, publication filters, date ordering, listing routes, and
   catch-all detail routes.
6. Client behavior: the intentional router split, page-load rebinding guards,
   dynamic cover morph names, and pointer/reduced-motion gates.
7. Quality gates: inspection, narrow changes, formatting, Astro diagnostics,
   production builds, smoke checks, and exact result reporting.

The contract targets roughly 80-110 lines for readability, but the range is a
design aim rather than an automated or hard acceptance gate.

## Published Article Update

The article
`src/content/writing/best-ai-model-you-can-actually-use.mdx` will record the
change for readers. Its frontmatter gains `updatedDate: 2026-07-21` immediately
after `pubDate`.

The two paragraphs that describe the old multi-file governance system will be
replaced with:

> For agentic work, especially non-academic projects like this site or game
> projects, I keep one short `AGENTS.md` file with the project's stable facts:
> what the site is, where things live, what must not change, and which checks
> have to pass.

> Process is separate. I use the Superpowers plugin for brainstorming,
> planning, implementation, review, and verification. Approved designs and
> implementation plans live under `docs/superpowers/`, so the project rules
> stay small while each larger change still leaves a useful trail.

The surrounding “That also saves usage.” sentence and all other article copy
remain unchanged.

## Header Artifact Cleanup

The obsolete mandatory three-line header blocks will be removed from the 35
tracked source and configuration files that carry them. The five tracked
`*.comment.md` JSON sidecars will also be deleted. Meaningful inline comments,
runtime code, and configuration remain unchanged. Empty Astro frontmatter left
only by a removed standardized header will be removed with its delimiters.

## Non-Goals

- No backend runtime, CMS, authentication, comments, or database is introduced.
- No dependency, collection schema, route, component behavior, or deployment
  behavior changes.
- No content moves out of `src/content/`, and `writing` remains the collection
  name.
- No redesign, broad copy edit, or README update is included.
- No meaningful inline implementation comment is removed.
- No Superpowers skill workflow is reproduced inside `AGENTS.md`.

## Acceptance Criteria

- Only the root `AGENTS.md` remains as a project contract, and it contains every
  project invariant enumerated in this design.
- `CLAUDE.md` is exactly one import line, ending with a newline.
- Approved specs and plans live in their new `docs/superpowers/` directories;
  `.superpowers/` is ignored.
- Every named legacy governance file and every JSON header sidecar is absent.
- Standardized top-of-file header blocks have no tracked source/config matches,
  while meaningful inline comments remain.
- The article has the approved date and paragraph replacement only.
- No live references to deleted governance filenames remain outside historical
  material under `docs/superpowers/`.
- `pnpm format`, `pnpm check`, and `pnpm build` succeed, with Astro diagnostics
  reporting 0 errors, 0 warnings, and 0 hints.
- Smoke checks cover the changed writing route and preserve client navigation,
  cover transitions, pointer behavior, reduced motion, and the terminal route’s
  full-page navigation behavior.
