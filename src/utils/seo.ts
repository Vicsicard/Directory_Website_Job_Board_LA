export function formatPageTitle(keyword: string, city: string, state: string): string {
  const formattedKeyword = keyword.toLowerCase();
  return `The 10 Best ${formattedKeyword} in ${city}, ${state}`;
}

export function formatMetaDescription(keyword: string, city: string, state: string): string {
  const formattedKeyword = keyword.toLowerCase();
  return `Discover the top-rated ${formattedKeyword} in ${city}, ${state}, including contact details, reviews, and ratings. Updated ${new Date().toLocaleDateString()}.`;
}

export function formatH1Title(keyword: string, city: string, state: string): string {
  const formattedKeyword = keyword.toLowerCase();
  return `Best ${formattedKeyword} in ${city}, ${state}`;
}

export function formatBreadcrumbs(keyword: string, city: string, state: string) {
  return [
    { name: 'Home', url: '/' },
    { name: keyword, url: `/${keyword.toLowerCase().replace(/\s+/g, '-')}` },
    { name: `${city}, ${state}`, url: null }
  ];
}

export function formatCanonicalUrl(keyword: string, city: string, state: string): string {
  const formattedKeyword = keyword.toLowerCase().replace(/\s+/g, '-');
  const formattedLocation = `${city}-${state}`.toLowerCase().replace(/\s+/g, '-');
  return `/${formattedKeyword}/${formattedLocation}`;
}
