<!-- AGENTS policy root -->
<!-- Scope: entire repository -->
<!-- Audience: autonomous coding agents only -->

# AGENTS.md

## 0. Governance Model

Model: Level 2 Balanced (global policy + scoped policy + map + decision log).

## 1. Authority Order

Apply rules in this exact order:

1. Direct user request
2. Root policy: `AGENTS.md`
3. Scoped policy files listed in `docs/AGENT_MAP.md`
4. Architecture contract: `ARCHITECTURE.md`
5. Operational reference: `docs/WORKFLOW_REFERENCE.md`

Conflict rule:

- If two policy files conflict, higher authority wins.
- Scoped policies may add restrictions but may not weaken root hard constraints.

## 2. Objective Function

Optimize in this order:

1. Correctness
2. Architectural consistency
3. Maintainability
4. Readability
5. Visual polish
6. Additional features

## 3. Root Hard Constraints

- Keep architecture static-first; do not introduce backend runtime.
- Do not add CMS, auth, comments, or database assumptions.
- Collection naming standard is `writing`.
- Keep content in `src/content/*`; do not move content into `src/pages/*`.
- Keep assets in `src/assets/content/<collection>/<slug>/`.
- Prefer `.astro` components; use React only for isolated interactivity.
- Do not add dependencies without clear, task-specific need.
- Keep public-facing copy in English.

Terminology rule:

- Do not spam repetitive naming reminders in every file.
- Keep naming normalization centralized in root/scoped policy only.

## 4. Mandatory Source-File Header Rule

For every created or modified source/code file, add a 3-line top-of-file explanatory header.

Scope of enforcement:

- required for code and executable/config source files
- not required for Markdown documentation files (`*.md`)

Header requirements:

- exactly 3 lines
- describes file purpose/scope/audience
- uses valid syntax for that file type

Syntax guidance:

- HTML/Astro: `<!-- ... -->`
- TS/JS/CSS: `/* ... */` or `// ...`
- Python/shell: `# ...`
- JSON: if pure JSON cannot contain comments, use a sidecar `<file>.comment.md` entry in same folder.

## 5. Repository Contract

- Routes: `src/pages/`
- Content: `src/content/projects/`, `src/content/writing/`, `src/content/reviews/`
- Content schema: `src/content.config.ts`
- Content helpers: `src/lib/content.ts`
- Layouts: `src/layouts/BaseLayout.astro`, `src/layouts/PostLayout.astro`
- MDX media: `src/components/content/Figure.astro`, `src/components/content/YouTubeEmbed.astro`

Canonical route behavior:

- listing routes: `/projects`, `/writing`, `/reviews`
- detail routes: catch-all files (`[...slug].astro`)

## 6. Data And Schema Contract

Public data filtering must enforce:

```ts
projects: !data.archived;
writing: !data.draft && !data.archived;
reviews: !data.archived;
```

Sorting default:

- newest first by `pubDate`

Schema requirements in `src/content.config.ts`:

- use `z` from `astro/zod`
- use explicit validators
- use explicit URL validation (`z.url()` preferred)
- keep cover image + alt text required for all entries

## 7. Execution Protocol

For each non-trivial task:

1. Inspect affected files and adjacent contracts.
2. Implement minimal, scoped edits.
3. Keep naming and folder conventions consistent.
4. Validate with required checks.
5. Report exactly what changed and why.

Required checks before completion:

```bash
pnpm format
pnpm check
pnpm build
```

## 8. Completion Criteria

A task is complete only if all statements are true:

- requested behavior is implemented
- no architecture contract violation exists
- required checks pass (or failure is reported with cause)
- changed files remain consistent with policy hierarchy
- file-header rule is satisfied for all touched files

## 9. Policy Topology

Use `docs/AGENT_MAP.md` as the canonical index of all scoped policy files.

Any new scoped policy file must be added to the map in the same change.

## 10. Policy Change Logging

Any rule-level governance change must append a record to `docs/DECISIONS.md`.

## 11. Optional Context Source

For templates, examples, and workflow depth, consult `docs/WORKFLOW_REFERENCE.md`.
