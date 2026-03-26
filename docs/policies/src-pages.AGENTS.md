<!-- Scoped policy for routes -->
<!-- Scope: src/pages/** -->
<!-- Audience: autonomous coding agents only -->

# src/pages/AGENTS.md

## 0. Scope

Applies to all files under `src/pages/**`.

## 1. Inheritance

Inherits root constraints from `AGENTS.md` and `src/AGENTS.md`.

## 2. Route Contract

- Canonical listing routes: `/projects`, `/writing`, `/reviews`.
- Detail routes must use catch-all forms: `[...slug].astro`.
- Keep route generation responsibilities in this folder only.

## 3. Data Usage Rules

- Prefer shared query helpers from `src/lib/content.ts`.
- Do not duplicate filtering/sorting logic across multiple route files.
- Ensure published pages respect draft/archive filtering contract.

## 4. Rendering Rules

- Preserve static-first output.
- Use Astro components by default.
- Avoid unnecessary client hydration in route files.
