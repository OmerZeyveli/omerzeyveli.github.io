<!-- Scoped policy for content entries -->
<!-- Scope: src/content/** -->
<!-- Audience: autonomous coding agents only -->

# src/content/AGENTS.md

## 0. Scope

Applies to all files under `src/content/**`.

## 1. Inheritance

Inherits root constraints from `AGENTS.md` and `src/AGENTS.md`.

## 2. Collection Rules

- Allowed collections: `projects`, `writing`, `reviews`.
- Keep `writing` as canonical naming; do not introduce parallel aliases.
- Use lowercase, hyphen-separated file names.

## 3. Frontmatter Rules

- Respect schema requirements defined in `src/content.config.ts`.
- Always include required fields for the target collection.
- Ensure `cover` and meaningful `coverAlt` are present.
- Keep public-facing content in English.

## 4. Publishing Rules

- Public outputs must exclude archived entries.
- Writing public outputs must exclude draft entries.
- Keep metadata realistic; avoid placeholder publish values in committed entries.
