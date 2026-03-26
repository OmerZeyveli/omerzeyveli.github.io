# Workflow Reference

This file preserves expanded project guidance that is useful for humans and agents but does not belong in the strict architecture/agent policy files.

Status:

- Informational and reusable
- Companion to `ARCHITECTURE.md` and `AGENTS.md`
- Not an override of hard constraints

## 0. Legacy Snapshot Archive

If you need the full pre-compression docs exactly as they were in git history, use:

- `docs/README_LEGACY_FULL.md`
- `docs/AGENTS_LEGACY_FULL.md`

These are archival references only. Active policy remains in `ARCHITECTURE.md` and `AGENTS.md`.

## 1. Development Commands

```bash
pnpm dev
pnpm check
pnpm build
pnpm preview
pnpm format
```

Command intent:

- `pnpm dev`: local development server
- `pnpm check`: Astro checks and diagnostics
- `pnpm build`: production build output
- `pnpm preview`: preview built site locally
- `pnpm format`: apply formatter

## 2. Content Authoring Quickstart

### Add a writing entry

1. Create `.mdx` in `src/content/writing/`.
2. Add required frontmatter fields.
3. Add cover image in `src/assets/content/writing/<slug>/`.
4. Write content.
5. Optionally embed `Figure` and `YouTubeEmbed`.

### Add a project entry

1. Create `.mdx` in `src/content/projects/`.
2. Add metadata (status, category, stack, links).
3. Add cover image in `src/assets/content/projects/<slug>/`.
4. Write as a case study.

### Add a review entry

1. Create `.mdx` in `src/content/reviews/`.
2. Add metadata (type, optional score, platform, tags).
3. Add cover image in `src/assets/content/reviews/<slug>/`.
4. Write a verdict-driven review.

## 3. Authoring Quality Checklist

For each new entry:

- Required frontmatter exists
- Cover image exists and renders
- `coverAlt` is meaningful
- Slug is lowercase and hyphen-separated
- Public copy is English
- No placeholder values are left (`VIDEO_ID`, fake URLs, etc.)

## 4. Content Templates

### Writing Template

```mdx
---
title: "Your Writing Title"
description: "A one-sentence description of the entry."
pubDate: 2026-03-11
updatedDate: 2026-03-11
category: "note"
tags: ["tag-one", "tag-two"]
cover: ../../assets/content/writing/your-writing-title/cover.jpg
coverAlt: "Describe the cover image clearly"
featured: false
draft: false
archived: false
---

import Figure from "../../components/content/Figure.astro";
import YouTubeEmbed from "../../components/content/YouTubeEmbed.astro";
import sampleImage from "../../assets/content/writing/your-writing-title/inline-01.jpg";

Start with a strong opening paragraph.

<Figure
  src={sampleImage}
  alt="Describe the inline image"
  caption="Optional caption for the image."
/>

Add supporting sections as needed.

<YouTubeEmbed id="VIDEO_ID" title="Descriptive video title" />
```

### Project Template

```mdx
---
title: "Project Name"
summary: "One-sentence case study summary."
pubDate: 2026-03-11
year: 2026
status: "in-progress"
category: "web"
stack: ["Astro", "React", "Tailwind", "TypeScript"]
cover: ../../assets/content/projects/project-name/cover.jpg
coverAlt: "Describe the project cover image clearly"
featured: false
repoUrl: "https://github.com/your-name/project-name"
liveUrl: "https://project.example.com"
archived: false
---

import Figure from "../../components/content/Figure.astro";
import YouTubeEmbed from "../../components/content/YouTubeEmbed.astro";
import screenshotOne from "../../assets/content/projects/project-name/screen-01.jpg";

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

### Review Template

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
cover: ../../assets/content/reviews/review-title/cover.jpg
coverAlt: "Describe the review cover image clearly"
featured: false
archived: false
---

import Figure from "../../components/content/Figure.astro";
import YouTubeEmbed from "../../components/content/YouTubeEmbed.astro";
import stillOne from "../../assets/content/reviews/review-title/still-01.jpg";

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

## 5. VS Code Tooling Reference

Recommended extensions:

- Astro
- Prettier
- ESLint
- Tailwind CSS IntelliSense
- GitHub Copilot
- GitHub Copilot Chat

## 6. AI Workflow Notes

When delegating to agents:

1. Define one concern per task.
2. Provide exact file paths.
3. State constraints from `AGENTS.md`.
4. Require validation output (`pnpm format`, `pnpm check`, `pnpm build`).
5. Ask for a concise change report.

## 7. Backlog Ideas (Optional)

Potential later additions:

- tag/category filtering
- reading time for writing
- project timeline blocks
- image gallery component
- code snippet presentation improvements
- Open Graph image generation
- RSS
- uses page
- now page

Treat these as optional and only implement when aligned with architecture constraints.
