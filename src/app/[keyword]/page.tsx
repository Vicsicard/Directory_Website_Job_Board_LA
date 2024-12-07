import { Metadata } from 'next';
import { getKeywords, getLocations, generateSlug } from '@/utils/csvParser';
import { generateSeoMetadata } from '@/utils/seoUtils';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Breadcrumbs from '@/components/common/Breadcrumbs';

interface PageProps {
  params: {
    keyword: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const keywords = await getKeywords();
  const keyword = keywords.find(k => generateSlug(k.keyword) === params.keyword);
  
  if (!keyword) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.'
    };
  }

  const seoData = generateSeoMetadata(keyword.keyword, 'All Locations', '');

  return {
    title: `Best ${keyword.keyword} by Location - Find Top Rated Services`,
    description: seoData.description,
    openGraph: {
      ...seoData.openGraph,
      title: `Best ${keyword.keyword} by Location - Find Top Rated Services`,
    },
  };
}

export async function generateStaticParams() {
  const keywords = await getKeywords();
  return keywords.map(keyword => ({
    keyword: generateSlug(keyword.keyword),
  }));
}

export default async function Page({ params }: PageProps) {
  const keywords = await getKeywords();
  const locations = await getLocations();
  
  const keyword = keywords.find(k => generateSlug(k.keyword) === params.keyword);
  
  if (!keyword) {
    notFound();
  }

  // Group locations by state
  const locationsByState = locations.reduce((acc, location) => {
    if (!acc[location.state]) {
      acc[location.state] = [];
    }
    acc[location.state].push(location);
    return acc;
  }, {} as Record<string, typeof locations>);

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: keyword.keyword, href: `/${params.keyword}` },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbs} />
      
      <h1 className="text-4xl font-bold mb-8">
        Best {keyword.keyword} by Location
      </h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <p className="text-lg text-gray-700 mb-4">
          Find the top-rated {keyword.keyword.toLowerCase()} in your area. Browse through our comprehensive 
          directory of professional {keyword.keyword.toLowerCase()} services across different locations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.entries(locationsByState).map(([state, stateLocations]) => (
          <div key={state} className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">{state}</h2>
            <ul className="space-y-2">
              {stateLocations.map(location => (
                <li key={location.city}>
                  <Link
                    href={`/${params.keyword}/${generateSlug(`${location.city}-${location.state}`)}`}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {keyword.keyword} in {location.city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">
          Why Choose Our {keyword.keyword} Directory?
        </h2>
        <ul className="space-y-4 text-gray-700">
          <li>✓ Comprehensive listings of verified service providers</li>
          <li>✓ Real customer reviews and ratings</li>
          <li>✓ Detailed business information and contact details</li>
          <li>✓ Easy comparison of services and prices</li>
          <li>✓ Updated regularly with new businesses</li>
        </ul>
      </div>
    </div>
  );
}
