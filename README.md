# Riive Personal Site

Developer-first personal site built with **Astro + React + TypeScript + Tailwind CSS + MDX**, designed for **GitHub Pages** deployment with a **custom domain**.

This project is meant to serve as a long-term home for:

- project case studies
- writing / essays / devlogs
- reviews across games, movies, series, books, and tech

The site is intentionally **static, scalable, and backend-free**.

---

## 1. Project Goals

This site is being built with a few clear priorities:

1. **Developer-first presentation**  
   The site should present technical work clearly, with projects treated as case studies rather than just link cards.

2. **Strong editorial feel**  
   Writing and reviews should feel readable, calm, and well-structured instead of looking like generic blog templates.

3. **Backend-free content management**  
   No CMS and no custom backend. Content is stored in the repository as MDX files.

4. **Scalable structure**  
   The codebase should stay clean as more pages, entries, images, and components are added.

5. **AI-friendly workflow**  
   The repo should be easy to understand for both humans and AI tools like GitHub Copilot.

---

## 2. Tech Stack

### Core

- **Astro** for the site framework
- **React** for interactive components where needed
- **TypeScript** for safer code and maintainability
- **Tailwind CSS** for utility-based styling
- **MDX** for rich content pages with embedded components

### Content

- **Astro Content Collections** for typed content schemas
- MDX content stored directly in the repo
- Local assets stored inside `src/assets/`

### Tooling

- **Node.js 24 LTS**
- **pnpm** as package manager
- **VS Code** as the main IDE
- **GitHub Copilot** for assisted development

### Hosting

- **GitHub Pages**
- **Custom domain**

---

## 3. Why This Architecture?

### Why Astro?

Astro is a very good fit for this project because:

- the site is mostly static
- content is a first-class concern
- pages load fast
- MDX works well for long-form content
- GitHub Pages deployment is straightforward

### Why no backend?

A backend is unnecessary for the current scope.

The site does not need:

- user accounts
- comments
- admin panels
- dynamic databases
- runtime content editing

Instead, content is added through version-controlled files. This keeps the setup simple, cheap, and reliable.

### Why MDX?

MDX allows writing normal markdown content while also embedding custom UI components directly inside entries.

That means a project page can include:

- inline screenshots
- image figures with captions
- YouTube videos
- callouts
- future custom content blocks

This is important because project pages and reviews should not be plain walls of text.

---

## 4. Content Model

The site is split into three main content collections.

### Projects

Projects are not just portfolio cards. They should behave like lightweight case studies.

Each project can include:

- overview
- goals
- stack
- process
- screenshots
- embedded video
- challenges
- lessons learned
- links to repo or live site

### Writing

Writing is the long-form editorial section of the site.

This includes:

- essays
- devlogs
- notes
- breakdowns

The reason the section is called **Writing** instead of **Blog** is that it is more flexible and feels less generic.

### Reviews

Reviews are multi-type from the start.

Supported types:

- game
- movie
- series
- book
- tech

This means the section can grow naturally without changing the structure later.

---

## 5. Routing Strategy

The site uses Astro file-based routing.

### Main routes

- `/` → home page
- `/projects` → all project entries
- `/projects/[slug]` → project detail page
- `/writing` → all writing entries
- `/writing/[slug]` → writing detail page
- `/reviews` → all review entries
- `/reviews/[slug]` → review detail page
- `/about` → about page
- `/404` → not found page

### Important distinction

- `src/pages/` is used for routes
- `src/content/` is used for content entries

This separation is essential.

---

## 6. Directory Structure

A simplified project structure looks like this:

```text
personal-site/
├─ .github/
│  └─ workflows/
│     └─ deploy.yml
├─ .vscode/
│  ├─ extensions.json
│  └─ settings.json
├─ public/
│  ├─ CNAME
│  └─ og/
├─ src/
│  ├─ assets/
│  │  └─ content/
│  │     ├─ projects/
│  │     ├─ reviews/
│  │     └─ writing/
│  ├─ components/
│  │  ├─ content/
│  │  │  ├─ Figure.astro
│  │  │  └─ YouTubeEmbed.astro
│  │  ├─ islands/
│  │  │  └─ (React components live here when client-side interactivity is needed)
│  │  ├─ layout/
│  │  │  ├─ SiteFooter.astro
│  │  │  └─ SiteHeader.astro
│  │  ├─ sections/
│  │  └─ ui/
│  ├─ config/
│  │  └─ site.ts
│  ├─ content/
│  │  ├─ projects/
│  │  ├─ reviews/
│  │  └─ writing/
│  ├─ layouts/
│  │  ├─ BaseLayout.astro
│  │  └─ PostLayout.astro
│  ├─ lib/
│  │  └─ content.ts
│  ├─ pages/
│  │  ├─ about.astro
│  │  ├─ index.astro
│  │  ├─ 404.astro
│  │  ├─ projects/
│  │  │  ├─ index.astro
│  │  │  └─ [slug].astro
│  │  ├─ reviews/
│  │  │  ├─ index.astro
│  │  │  └─ [slug].astro
│  │  └─ writing/
│  │     ├─ index.astro
│  │     └─ [slug].astro
│  ├─ styles/
│  │  └─ global.css
│  └─ content.config.ts
├─ .editorconfig
├─ .gitignore
├─ .nvmrc
├─ .prettierrc
├─ astro.config.mjs
├─ package.json
├─ pnpm-lock.yaml
├─ README.md
├─ tailwind.config.mjs (optional; only add if CSS-first config needs to be extracted)
└─ tsconfig.json
```

---

## 7. What Each Directory Is Responsible For

### `src/pages/`

Contains route files.

Examples:

- `index.astro` renders the home page
- `projects/index.astro` renders the projects listing page
- `projects/[slug].astro` renders each project detail page

### `src/content/`

Contains the actual content entries.

Examples:

- `src/content/projects/my-project.mdx`
- `src/content/writing/some-note.mdx`
- `src/content/reviews/game-review.mdx`

These are content files, not page routes.

### `src/assets/content/`

Contains local images used by content entries.

This is where cover images and inline content images should live.

### `src/components/content/`

Contains content-specific components for MDX.

Examples:

- `Figure.astro`
- `YouTubeEmbed.astro`

These make it possible to place rich media inside content.

### `src/components/islands/`

Contains interactive React components that are hydrated on the client only when necessary.

Examples of future candidates:

- carousels
- filters
- tabs
- media viewers
- theme or preference widgets

Rules:

- prefer `.astro` components by default
- use React only when interactivity is truly needed
- keep client-side islands isolated from static layout code

### `src/components/layout/`

Contains reusable layout pieces such as the header and footer.

### `src/layouts/`

Contains page-level wrappers.

- `BaseLayout.astro` is the shared outer shell
- `PostLayout.astro` is used for content detail pages

### `src/lib/`

Contains helper functions.

For example, `content.ts` fetches and sorts entries from content collections.

### `src/config/`

Contains site-wide configuration such as:

- site title
- navigation items
- social links
- base metadata

---

## 8. Content Collections

The site uses Astro Content Collections to keep content typed and structured.

The schemas live in:

- `src/content.config.ts`

### Why this matters

Without schemas, content grows messy over time.

With collections:

- entries are validated
- required fields are enforced
- cover images are consistent
- data is easier to query and sort

### Planned collection fields

#### Writing

Typical fields:

- `title`
- `description`
- `pubDate`
- `updatedDate`
- `category`
- `tags`
- `cover`
- `coverAlt`
- `featured`
- `draft`

#### Projects

Typical fields:

- `title`
- `summary`
- `pubDate`
- `year`
- `status`
- `category`
- `stack`
- `cover`
- `coverAlt`
- `featured`
- `repoUrl`
- `liveUrl`

#### Reviews

Typical fields:

- `title`
- `description`
- `pubDate`
- `type`
- `platform`
- `releaseYear`
- `status`
- `score`
- `tags`
- `cover`
- `coverAlt`
- `featured`

---

## 9. Media Strategy

A key design rule for the project:

> Detail pages should not be text-only.

That means:

- every card should have a cover image
- every detail page should support rich media
- project pages should feel like case studies
- reviews should include visual context where appropriate
- writing should optionally support diagrams, figures, or embedded media

### Cover images

Every entry in:

- projects
- reviews
- writing

should include a cover image.

This improves:

- card design consistency
- home page sections
- social sharing potential
- perceived visual quality

### Inline media in MDX

MDX entries can import and use custom components such as:

- `Figure`
- `YouTubeEmbed`

This allows content like:

- screenshots inside project writeups
- trailers inside reviews
- diagrams inside technical writing

---

## 10. Current Layout Philosophy

The intended visual direction is:

- dark-first
- clean
- spacious
- editorial
- image-forward
- technical but human

This should not feel like an overly flashy portfolio template.

The site should feel closer to:

- a personal technical publication
- a case study archive
- a curated developer identity site

---

## 11. Home Page Strategy

The home page is not just a landing page. It sets the tone for the entire site.

### Home page should communicate:

- who you are
- what you build
- what you write about
- what kind of reviews you publish

### Main sections

- Hero
- Featured Projects
- Latest Writing
- Latest Reviews
- Optional current focus section later

### Tone

The tone should be **developer-first**.

That means the site should present you primarily as a builder, with writing and reviews as extensions of that identity.

---

## 12. Project Page Philosophy

Project pages are one of the most important parts of the site.

They should not be shallow showcase pages.

Each project page should ideally include:

1. Overview
2. Goal or context
3. Stack
4. Process
5. Screenshots or media
6. Problems and tradeoffs
7. Outcome
8. Lessons learned
9. Links

This makes projects more valuable both for readers and for future portfolio use.

---

## 13. Writing Page Philosophy

Writing is the flexible long-form section.

This area can include:

- technical notes
- process logs
- essays
- architectural thinking
- reflections on building

It should feel more editorial and more text-focused than the projects section, but still support media when useful.

---

## 14. Review Page Philosophy

Reviews should be opinionated, structured, and readable.

They should not be just score dumps.

A review page can include:

- quick verdict
- what the work is
- what works
- what does not work
- who it is for
- score if relevant
- screenshots or video embeds when useful

Because reviews are multi-type, the structure should stay flexible.

---

## 15. Shared UI Conventions

### Language

All public-facing UI and content should be in **English**.

### Writing style

The site voice should be:

- calm
- thoughtful
- technical but readable
- confident without sounding loud

### Visual consistency

- rounded cards
- strong spacing
- muted grays with focused contrast
- clean typography
- restrained use of motion

---

## 16. Tailwind and Styling Notes

The project uses **Tailwind CSS v4** with the Vite plugin and CSS-first configuration.

### Important rule

A `tailwind.config.mjs` file is **not required by default** for this project.

Tailwind v4 supports CSS-first configuration, so many theme and utility decisions can live directly in CSS.

### Root-level convention

If a Tailwind config file becomes necessary later, it must live at the project root as:

- `tailwind.config.mjs`

Do not create multiple Tailwind config files.

### Styling rules

- global styling starts in `src/styles/global.css`
- avoid scattering theme decisions across many files
- if design tokens become complex, document them clearly before expanding configuration

---

## 17. Development Commands

Typical commands:

```bash
pnpm dev
pnpm check
pnpm build
pnpm preview
pnpm format
```

### What they do

- `pnpm dev` starts the local development server
- `pnpm check` runs Astro checks and diagnostics
- `pnpm build` creates the production build
- `pnpm preview` previews the production build locally
- `pnpm format` formats the project with Prettier

---

## 18. Adding New Content

### Add a new writing entry

1. Create a new `.mdx` file in `src/content/writing/`
2. Add the required frontmatter fields
3. Add a cover image from `src/assets/content/writing/`
4. Write the content
5. Optionally embed figures or a YouTube video

### Add a new project entry

1. Create a new `.mdx` file in `src/content/projects/`
2. Add metadata such as title, status, stack, category, and links
3. Add a cover image
4. Write the project as a case study

### Add a new review entry

1. Create a new `.mdx` file in `src/content/reviews/`
2. Add metadata such as type, score, platform, and tags
3. Add a cover image
4. Write the review with clear structure

---

## 18. Data Fetching and Collection Query Rules

Content query behavior must stay explicit and predictable.

### General rules

- use shared helpers in `src/lib/content.ts` when possible
- sort collection entries by `pubDate` descending unless there is a strong reason not to
- keep filtering logic close to the data layer instead of duplicating it in every page

### Draft filtering rule

Astro's `getCollection()` returns all entries by default, so draft filtering must be applied intentionally.

Use filtering like this for Writing entries:

```ts
const posts = await getCollection("writing", ({ data }) => !data.draft);
```

If filtering is done after retrieval, the behavior must remain equivalent.

### Schema rule

Collection schemas must use `z` from `astro/zod`.

Examples:

- strings: `z.string()`
- numbers: `z.number()`
- booleans: `z.boolean()`
- arrays: `z.array(z.string())`
- URLs: `z.string().url()`

Do not describe schema fields vaguely in implementation code. Use explicit Zod validators.

---

## 19. Deployment Strategy

The site is intended to be deployed through **GitHub Pages**.

### Deployment flow

- code is pushed to GitHub
- GitHub Actions runs the Astro build
- static output is deployed to GitHub Pages
- the custom domain points to GitHub Pages

### Important files

- `.github/workflows/deploy.yml`
- `astro.config.mjs`
- `public/CNAME`

### Domain notes

The final production domain should be configured in:

- `astro.config.mjs` via the `site` field
- `public/CNAME`

This helps with:

- canonical URLs
- sitemap generation
- proper custom domain deployment

---

## 20. VS Code Setup

VS Code is the chosen primary IDE for this project.

Recommended extensions:

- Astro
- Prettier
- ESLint
- Tailwind CSS IntelliSense
- GitHub Copilot
- GitHub Copilot Chat

### Why VS Code

It fits the project well because:

- Astro support is strong
- Copilot workflow is smoother
- MDX and Tailwind editing are comfortable
- it is lightweight and easy to keep focused

---

## 21. GitHub Copilot Workflow

The repo is being prepared to work well with AI-assisted development.

That means:

- directory names should be clear
- schemas should be explicit
- naming should stay consistent
- components should have obvious responsibilities
- content and layout concerns should stay separated

### Working style with Copilot

When using Copilot for larger tasks:

1. define the target clearly
2. limit each task to one concern
3. provide file paths when asking for edits
4. ask for implementation that matches the existing architecture
5. review generated code before accepting it

### Good examples of future Copilot tasks

- build a responsive card component for collection entries
- add tag filtering to the writing page
- improve Open Graph metadata
- add social links to the footer
- create a reusable callout component for MDX
- add reading time to writing entries
- add structured data for project pages

---

## 22. Architecture Rules

These rules should stay stable unless there is a very good reason to change them.

1. **No backend unless truly necessary**
2. **All content stays in the repo**
3. **All public UI stays in English**
4. **Projects, Writing, and Reviews each remain distinct collections**
5. **Every entry should have a cover image**
6. **Detail pages should support rich media**
7. **Projects should be written as case studies, not just summaries**
8. **Keep components small and responsibility-focused**
9. **Prefer static generation over complexity**
10. **Do not introduce libraries without a clear reason**

---

## 23. Immediate Next Steps

The next practical steps for the project are:

1. finish the `blog` → `writing` rename everywhere
2. finalize collection schemas
3. ensure image-backed cards work for all list pages
4. verify MDX media components work in all detail routes
5. connect GitHub Pages deployment
6. set up the custom domain
7. refine metadata and SEO
8. improve empty states and polish
9. add the first real entries

---

## 24. Long-Term Ideas

Possible future additions:

- tag filtering
- category filtering
- reading time for writing entries
- project timeline blocks
- image gallery component
- code snippet styling improvements
- search
- Open Graph image generation
- RSS feed
- uses page
- now page

These are optional and should only be added when they improve the site meaningfully.

---

## 25. Final Principle

This site should remain:

- personal
- readable
- technically solid
- visually consistent
- easy to maintain

It is not meant to become a complicated content platform.

It is meant to be a clean, long-term home for work, writing, and taste.

---

## 26. V1 Scope

This README now also acts as a **build contract** for the first production-ready version of the site.

### In scope for V1

- Home page
- Projects listing page
- Project detail pages
- Writing listing page
- Writing detail pages
- Reviews listing page
- Review detail pages
- About page
- 404 page
- GitHub Pages deployment
- Custom domain support
- Sitemap generation
- Typed content collections
- MDX content with inline media support
- Cover-image-based cards for all collections

### Explicitly out of scope for V1

- search
- comments
- CMS integration
- authentication
- analytics dashboards
- pagination
- RSS
- tag filtering UI
- category filtering UI
- image galleries beyond simple reusable blocks
- dynamic user features

If something is not listed in V1 scope, it should be treated as optional future work.

---

## 27. Canonical Content Contracts

The following content rules are not suggestions. They are the default contract for the project.

### General rules for all collections

- Every entry must have a `title`.
- Every entry must have a `pubDate`.
- Every entry must have a `cover` image.
- Every entry must have a `coverAlt` string.
- All slugs must be lowercase and file-name based.
- Content files must live inside `src/content/<collection>/`.
- Content assets should live inside `src/assets/content/<collection>/`.
- Draft content must not appear on public listing pages.

### Writing collection contract

Required fields:

- `title: string`
- `description: string`
- `pubDate: Date`
- `category: "essay" | "devlog" | "note" | "breakdown"`
- `cover: image`
- `coverAlt: string`

Optional fields:

- `updatedDate: Date`
- `tags: string[]`
- `featured: boolean`
- `draft: boolean`

### Projects collection contract

Required fields:

- `title: string`
- `summary: string`
- `pubDate: Date`
- `year: number`
- `status: "planned" | "in-progress" | "completed"`
- `category: "web" | "game" | "tool" | "experimental" | "other"`
- `stack: string[]`
- `cover: image`
- `coverAlt: string`

Optional fields:

- `featured: boolean`
- `repoUrl: url`
- `liveUrl: url`

### Reviews collection contract

Required fields:

- `title: string`
- `description: string`
- `pubDate: Date`
- `type: "game" | "movie" | "series" | "book" | "tech"`
- `cover: image`
- `coverAlt: string`

Optional fields:

- `platform: string`
- `releaseYear: number`
- `status: "finished" | "ongoing" | "revisited"`
- `score: number`
- `tags: string[]`
- `featured: boolean`

### Collection behavior rules

- Listing pages sort by `pubDate` descending by default.
- Home page sections also prefer `pubDate` descending.
- `featured: true` is used only for curated highlights.
- `draft: true` is currently only supported for Writing entries.
- Scores in Reviews use a **10-point scale**.

---

## 28. URL and Routing Contract

URL behavior must stay stable unless there is a strong reason to change it.

### Canonical routes

- `/`
- `/projects`
- `/projects/[slug]`
- `/writing`
- `/writing/[slug]`
- `/reviews`
- `/reviews/[slug]`
- `/about`
- `/404`

### URL rules

- Slugs come from content file names.
- Slugs must be lowercase.
- Use hyphen-separated file names.
- Avoid dates in file names unless absolutely necessary.
- Avoid changing slugs after publishing.

### Routing rules

- `src/pages/` owns route generation.
- `src/content/` owns entry content.
- Collection detail pages must use dynamic `[slug].astro` routes.
- `render(entry)` should be used for collection detail page rendering.

### Public naming rules

- Public navigation label is **Writing**, not Blog.
- The internal content collection is also **writing**.
- Do not keep parallel `blog` and `writing` structures.

---

## 29. Deploy and Environment Contract

The production target is GitHub Pages with a custom domain.

### Required deployment assumptions

- The site is fully static.
- There is no runtime backend.
- Production deployment happens through GitHub Actions.
- The domain is controlled outside GitHub and pointed to GitHub Pages.

### Required project files

- `.github/workflows/deploy.yml`
- `astro.config.mjs`
- `public/CNAME`

### Required Astro config decisions

- `site` must always point to the final production domain.
- `base` should not be introduced unless deployment requirements actually need it.
- If a custom domain is used, configuration must reflect that directly.

### Deployment safety rule

Before merging deployment-related changes, verify:

- local build succeeds
- `pnpm check` succeeds
- generated routes match expectations
- custom domain values are correct

---

## 30. Page-Level Build Spec

The following sections define the minimum page structure expected for V1.

### Home page

Required sections:

1. Hero
2. Featured Projects
3. Latest Writing
4. Latest Reviews

Home page rules:

- tone must be developer-first
- hero must explain who the site owner is and what the site contains
- each featured section must link to its archive page
- project, writing, and review cards must include images

### Projects listing page

Required parts:

- page intro
- grid of project cards

Each card must include:

- cover image
- title
- summary
- year
- category
- visible stack subset

### Project detail page

Expected structure:

1. title and meta
2. hero cover image
3. main body content
4. optional repo/live links inside content or meta blocks

Project page writing rules:

- write as a case study, not a shallow summary
- include images when useful
- embed video when useful
- explain process and tradeoffs when relevant

### Writing listing page

Required parts:

- page intro
- grid of writing cards

Each card must include:

- cover image
- title
- description
- category
- publish date

### Writing detail page

Expected structure:

1. title and meta
2. hero cover image
3. rich text body
4. optional inline figures or video embeds

### Reviews listing page

Required parts:

- page intro
- grid of review cards

Each card must include:

- cover image
- title
- description
- type
- optional score

### Review detail page

Expected structure:

1. title and meta
2. hero cover image
3. body content
4. optional inline media

Review writing rules:

- do not rely only on a score
- include an argument, perspective, or clear verdict
- visual context is encouraged when relevant

### About page

Minimum content:

- short personal introduction
- what the site is for
- what topics are covered

### 404 page

Minimum content:

- clear missing-page message
- link back to home

---

## 31. Media Contract

Media is not decorative filler. It is part of the content system.

### Cover image rules

- Every entry must have one cover image.
- Cover images must be local project assets.
- Cover images should be visually strong enough for card usage.
- Cover images must include meaningful alt text.

### Recommended cover standards

- prefer landscape orientation
- prefer consistent editorial framing
- avoid unreadable text-heavy cover designs
- avoid low-resolution source material

### Inline media rules

Supported inline media for V1:

- single figures
- YouTube embeds

Rules:

- inline media must support the written argument, not interrupt it
- use captions when context improves clarity
- do not overload pages with decorative embeds
- if a project or review benefits from media, include it intentionally

### Asset organization rules

- keep assets grouped by collection
- use descriptive file names
- avoid dumping unrelated media into shared folders

---

## 32. SEO and Metadata Contract

SEO is not a post-launch extra. It is part of the base implementation.

### Required metadata behavior

- Every page must have a meaningful title.
- Every page must have a useful description.
- Titles should use a consistent title template.
- Canonical URLs should reflect the production domain.

### Collection page expectations

- listing pages need archive-level metadata
- detail pages need entry-level metadata
- cover images should support future Open Graph use

### Required baseline SEO features for V1

- `site` configured in Astro config
- sitemap generation
- consistent page titles
- consistent page descriptions
- canonical-ready structure

### Post-V1 SEO candidates

- JSON-LD
- Open Graph image generation
- RSS
- robots policy refinements

---

## 33. Accessibility Contract

Accessibility is required, not optional polish.

### Required accessibility rules

- every image must have alt text
- headings must follow a logical hierarchy
- interactive elements must be keyboard reachable
- focus states must remain visible
- links must be clearly recognizable
- contrast must remain readable in dark mode

### Motion and interaction rules

- animation should stay restrained
- motion must never block readability
- do not rely on hover-only meaning
- future animation additions should consider reduced-motion behavior

### Content readability rules

- keep line lengths reasonable on detail pages
- maintain strong spacing between sections
- captions must remain legible
- avoid visually dense card layouts

---

## 34. Performance Contract

The site should stay lightweight by default.

### Core rules

- prefer static rendering
- use React only when interaction truly requires it
- do not hydrate components without a clear reason
- prefer Astro components over client-side complexity when possible

### Media rules

- use optimized local images
- avoid oversized assets
- avoid unnecessary media duplication

### Dependency rules

- do not add libraries casually
- every new dependency should solve a clear problem
- avoid introducing heavy runtime libraries for cosmetic reasons

---

## 35. Editorial Contract

The site voice and writing style should stay consistent.

### Language rules

- all public-facing UI must be in English
- all content entries must be written in English

### Tone rules

Writing should feel:

- thoughtful
- clear
- technical but readable
- calm rather than loud

### Projects writing rules

- explain intent, not just result
- include tradeoffs when relevant
- prefer concrete detail over vague hype

### Reviews writing rules

- do not use scores as a substitute for judgment
- explain what works and what does not
- keep the viewpoint personal but structured

### Writing section rules

- avoid filler posts
- each entry should have a reason to exist
- prefer strong titles and clear descriptions

---

## 36. Quality Gates

Before merging meaningful changes, the project should pass a basic quality checklist.

### Minimum checks

- `pnpm format`
- `pnpm check`
- `pnpm build`
- manual route test for changed pages
- manual image and content sanity check

### Content QA checklist

For new entries, verify:

- required frontmatter exists
- cover image exists
- cover alt text exists
- slug is clean
- description is usable
- English copy is consistent

### UI QA checklist

Verify:

- cards render correctly
- detail pages render correctly
- navigation links work
- no old `blog` naming remains
- image layouts do not break the page

---

## 37. Notes on AI-Assisted Development

This README is now intended to help both humans and AI tools produce consistent work.

### AI implementation rules

When generating code with AI tools:

- follow the collection contracts exactly
- do not reintroduce `blog` naming
- do not add backend assumptions
- do not add libraries unless necessary
- keep route and content responsibilities separated
- preserve English-only public copy

### AI content rules

When generating sample entries:

- always include full frontmatter
- always include a cover image reference
- use realistic but minimal placeholder content
- keep sample content aligned with the collection purpose

---

## 38. Entry Templates

The following templates are the default starting point for new entries.

### Writing entry template

```mdx
---
title: "Your Writing Title"
description: "A one-sentence description of the entry."
pubDate: 2026-03-11
updatedDate: 2026-03-11
category: "note"
tags: ["tag-one", "tag-two"]
cover: ../../assets/content/writing/your-cover.jpg
coverAlt: "Describe the cover image clearly"
featured: false
draft: false
---

import Figure from "../../components/content/Figure.astro";
import YouTubeEmbed from "../../components/content/YouTubeEmbed.astro";
import sampleImage from "../../assets/content/writing/your-inline-image.jpg";

Start with a strong opening paragraph.

<Figure
  src={sampleImage}
  alt="Describe the inline image"
  caption="Optional caption for the image."
/>

Add supporting sections as needed.

<YouTubeEmbed id="VIDEO_ID" title="Descriptive video title" />
```

### Projects entry template

```mdx
---
title: "Project Name"
summary: "One-sentence case study summary."
pubDate: 2026-03-11
year: 2026
status: "in-progress"
category: "web"
stack: ["Astro", "React", "Tailwind", "TypeScript"]
cover: ../../assets/content/projects/project-cover.jpg
coverAlt: "Describe the project cover image clearly"
featured: false
repoUrl: "https://github.com/your-name/project-name"
liveUrl: "https://project.example.com"
---

import Figure from "../../components/content/Figure.astro";
import YouTubeEmbed from "../../components/content/YouTubeEmbed.astro";
import screenshotOne from "../../assets/content/projects/project-screen-01.jpg";

## Overview

Describe what the project is.

## Goal

Explain why it exists.

## Process

Describe key implementation decisions.

<Figure
  src={screenshotOne}
  alt="Project screenshot"
  caption="A key screen from the project."
/>

## Challenges

Explain tradeoffs or problems.

<YouTubeEmbed id="VIDEO_ID" title="Project walkthrough video" />

## Outcome

Summarize results and lessons learned.
```

### Reviews entry template

```mdx
---
title: "Review Title"
description: "A short verdict-driven description."
pubDate: 2026-03-11
type: "game"
platform: "PC"
releaseYear: 2026
status: "finished"
score: 8.4
tags: ["action", "indie"]
cover: ../../assets/content/reviews/review-cover.jpg
coverAlt: "Describe the review cover image clearly"
featured: false
---

import Figure from "../../components/content/Figure.astro";
import YouTubeEmbed from "../../components/content/YouTubeEmbed.astro";
import stillOne from "../../assets/content/reviews/review-still-01.jpg";

## Quick Verdict

Give the short version first.

## What Works

Explain strengths clearly.

<Figure
  src={stillOne}
  alt="A representative still from the subject"
  caption="Optional contextual caption."
/>

## What Doesn't

Explain weaknesses without filler.

## Final Thoughts

End with a clear recommendation or conclusion.

<YouTubeEmbed id="VIDEO_ID" title="Relevant trailer or video" />
```

### Entry authoring rules

- keep frontmatter complete and valid
- use meaningful `coverAlt` text
- avoid placeholder slugs in committed content
- replace `VIDEO_ID` before publishing
- keep sample imports aligned with the correct collection asset folder
- do not publish draft or placeholder entries by accident
