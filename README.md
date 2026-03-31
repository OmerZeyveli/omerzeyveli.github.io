# Personal Website Project

**THIS PROJECT WAS BUILT WITH HELP FROM AGENTIC AI.**

A static, developer-first personal site for projects, writing, and reviews. Built with Astro + TypeScript + MDX and deployed to GitHub Pages.

## Stack

- Astro
- TypeScript
- MDX
- Tailwind CSS v4

## Content structure

- `src/content/projects/` for project case studies
- `src/content/writing/` for writing and notes
- `src/content/reviews/` for reviews
- `src/assets/content/<collection>/<slug>/` for content media

## Key routes

- `/projects` and `/projects/[slug]`
- `/writing` and `/writing/[slug]`
- `/reviews` and `/reviews/[slug]`

## Development

Install dependencies:

```bash
pnpm install
```

Run the dev server:

```bash
pnpm dev
```

Build:

```bash
pnpm build
```

Format and type-check:

```bash
pnpm format
pnpm check
```

## Content rules (summary)

- Keep content entries in `src/content/*` and assets in `src/assets/content/*`.
- Required fields are enforced by `src/content.config.ts`.
- Public content must exclude archived entries; writing must also exclude drafts.

## Deploy

The site is configured for GitHub Pages with a custom domain. Production `site` is set in `astro.config.mjs` and the domain lives in `public/CNAME`.
