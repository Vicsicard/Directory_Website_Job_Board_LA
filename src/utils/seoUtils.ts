import { Metadata } from 'next';
import { Location } from './csvParser';

export interface SeoMetadata {
  title: string;
  description: string;
  canonical: string;
  openGraph: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    locale: string;
    type: string;
  };
}

export function generateSeoMetadata(
  keyword: string,
  location: Location,
  places: any[] = []
): Metadata {
  const title = `${keyword} in ${location.city}, ${location.state} | Local Services Directory`;
  const description = `Find the best ${keyword} services in ${location.city}, ${location.state}. Browse reviews, ratings, and contact information for local ${keyword} providers.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export function generateStructuredData(keyword: string, location: Location, places: any[] = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${keyword} in ${location.city}, ${location.state}`,
    description: `List of ${keyword} services in ${location.city}, ${location.state}`,
    numberOfItems: places.length,
    itemListElement: places.map((place, index) => ({
      '@type': 'LocalBusiness',
      '@id': `#business-${index}`,
      name: place.name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: location.city,
        addressRegion: location.state,
        addressCountry: 'US'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: place.latitude || location.latitude,
        longitude: place.longitude || location.longitude
      }
    }))
  };
}
