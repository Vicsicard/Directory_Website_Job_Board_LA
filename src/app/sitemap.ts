import { MetadataRoute } from 'next';
import { getKeywords, getLocations, generateSlug } from '@/utils/csvParser';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  // Get all keywords and locations
  const keywords = await getKeywords();
  const locations = await getLocations();

  // Generate sitemap entries
  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // Add keyword pages
  for (const keyword of keywords) {
    const slug = generateSlug(keyword.keyword);
    entries.push({
      url: `${baseUrl}/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });

    // Add location pages for each keyword
    for (const location of locations) {
      const locationSlug = generateSlug(`${location.location}-${location.state}`);
      entries.push({
        url: `${baseUrl}/${slug}/${locationSlug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  return entries;
}
