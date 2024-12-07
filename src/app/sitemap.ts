import { MetadataRoute } from 'next';
import { getKeywords, getLocations, generateSlug } from '@/utils/csvParser';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use Vercel's deployment URL or localhost for development
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';
  
  // Get data
  const keywords = await getKeywords();
  const locations = await getLocations();

  // Base routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cities`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // Add keyword pages
  const keywordRoutes = keywords.map((keyword) => ({
    url: `${baseUrl}/${generateSlug(keyword.keyword)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Add location pages
  const locationRoutes = locations.map((location) => ({
    url: `${baseUrl}/cities/${generateSlug(`${location.city}-${location.state}`)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [...routes, ...keywordRoutes, ...locationRoutes];
}
