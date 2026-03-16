# AGENTS.md

This file defines the implementation rules for AI coding agents working on this repository.

The goal is simple:

> Build and refine a developer-first personal website with a clean, static, scalable architecture.

Do not treat this repository like a generic template. Respect the architecture, naming, and content model defined below.

---

## 1. Primary Goal

Build a personal website that includes:

- project case studies
- writing
- reviews
- about page

The site must feel:

- developer-first
- editorial
- image-forward
- clean
- maintainable

The site is **not** meant to become a backend-heavy app or a generic CMS product.

---

## 2. Core Stack

You must work within this stack unless explicitly told otherwise.

- Astro
- React
- TypeScript
- Tailwind CSS v4
- MDX
- Astro Content Collections
- GitHub Pages deployment

### Stack rules

- Prefer `.astro` components by default.
- Use React only for isolated interactive islands.
- Do not introduce a backend.
- Do not add a CMS.
- Do not add new libraries unless they solve a clear problem.

---

## 3. Architecture Rules

### Routing

All route files live in:

- `src/pages/`

Canonical routes:

- `/`
- `/projects`
- `/projects/[slug]`
- `/writing`
- `/writing/[slug]`
- `/reviews`
- `/reviews/[slug]`
- `/about`
- `/404`

Implementation note:

- Detail route files should use catch-all patterns (`[...slug].astro`) so nested content paths are supported while canonical single-segment URLs continue to work.

### Content

All content entries live in:

- `src/content/projects/`
- `src/content/writing/`
- `src/content/reviews/`

### Assets

Collection-specific assets live in:

- `src/assets/content/projects/`
- `src/assets/content/writing/`
- `src/assets/content/reviews/`

### Components

Use these conventions:

- `src/components/layout/` for header, footer, shared layout pieces
- `src/components/content/` for MDX-supporting content blocks
- `src/components/islands/` for interactive React components only
- `src/components/ui/` for reusable presentational UI
- `src/components/sections/` for page section building blocks

### Layouts

- `src/layouts/BaseLayout.astro` is the global shell
- `src/layouts/PostLayout.astro` is used for collection detail pages

### Helpers

- `src/lib/content.ts` contains collection fetching and sorting helpers
- `src/config/site.ts` contains site-wide configuration

---

## 4. Naming Rules

These naming rules are strict.

- Public label is **Writing**, not Blog.
- Internal collection name is also **writing**.
- Do not reintroduce `blog` naming anywhere.
- Use lowercase, hyphen-separated slugs.
- Use descriptive file names for content and assets.

Bad examples:

- `BlogCard.astro`
- `blog.ts`
- `MyPost.mdx`
- `image1.jpg`

Better examples:

- `WritingCard.astro`
- `content.ts`
- `building-the-site-foundation.mdx`
- `project-dashboard-cover.jpg`

---

## 5. Content Collection Rules

All collections are defined in:

- `src/content.config.ts`

Use `z` from `astro/zod`.

Use explicit validators.

### Writing schema expectations

Required:

- `title`
- `description`
- `pubDate`
- `category`
- `cover`
- `coverAlt`

Optional:

- `updatedDate`
- `tags`
- `featured`
- `draft`

### Projects schema expectations

Required:

- `title`
- `summary`
- `pubDate`
- `year`
- `status`
- `category`
- `stack`
- `cover`
- `coverAlt`

Optional:

- `featured`
- `repoUrl`
- `liveUrl`

### Reviews schema expectations

Required:

- `title`
- `description`
- `pubDate`
- `type`
- `cover`
- `coverAlt`

Optional:

- `platform`
- `releaseYear`
- `status`
- `score`
- `tags`
- `featured`

### Schema rules

- URLs must use an explicit URL validator.
- Prefer `z.url()` on current Astro/Zod versions. `z.string().url()` is acceptable when compatibility requires it.
- Cover images should use Astro image schema support.
- All entries must have meaningful alt text.
- Keep schema strict and explicit.

---

## 6. Data Fetching Rules

Use shared helpers in:

- `src/lib/content.ts`

### Sorting

Default sort order:

- newest first by `pubDate`

### Draft filtering

Writing drafts must not appear publicly.

When querying Writing entries, explicitly filter drafts.

Example pattern:

```ts
const posts = await getCollection("writing", ({ data }) => !data.draft);
```

If filtering is done after retrieval, the public result must still exclude drafts.

### Query rules

- Keep query logic centralized where possible.
- Do not duplicate sorting/filtering logic across many pages without reason.
- Prefer helper functions over repeated inline collection handling.
- When only top N entries are needed (for example latest or featured sections), helper functions may use partial selection instead of fully sorting the entire collection.

---

## 7. Page Build Rules

### Home page

The home page must include:

- hero
- featured projects
- latest writing
- latest reviews

Rules:

- tone must be developer-first
- cards must include cover images
- section labels must be consistent
- layout should stay calm and readable

### Projects listing page

Each project card should include:

- cover image
- title
- summary
- year
- category
- visible stack subset

### Project detail page

Each project detail page should support:

- hero cover image
- rich body content
- inline figures
- YouTube embeds when useful
- case-study-style writing

### Writing listing page

Each card should include:

- cover image
- title
- description
- category
- date

### Writing detail page

Should support:

- hero cover
- rich prose
- inline media components

### Reviews listing page

Each card should include:

- cover image
- title
- description
- type
- optional score

### Review detail page

Should support:

- hero cover
- body content
- inline images or video
- structured verdict-driven writing

### About page

Should explain:

- who the owner is
- what the site is for
- what kinds of content appear here

---

## 8. Media Rules

Media is part of the content strategy, not decoration.

### Required media rules

- Every content entry must have a cover image.
- Every cover image must have alt text.
- Detail pages should support rich inline media.
- Do not add media blocks just for visual noise.

### Supported V1 content media

- `Figure.astro`
- `YouTubeEmbed.astro`

### Asset rules

- Keep assets inside the correct collection folder.
- Use descriptive names.
- Prefer local assets over external hotlinked media.

---

## 9. Styling Rules

The project uses Tailwind CSS v4.

### Important Tailwind note

Do not assume `tailwind.config.*` must exist.

Tailwind v4 allows CSS-first configuration. In this repo, the default styling source is:

- `src/styles/global.css`

If a Tailwind config file becomes necessary later, place it at the project root as:

- `tailwind.config.mjs`

### Design direction

The visual style should remain:

- dark-first
- editorial
- spacious
- image-forward
- restrained

Avoid:

- noisy gradients everywhere
- excessive animation
- cramped layouts
- overdesigned portfolio-template aesthetics

---

## 10. React and Islands Rules

Use React only when static Astro components are not enough.

### Allowed React use cases

- interactive filters
- tabs
- carousels
- complex client-side UI state
- future media viewers

### Rules

- React components belong in `src/components/islands/`
- keep islands small and isolated
- do not convert static content sections into React unnecessarily
- prefer server-rendered/static output by default

---

## 11. Copy and Editorial Rules

All public-facing copy must be in English.

### Tone

The voice should be:

- thoughtful
- calm
- technical but readable
- confident without hype

### Projects writing

- write as case studies
- explain goals and tradeoffs
- avoid vague product-marketing language

### Reviews writing

- do not rely only on scores
- provide judgment and reasoning
- keep structure clear

### Writing entries

- avoid filler content
- make each entry purposeful
- prefer strong titles and clean descriptions

---

## 12. Accessibility Rules

Accessibility is required.

### Minimum rules

- all images need alt text
- heading hierarchy must make sense
- links must be recognizable
- keyboard access must remain intact
- contrast must stay readable in dark mode
- focus states must remain visible

Do not sacrifice accessibility for aesthetics.

---

## 13. Performance Rules

The site must stay lightweight.

### Rules

- prefer static rendering
- hydrate only when necessary
- do not add heavy libraries casually
- use optimized local images
- avoid unnecessary client-side runtime complexity

---

## 14. SEO Rules

Baseline SEO is required.

### Rules

- every page needs a meaningful title
- every page needs a meaningful description
- titles should follow a consistent template
- `astro.config.mjs` must contain the correct production `site` value
- sitemap generation must remain enabled

Prepare the structure so Open Graph improvements can be added later.

---

## 15. Deployment Rules

Deployment target:

- GitHub Pages
- custom domain

### Required files

- `.github/workflows/deploy.yml`
- `astro.config.mjs`
- `public/CNAME`

### Deployment assumptions

- fully static build
- no backend runtime
- custom domain configured correctly

Do not introduce deployment assumptions that require a server.

---

## 16. Quality Gates

Before considering a task complete, verify:

```bash
pnpm format
pnpm check
pnpm build
```

Also verify manually:

- changed routes load correctly
- cards render correctly
- cover images display correctly
- no old `blog` naming remains
- English copy is consistent

---

## 17. Safe Change Strategy

When making larger changes:

1. inspect the current file structure first
2. preserve the existing architecture
3. update naming consistently across all affected files
4. avoid partial renames
5. verify imports after moving files
6. run checks before finishing

Do not leave half-migrated states.

---

## 18. What You Should Not Do

Do not:

- add a backend
- add a CMS
- reintroduce `blog` naming
- move content into `src/pages/`
- place content assets in random folders
- use React for static sections
- add libraries without need
- generate placeholder-heavy junk content
- ignore alt text
- change architecture casually

---

## 19. Good Task Examples

Examples of good future tasks:

- create reusable archive cards for writing, projects, and reviews
- improve metadata handling in layouts
- add a reusable tag list component
- add a project meta block component
- add reading time to writing entries
- refine empty states
- improve mobile spacing
- add a reusable callout component for MDX

---

## 20. Agent Execution Priority

When working on this repo, prioritize in this order:

1. correctness
2. architectural consistency
3. readability
4. maintainability
5. visual polish
6. extra features

If there is a tradeoff, choose the option that keeps the site simpler and more durable.
