/**
 * Global site configuration – single source of truth for
 * brand copy, metadata, and external links used across the app.
 */

export const siteConfig = {
  name: "ISCREAM",
  shortName: "ISC",
  description:
    "Discover secret recipes, order IScream's famous books, or share your own frozen creations with our sweet community.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/og-image.png",
  links: {
    twitter: "#",
    instagram: "#",
  },
  founder: "Mr. A",
  foundedYear: 2010,
} as const;
