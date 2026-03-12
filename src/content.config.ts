import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const writing = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/writing" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      category: z.enum(["essay", "devlog", "note", "breakdown"]),
      tags: z.array(z.string()).default([]),
      cover: image(),
      coverAlt: z.string(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      pubDate: z.coerce.date(),
      year: z.number().int(),
      status: z.enum(["planned", "in-progress", "completed"]),
      category: z.enum(["web", "game", "tool", "experimental", "other"]),
      stack: z.array(z.string()),
      cover: image(),
      coverAlt: z.string(),
      featured: z.boolean().default(false),
      repoUrl: z.string().url().optional(),
      liveUrl: z.string().url().optional(),
    }),
});

const reviews = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/reviews" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      type: z.enum(["game", "movie", "series", "book", "tech"]),
      platform: z.string().optional(),
      releaseYear: z.number().int().optional(),
      status: z.enum(["finished", "ongoing", "revisited"]).optional(),
      score: z.number().min(0).max(10).optional(),
      tags: z.array(z.string()).default([]),
      cover: image(),
      coverAlt: z.string(),
      featured: z.boolean().default(false),
    }),
});

export const collections = {
  writing,
  projects,
  reviews,
};
