export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const siteUrl = String(config.public.siteUrl || "http://localhost:3000").replace(/\/+$/, "");

  const lines = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /dashboard",
    "Disallow: /genres",
    "Disallow: /tags",
    "Disallow: /combine",
    "Disallow: /relations",
    "Disallow: /compare",
    "Disallow: /recommendation",
    "Disallow: /history",
    "Disallow: /api/",
    `Sitemap: ${siteUrl}/sitemap.xml`,
  ];

  setHeader(event, "Content-Type", "text/plain; charset=utf-8");
  return lines.join("\n");
});
