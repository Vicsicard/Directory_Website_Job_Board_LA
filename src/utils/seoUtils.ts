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
  city: string,
  state: string,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
): SeoMetadata {
  const location = state ? `${city}, ${state}` : city;
  const title = `The 10 Best ${keyword} in ${location} (Updated ${new Date().getFullYear()})`;
  const description = `Find the top-rated ${keyword} in ${location}. Compare customer reviews, services offered, and contact information. Updated list of the best local ${keyword.toLowerCase()} providers.`;
  const path = `/${encodeURIComponent(keyword.toLowerCase())}/${encodeURIComponent(location.toLowerCase())}`;
  const url = `${baseUrl}${path}`;

  return {
    title,
    description,
    canonical: url,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Local Service Directory',
      locale: 'en_US',
      type: 'website',
    },
  };
}

export function generateStructuredData(
  keyword: string,
  city: string,
  state: string,
  businesses: Array<{
    name: string;
    rating?: number;
    reviewCount?: number;
    address?: string;
    phone?: string;
  }>
) {
  const location = state ? `${city}, ${state}` : city;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': businesses.map((business, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'LocalBusiness',
        'name': business.name,
        'address': business.address,
        'telephone': business.phone,
        ...(business.rating && {
          'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': business.rating,
            'reviewCount': business.reviewCount || 0
          }
        })
      }
    })),
    'name': `Top 10 ${keyword} in ${location}`
  };
}
