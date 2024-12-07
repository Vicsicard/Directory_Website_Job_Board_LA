import { Metadata } from 'next';
import { getKeywords, getLocations, generateSlug } from '@/utils/csvParser';
import { Suspense } from 'react';
import { getPlaces } from '@/utils/placesApi';
import PlacesList from '@/components/places/PlacesList';
import Pagination from '@/components/common/Pagination';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { notFound } from 'next/navigation';
import { generateSeoMetadata, generateStructuredData } from '@/utils/seoUtils';
import Script from 'next/script';

interface PageProps {
  params: {
    keyword: string;
    location: string;
  };
  searchParams: {
    page?: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const keywords = await getKeywords();
  const locations = await getLocations();
  
  const keyword = keywords.find(k => generateSlug(k.keyword) === params.keyword);
  const location = locations.find(l => generateSlug(`${l.location}-${l.state}`) === params.location);
  
  if (!keyword || !location) {
    return {
      title: 'Service Not Found | Local Services Directory',
      description: 'The requested service or location could not be found.'
    };
  }

  return generateSeoMetadata(keyword.keyword, location);
}

export async function generateStaticParams() {
  try {
    const keywords = await getKeywords();
    const locations = await getLocations();
    
    if (!keywords?.length || !locations?.length) return [];

    return keywords.flatMap(keyword => 
      locations.map(location => ({
        keyword: generateSlug(keyword.keyword),
        location: generateSlug(`${location.location}-${location.state}`)
      }))
    );
  } catch (error) {
    console.error('Error generating location params:', error);
    return [];
  }
}

export default async function Page({ params, searchParams }: PageProps) {
  const keywords = await getKeywords();
  const locations = await getLocations();
  
  const keyword = keywords.find(k => generateSlug(k.keyword) === params.keyword);
  const location = locations.find(l => generateSlug(`${l.location}-${l.state}`) === params.location);
  
  if (!keyword || !location) {
    notFound();
  }
  
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const places = await getPlaces(keyword.keyword, location);
  
  // Generate structured data for SEO
  const structuredData = generateStructuredData(keyword.keyword, location, places);
  
  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs keyword={keyword.keyword} location={location} />
          
          <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4">
            {keyword.keyword} Services in {location.location}, {location.state}
          </h1>
          
          <Suspense fallback={<div>Loading places...</div>}>
            <PlacesList places={places} />
          </Suspense>
          
          <div className="mt-8">
            <Pagination
              currentPage={page}
              totalItems={places.length}
              itemsPerPage={10}
            />
          </div>
        </div>
      </div>
    </>
  );
}
