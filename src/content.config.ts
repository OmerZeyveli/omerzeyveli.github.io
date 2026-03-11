import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const writing = defineCollection({
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
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      pubDate: z.coerce.date(),
      year: z.number().int(),
      status: z.enum(["planned", "in-progress", "completed"]),
      category: z.enum(["web", "game", "tool", "experimental", "other"]),
      stack: z.array(z.string()).default([]),
      cover: image(),
      coverAlt: z.string(),
      featured: z.boolean().default(false),
      repoUrl: z.url().optional(),
      liveUrl: z.url().optional(),
    }),
});

const reviews = defineCollection({
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
