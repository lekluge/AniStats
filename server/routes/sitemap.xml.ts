export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const siteUrl = String(config.public.siteUrl || "http://localhost:3000").replace(/\/+$/, "");
  const now = new Date().toISOString();

  const urls = ["/"];

  const entries = urls
    .map((path) => {
      return [
        "<url>",
        `<loc>${siteUrl}${path}</loc>`,
        `<lastmod>${now}</lastmod>`,
        "<changefreq>weekly</changefreq>",
        "<priority>1.0</priority>",
        "</url>",
      ].join("");
    })
    .join("");

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    entries +
    "</urlset>";

  setHeader(event, "Content-Type", "application/xml; charset=utf-8");
  return xml;
});
