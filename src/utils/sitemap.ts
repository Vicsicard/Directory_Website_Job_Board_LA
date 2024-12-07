import { getKeywords, getLocations } from './csvParser';
import { formatCanonicalUrl } from './seo';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

export async function generateSitemapUrls(baseUrl: string): Promise<SitemapUrl[]> {
  const keywords = await getKeywords();
  const locations = await getLocations();
  const urls: SitemapUrl[] = [];
  
  // Add home page
  urls.push({
    loc: baseUrl,
    lastmod: new Date().toISOString(),
    changefreq: 'daily',
    priority: '1.0'
  });

  // Add keyword-location combination pages
  for (const keyword of keywords) {
    for (const location of locations) {
      const path = formatCanonicalUrl(
        keyword.keyword,
        location.city,
        location.state
      );
      
      urls.push({
        loc: `${baseUrl}${path}`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: '0.8'
      });
    }
  }

  return urls;
}

export function generateSitemapXml(urls: SitemapUrl[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

export function generateRobotsTxt(baseUrl: string): string {
  return `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;
}
