// Purpose: Provide content collection queries and sorting helpers.
// Scope: Shared data access for projects, reviews, and writing.
// Audience: Pages and components fetching content.
import { getCollection, type CollectionEntry } from "astro:content";

type DatedEntry = CollectionEntry<"projects" | "reviews" | "writing">;

function sortByPubDateDesc<T extends DatedEntry>(entries: T[]) {
  return entries.sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
}

// Keep only the latest N items without sorting the entire array.
function selectLatestByPubDate<T extends DatedEntry>(
  entries: T[],
  count: number,
) {
  if (count <= 0) {
    return [];
  }

  const latest: T[] = [];

  for (const entry of entries) {
    const entryTime = entry.data.pubDate.getTime();
    const insertAt = latest.findIndex(
      (candidate) => entryTime > candidate.data.pubDate.getTime(),
    );

    if (insertAt === -1) {
      if (latest.length < count) {
        latest.push(entry);
      }
      continue;
    }

    latest.splice(insertAt, 0, entry);

    if (latest.length > count) {
      latest.pop();
    }
  }

  return latest;
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
    return selectLatestByPubDate(projects, count);
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
    return selectLatestByPubDate(reviews, count);
  }

  return sortByPubDateDesc(reviews);
}

export async function getFeaturedWriting(count?: number) {
  const posts = await getCollection(
    "writing",
    ({ data }) => !data.draft && data.featured === true && !data.archived,
  );

  if (typeof count === "number") {
    return selectLatestByPubDate(posts, count);
  }

  return sortByPubDateDesc(posts);
}

export async function getLatestWriting(count = 3) {
  const posts = await getCollection(
    "writing",
    ({ data }) => !data.draft && !data.archived,
  );
  return selectLatestByPubDate(posts, count);
}

export async function getLatestReviews(count = 3) {
  const reviews = await getCollection("reviews", ({ data }) => !data.archived);
  return selectLatestByPubDate(reviews, count);
}
