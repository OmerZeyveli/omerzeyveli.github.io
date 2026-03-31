// Purpose: Provide site-wide configuration and navigation data.
// Scope: Shared settings used by layouts and pages.
// Audience: Site UI and metadata layers.
export const siteConfig = {
  name: "Riive",
  title: "Riive",
  description:
    "Developer portfolio, project case studies, reviews, and writing.",
  locale: "en-US",
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
