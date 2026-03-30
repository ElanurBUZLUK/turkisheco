import { writeFile } from 'node:fs/promises';

const siteUrl = (process.env.SITEMAP_SITE_URL || 'https://turkisheco.com').replace(/\/$/, '');
const apiUrl = (process.env.SITEMAP_API_URL || 'http://localhost:5080/api').replace(/\/$/, '');
const sitemapPath = new URL('../public/sitemap.xml', import.meta.url);

const staticPaths = [
  '/',
  '/about',
  '/contact',
  '/forum',
  '/privacy',
  '/terms',
  '/cookies',
  '/kvkk',
];

async function getPublishedPostPaths() {
  try {
    const response = await fetch(`${apiUrl}/posts`, {
      headers: {
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }

    const posts = await response.json();
    return posts
      .map((post) => post?.slug)
      .filter((slug) => typeof slug === 'string' && slug.trim().length > 0)
      .map((slug) => `/posts/${slug.trim()}`);
  } catch (error) {
    console.warn(`[sitemap] Published post fetch failed: ${error.message}`);
    return [];
  }
}

function toUrlNode(path) {
  return [
    '  <url>',
    `    <loc>${siteUrl}${path}</loc>`,
    '  </url>',
  ].join('\n');
}

const postPaths = await getPublishedPostPaths();
const allPaths = [...new Set([...staticPaths, ...postPaths])];
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...allPaths.map(toUrlNode),
  '</urlset>',
  '',
].join('\n');

await writeFile(sitemapPath, xml, 'utf8');
console.log(`[sitemap] Wrote ${allPaths.length} URLs to ${sitemapPath.pathname}`);
