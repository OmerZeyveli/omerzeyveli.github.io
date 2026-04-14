// Purpose: Provide content collection queries and sorting helpers.
// Scope: Shared data access for projects, reviews, and writing.
// Audience: Pages and components fetching content.
import { getCollection, type CollectionEntry } from "astro:content";

type DatedEntry = CollectionEntry<"projects" | "reviews" | "writing">;

function sortByPubDateDesc<T extends DatedEntry>(entries: readonly T[]) {
  return [...entries].sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
}

export async function getWritingPosts() {
  const posts = await getCollection(
    "writing",
    ({ data }) => !data.draft && !data.archived,
  );
  return sortByPubDateDesc(posts);
}

export async function getProjects() {
  const projects = await getCollection(
    "projects",
    ({ data }) => !data.archived,
  );
  return sortByPubDateDesc(projects);
}

export async function getFeaturedProjects(count?: number) {
  const projects = await getCollection(
    "projects",
    ({ data }) => data.featured === true && !data.archived,
  );

  if (typeof count === "number") {
    return sortByPubDateDesc(projects).slice(0, count);
  }

  return sortByPubDateDesc(projects);
}

export async function getReviews() {
  const reviews = await getCollection("reviews", ({ data }) => !data.archived);
  return sortByPubDateDesc(reviews);
}

export async function getFeaturedReviews(count?: number) {
  const reviews = await getCollection(
    "reviews",
    ({ data }) => data.featured === true && !data.archived,
  );

  if (typeof count === "number") {
    return sortByPubDateDesc(reviews).slice(0, count);
  }

  return sortByPubDateDesc(reviews);
}

export async function getFeaturedWriting(count?: number) {
  const posts = await getCollection(
    "writing",
    ({ data }) => !data.draft && data.featured === true && !data.archived,
  );

  if (typeof count === "number") {
    return sortByPubDateDesc(posts).slice(0, count);
  }

  return sortByPubDateDesc(posts);
}

export async function getLatestWriting(count = 3) {
  const posts = await getCollection(
    "writing",
    ({ data }) => !data.draft && !data.archived,
  );
  return sortByPubDateDesc(posts).slice(0, count);
}

export async function getLatestReviews(count = 3) {
  const reviews = await getCollection("reviews", ({ data }) => !data.archived);
  return sortByPubDateDesc(reviews).slice(0, count);
}
