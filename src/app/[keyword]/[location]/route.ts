import { getKeywords, getLocations, generateSlug } from '@/utils/csvParser';

export async function generateStaticParams() {
  try {
    const keywords = await getKeywords();
    const locations = await getLocations();

    if (!keywords || !Array.isArray(keywords) || !locations || !Array.isArray(locations)) {
      console.warn('No keywords or locations found or invalid data format');
      return [];
    }

    const paths = [];
    for (const keyword of keywords) {
      if (!keyword?.keyword) continue;
      for (const location of locations) {
        if (!location?.city || !location?.state) continue;
        paths.push({
          keyword: generateSlug(keyword.keyword),
          location: generateSlug(`${location.city}-${location.state}`)
        });
      }
    }
    return paths;
  } catch (error) {
    console.error('Error generating location params:', error);
    return [];
  }
}
