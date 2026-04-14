// Purpose: Provide site-wide configuration and navigation data.
// Scope: Shared settings used by layouts and pages.
// Audience: Site UI and metadata layers.
const locale = "en-US";

export const siteConfig = {
  name: "Riive",
  title: "Riive",
  description:
    "Developer portfolio, project case studies, reviews, and writing.",
  locale,
  lang: locale.split("-")[0],
  nav: [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Projects" },
    { href: "/reviews", label: "Reviews" },
    { href: "/writing", label: "Writing" },
    { href: "/about", label: "About" },
  ],
  social: {
    github: "https://github.com/OmerZeyveli",
  },
} as const;
