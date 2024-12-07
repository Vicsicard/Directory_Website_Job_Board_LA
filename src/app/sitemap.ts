import { MetadataRoute } from 'next';
import { getAllKeywords } from '@/utils/csvParser';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://local-services-directory.vercel.app';
  const keywords = await getAllKeywords();

  // Base routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Add dynamic routes for each keyword
  const keywordRoutes = keywords.map((keyword) => ({
    url: `${baseUrl}/${encodeURIComponent(keyword)}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  return [...routes, ...keywordRoutes];
}
