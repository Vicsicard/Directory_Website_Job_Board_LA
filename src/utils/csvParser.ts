import keywordsData from '@/data/keywords.json';
import locationsData from '@/data/locations.json';

export interface Keyword {
  keyword: string;
}

export interface Location {
  city: string;
  state: string;
}

export async function getKeywords(): Promise<Keyword[]> {
  return keywordsData.keywords;
}

export async function getLocations(): Promise<Location[]> {
  return locationsData.locations;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function generateStaticPaths() {
  const keywords = await getKeywords();
  const locations = await getLocations();
  
  const paths = [];
  
  for (const keyword of keywords) {
    for (const location of locations) {
      paths.push({
        params: {
          keyword: generateSlug(keyword.keyword),
          location: generateSlug(`${location.city}-${location.state}`)
        }
      });
    }
  }
  
  return paths;
}

export function formatLocationDisplay(city: string, state: string): string {
  return `${city}, ${state}`;
}

export function generatePageTitle(keyword: string, city: string, state: string): string {
  return `The 10 Best ${keyword} in ${city}, ${state}`;
}

export function generateMetaDescription(keyword: string, city: string, state: string): string {
  return `Discover the top-rated ${keyword} in ${city}, ${state}, including contact details and reviews. Find the best local services near you.`;
}
