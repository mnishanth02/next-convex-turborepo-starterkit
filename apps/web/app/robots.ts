import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/*", // Protect API routes
          "/_next/*", // Protect Next.js internals
          "/admin/*", // Protect admin routes (if you add them)
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
