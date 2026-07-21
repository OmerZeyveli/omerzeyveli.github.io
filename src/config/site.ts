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
    { href: "/writing", label: "Writing" },
    { href: "/reviews", label: "Reviews" },
    { href: "/about", label: "About" },
  ],
  social: {
    github: "https://github.com/OmerZeyveli",
  },
} as const;
