import { getCollection } from "astro:content";

export async function getWritingPosts() {
  const posts = await getCollection("writing");
  return posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export async function getProjects() {
  const projects = await getCollection("projects");
  return projects.sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
}

export async function getFeaturedProjects() {
  const projects = await getProjects();
  return projects.filter((project) => project.data.featured);
}

export async function getReviews() {
  const reviews = await getCollection("reviews");
  return reviews.sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
}

export async function getFeaturedReviews() {
  const reviews = await getReviews();
  return reviews.filter((review) => review.data.featured);
}

export async function getFeaturedWriting() {
  const posts = await getWritingPosts();
  return posts.filter((post) => post.data.featured);
}
