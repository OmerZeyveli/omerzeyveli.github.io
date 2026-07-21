# Agent Governance Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:subagent-driven-development` (recommended) or
> `superpowers:executing-plans` to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the custom governance graph and mandatory header artifacts
with one project contract, durable Superpowers design/plan records, and an
accurate published workflow description.

**Architecture:** `AGENTS.md` owns only stable repository facts and constraints;
installed Superpowers skills own the development process. Approved decisions
and executable plans live under `docs/superpowers/`, while Git history preserves
the change record.

**Tech Stack:** Astro 6, TypeScript, MDX, Tailwind CSS v4, isolated React islands,
pnpm, Node.js 24 or newer, and GitHub Pages.

## Global Constraints

- Keep the site static-first: no backend runtime, CMS, authentication, comments,
  or database assumptions.
- Do not add or update dependencies, schemas, routes, or runtime behavior.
- Keep content in `src/content/` and use `writing` as the collection name.
- Keep public-facing copy in English and leave `README.md` unchanged.
- Preserve meaningful inline implementation comments; remove only the
  standardized mandatory top-of-file header blocks.
- Preserve accessibility, SEO, reduced-motion behavior, and static performance.
- Use pnpm with Node.js 24 or newer.

---

### Task 1: Establish the Single Canonical Agent Contract

**Files:**

- Create:
  `docs/superpowers/specs/2026-07-21-agent-governance-simplification-design.md`
- Create:
  `docs/superpowers/plans/2026-07-21-agent-governance-simplification.md`
- Modify: `AGENTS.md`, `CLAUDE.md`, `.gitignore`
- Delete: `ARCHITECTURE.md`, `docs/AGENTS.md`, `docs/AGENT_MAP.md`,
  `docs/DECISIONS.md`, `docs/WORKFLOW_REFERENCE.md`,
  `docs/policies/HEADER_MIGRATION_PROMPT.md`,
  `docs/policies/src-pages.AGENTS.md`, `src/AGENTS.md`,
  `src/components/AGENTS.md`, `src/content/AGENTS.md`

**Interfaces:**

- Consumes: the approved design and the current content, routing, transition,
  accessibility, SEO, and deployment contracts.
- Produces: one root project contract, a one-line Claude import, and durable
  design/plan locations used by Task 2 and future work.

- [ ] **Step 1: Inspect the existing contract and adjacent implementation.**

  Read the named governance files, `package.json`, `astro.config.mjs`,
  `public/CNAME`, `src/content.config.ts`, `src/lib/content.ts`, both layouts,
  transition scripts/helpers, route filenames, global styles, and the Pages
  workflow. Confirm the design facts against source before rewriting policy.

- [ ] **Step 2: Write the approved design record and this implementation plan.**

  The design must record the rationale, target topology, seven contract
  sections, exact article update, header cleanup, non-goals, and acceptance
  criteria. The plan must contain Task 1, Task 2, and final validation with
  executable checkbox steps.

- [ ] **Step 3: Rewrite the root integration points.**

  Make `AGENTS.md` the only canonical project contract, organized as purpose and
  workflow, project and stack, source map, hard constraints, content and routing,
  client behavior, and quality gates. Make `CLAUDE.md` exactly `@AGENTS.md`
  followed by a newline. Add `.superpowers/` immediately beside `.worktrees/` in
  `.gitignore` without removing that file’s standardized header; Task 2 owns
  header removal.

- [ ] **Step 4: Delete the legacy governance graph.**

  Delete every file listed in Task 1’s delete set. Do not touch the article,
  standardized source/config headers, or `*.comment.md` sidecars in this task.

- [ ] **Step 5: Run structural verification.**

  Run:

  ```bash
  find . -path './node_modules' -prune -o -path './.git' -prune -o \
    -path './.astro' -prune -o -path './dist' -prune -o \
    -name AGENTS.md -print
  test "$(cat CLAUDE.md)" = '@AGENTS.md'
  test "$(wc -l < CLAUDE.md)" -eq 1
  test ! -e ARCHITECTURE.md
  test ! -e docs/AGENTS.md
  test ! -e docs/AGENT_MAP.md
  test ! -e docs/DECISIONS.md
  test ! -e docs/WORKFLOW_REFERENCE.md
  test ! -e docs/policies/HEADER_MIGRATION_PROMPT.md
  test ! -e docs/policies/src-pages.AGENTS.md
  test ! -e src/AGENTS.md
  test ! -e src/components/AGENTS.md
  test ! -e src/content/AGENTS.md
  ```

  Expected: the `find` command prints only `./AGENTS.md`; every `test` exits 0.

- [ ] **Step 6: Run the Task 1 diagnostic gate.**

  Run `pnpm check`. Expected: exit 0 and Astro reports 0 errors, 0 warnings, and
  0 hints.

- [ ] **Step 7: Review and commit Task 1.**

  Review `git diff --check`, `git diff --stat`, and the complete staged diff.
  Exclude `.superpowers/` execution state. Commit with
  `git commit -m "docs: simplify agent governance"`.

---

### Task 2: Remove Header Artifacts and Refresh the Published Article

**Files:**

- Delete: `.prettierrc.comment.md`, `.vscode/extensions.json.comment.md`,
  `.vscode/launch.json.comment.md`, `package.json.comment.md`,
  `tsconfig.json.comment.md`
- Modify standardized headers in: `.github/workflows/deploy.yml`, `.gitignore`,
  `astro.config.mjs`, `pnpm-workspace.yaml`, `src/content.config.ts`,
  `src/config/site.ts`, `src/layouts/BaseLayout.astro`,
  `src/layouts/PostLayout.astro`, `src/layouts/TerminalLayout.astro`,
  `src/lib/content.ts`, `src/lib/date.ts`, `src/lib/transitions.ts`,
  `src/scripts/card-tilt.ts`, `src/scripts/cover-morph.ts`,
  `src/scripts/football.ts`, and `src/styles/global.css`
- Modify standardized headers in: `src/components/content/Figure.astro`,
  `src/components/content/YouTubeEmbed.astro`,
  `src/components/layout/SiteFooter.astro`,
  `src/components/layout/SiteHeader.astro`,
  `src/components/terminal/EntryGate.astro`,
  `src/components/ui/ProjectCard.astro`, `src/components/ui/ReviewCard.astro`,
  `src/components/ui/SectionHeading.astro`,
  `src/components/ui/WritingCard.astro`
- Modify standardized headers in: `src/pages/404.astro`,
  `src/pages/about.astro`, `src/pages/index.astro`,
  `src/pages/projects/[...slug].astro`, `src/pages/projects/index.astro`,
  `src/pages/reviews/[...slug].astro`, `src/pages/reviews/index.astro`,
  `src/pages/terminal.astro`, `src/pages/writing/[...slug].astro`,
  `src/pages/writing/index.astro`
- Modify article:
  `src/content/writing/best-ai-model-you-can-actually-use.mdx`

**Interfaces:**

- Consumes: Task 1’s root contract and approved design language.
- Produces: header-free source/config files, no JSON sidecars, and a published
  article that describes the new governance model.

- [ ] **Step 1: Confirm the exact artifact inventory.**

  Run a tracked-file search for top blocks beginning `// Purpose:`,
  `/* Purpose:`, `# Purpose:`, the deploy workflow’s explanatory line, or the
  ignore file’s explanatory line. Expected: exactly the 35 source/config files
  listed above. Run `git ls-files '*comment.md'`; expected: exactly the five
  sidecars listed above.

- [ ] **Step 2: Remove only standardized header artifacts.**

  Delete the five sidecars. Remove the three-line Purpose/Scope/Audience blocks
  from TS, JS, CSS, Astro frontmatter, and `pnpm-workspace.yaml`; remove the three
  generated explanatory lines from `.github/workflows/deploy.yml` and
  `.gitignore`. If an Astro file’s frontmatter becomes empty, remove both
  delimiters. Preserve every meaningful inline comment and all runtime/config
  content.

- [ ] **Step 3: Update the article frontmatter and governance paragraphs.**

  Add `updatedDate: 2026-07-21` immediately after `pubDate`. Replace only the two
  old governance paragraphs with:

  > For agentic work, especially non-academic projects like this site or game
  > projects, I keep one short `AGENTS.md` file with the project's stable facts:
  > what the site is, where things live, what must not change, and which checks
  > have to pass.

  > Process is separate. I use the Superpowers plugin for brainstorming,
  > planning, implementation, review, and verification. Approved designs and
  > implementation plans live under `docs/superpowers/`, so the project rules
  > stay small while each larger change still leaves a useful trail.

  Preserve “That also saves usage.” and every other article line.

- [ ] **Step 4: Verify artifact and reference cleanup.**

  Search tracked non-Markdown source/config files for the standardized header
  patterns and require no matches. Require `git ls-files '*comment.md'` to print
  nothing after staging deletions. Search for `ARCHITECTURE.md`, `AGENT_MAP.md`,
  `DECISIONS.md`, `WORKFLOW_REFERENCE.md`, `HEADER_MIGRATION_PROMPT.md`, and
  scoped `AGENTS.md` references outside `docs/superpowers/**`; require no live
  references.

- [ ] **Step 5: Format, diagnose, review, and commit Task 2.**

  Run `pnpm format` and `pnpm check`; require exit 0 and Astro diagnostics of 0
  errors, 0 warnings, and 0 hints. Review `git diff --check` and the complete
  staged diff, then commit with
  `git commit -m "chore: remove legacy agent artifacts"`.

---

### Final Validation

- [ ] **Step 1: Run all repository quality gates from a clean worktree.**

  Run `pnpm format`, `pnpm check`, and `pnpm build`. Require all three commands
  to exit 0; require Astro check to report 0 errors, 0 warnings, and 0 hints.

- [ ] **Step 2: Repeat the final structural scans.**

  Confirm only `./AGENTS.md` remains, every legacy governance path and sidecar is
  absent, `CLAUDE.md` is one import line, standardized headers have no tracked
  matches, and deleted governance names have no live reference outside
  `docs/superpowers/**`.

- [ ] **Step 3: Smoke-test affected routes and interactions.**

  Start `pnpm dev` and inspect `/writing/`,
  `/writing/best-ai-model-you-can-actually-use/`, `/projects/`, `/reviews/`, and
  `/terminal/`. Confirm the updated article renders, client-router navigation
  and back navigation retain the single-cover morph, menu/card/pointer bindings
  do not duplicate after navigation, reduced motion disables motion, and the
  terminal continues to use full-page navigation without `ClientRouter`.

- [ ] **Step 4: Review the final history and report evidence.**

  Confirm `git status --short` has no tracked changes and `git log -2 --oneline`
  shows `chore: remove legacy agent artifacts` after
  `docs: simplify agent governance`. Report each command, exit status,
  diagnostic count, smoke-check result, and any concern exactly.
