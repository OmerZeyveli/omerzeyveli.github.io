<!-- Governance decisions log -->
<!-- Scope: policy-level architecture decisions -->
<!-- Audience: autonomous coding agents and maintainers -->

# DECISIONS

## 2026-03-24 - Adopt Level 2 Balanced Governance

- id: DEC-0001
- status: accepted
- change: governance model switched to Level 2 Balanced
- reason: improve agent reliability and reduce policy ambiguity
- impact:
  - root policy defines authority and hard constraints
  - scoped policy files allowed through map-based indexing
  - policy updates require decision logging

## 2026-03-24 - Introduce Mandatory 3-Line File Header Rule

- id: DEC-0002
- status: accepted
- change: every created/modified file must include a 3-line top header comment
- reason: improve agent comprehension and file-level context handoff
- impact:
  - all new policy files include valid 3-line headers
  - future edits must satisfy file-header contract by file type
  - pure JSON requires sidecar comment file when needed

## 2026-03-24 - Centralize Naming Normalization

- id: DEC-0003
- status: accepted
- change: `writing` naming rule centralized to policy layer
- reason: avoid repetitive reminders and policy noise
- impact:
  - rule remains enforced globally
  - repeated reminders removed from scattered docs

## 2026-03-24 - Narrow Header Rule To Source Files

- id: DEC-0004
- status: accepted
- change: 3-line header rule applies to source/code files and excludes Markdown docs
- reason: optimize AI comprehension for implementation files without adding noise to documentation
- impact:
  - `*.md` files are exempt from mandatory header enforcement
  - Astro and other source files remain mandatory under the header rule
  - completion checks now interpret header compliance as source-file scoped

## 2026-03-24 - Disallow Policy Files In Routable Directories

- id: DEC-0005
- status: accepted
- change: scoped policy files must not be placed inside `src/pages/**`
- reason: prevent accidental publication of internal governance files as public routes
- impact:
  - route policy moved to `docs/policies/src-pages.AGENTS.md`
  - policy mapping remains path-based through `docs/AGENT_MAP.md`
  - canonical public route set is protected from governance leaks

## 2026-03-26 - Clarify Astro Header Placement

- id: DEC-0006
- status: accepted
- change: clarified mandatory header rule for `.astro` files to use 3 `//` comment lines at the top of the frontmatter block
- reason: enforce stable top-of-file intent for humans/AI while avoiding formatter/parser conflicts with HTML comments before frontmatter
- impact:
  - `AGENTS.md` syntax guidance now separates HTML and Astro behavior
  - header migration prompt now includes an explicit Astro exception for line placement
  - future header migrations have deterministic, tool-stable behavior for `.astro` files
