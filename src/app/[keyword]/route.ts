import { getKeywords, generateSlug } from '@/utils/csvParser';

export async function generateStaticParams() {
  try {
    const keywords = await getKeywords();
    if (!keywords || !Array.isArray(keywords)) {
      console.warn('No keywords found or invalid data format');
      return [];
    }
    return keywords.map((keyword) => ({
      keyword: generateSlug(keyword.keyword || ''),
    }));
  } catch (error) {
    console.error('Error generating keyword params:', error);
    return [];
  }
}
