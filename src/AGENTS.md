<!-- Scoped policy for source tree -->
<!-- Scope: src/** -->
<!-- Audience: autonomous coding agents only -->

# src/AGENTS.md

## 0. Scope

Applies to all files under `src/**`.

## 1. Inheritance

Inherits root constraints from `AGENTS.md`.

## 2. Additional Restrictions

- Keep routing logic in `src/pages/` only.
- Keep content entries in `src/content/` only.
- Keep shared data/query helpers in `src/lib/`.
- Keep site-level config in `src/config/`.
- Keep styling defaults in `src/styles/`.

## 3. Naming And Structure

- Use lowercase hyphenated slugs for content paths.
- Prefer responsibility-focused small modules.
- Avoid cross-folder coupling when local helper scope is enough.

## 4. Validation Focus

After significant `src/**` edits, prioritize:

- `pnpm check`
- `pnpm build`
