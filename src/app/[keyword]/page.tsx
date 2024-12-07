import { Metadata } from 'next';
import { getKeywords, getLocations, generateSlug } from '@/utils/csvParser';
import { notFound } from 'next/navigation';
import KeywordLocations from '@/components/search/KeywordLocations';

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
      title: 'Service Not Found | Local Services Directory',
      description: 'The requested service could not be found.'
    };
  }

  return {
    title: `${keyword.keyword} Services Near You | Local Services Directory`,
    description: `Find the best ${keyword.keyword} services in your area. Browse reviews, ratings, and contact information for local ${keyword.keyword} providers.`,
  };
}

export async function generateStaticParams() {
  try {
    const keywords = await getKeywords();
    if (!keywords?.length) return [];

    return keywords.map(keyword => ({
      keyword: generateSlug(keyword.keyword)
    }));
  } catch (error) {
    console.error('Error generating keyword params:', error);
    return [];
  }
}

export default async function Page({ params }: PageProps) {
  const keywords = await getKeywords();
  const locations = await getLocations();
  
  const keyword = keywords.find(k => generateSlug(k.keyword) === params.keyword);
  
  if (!keyword) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {keyword.keyword} Services Near You
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">
            Select a Location
          </h2>
          
          <KeywordLocations 
            keyword={keyword.keyword}
            locations={locations}
          />
        </div>
      </div>
    </div>
  );
}
