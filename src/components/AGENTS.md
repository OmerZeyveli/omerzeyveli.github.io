<!-- Scoped policy for components -->
<!-- Scope: src/components/** -->
<!-- Audience: autonomous coding agents only -->

# src/components/AGENTS.md

## 0. Scope

Applies to all files under `src/components/**`.

## 1. Inheritance

Inherits root constraints from `AGENTS.md` and `src/AGENTS.md`.

## 2. Component Boundaries

- Use `.astro` components by default.
- Use React only for isolated interactive islands.
- Keep presentational UI in `src/components/ui/`.
- Keep MDX helper blocks in `src/components/content/`.
- Keep layout parts in `src/components/layout/`.

## 3. Implementation Rules

- Keep components small and single-responsibility.
- Favor composability over monolithic component files.
- Preserve accessibility semantics in interactive elements.

## 4. Performance Rules

- Avoid hydration unless interaction requires it.
- Avoid heavy runtime dependencies in component implementations.
