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
  const location = locations.find(l => generateSlug(`${l.city}-${l.state}`) === params.location);
  
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
        location: generateSlug(`${location.city}-${location.state}`)
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
  const location = locations.find(l => generateSlug(`${l.city}-${l.state}`) === params.location);
  
  if (!keyword || !location) {
    notFound();
  }
  
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const itemsPerPage = 10;
  const places = await getPlaces(keyword.keyword, `${location.city}, ${location.state}`);
  
  // Generate structured data for SEO
  const structuredData = generateStructuredData(keyword.keyword, location, places);
  
  const totalPages = Math.ceil(places.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlaces = places.slice(startIndex, endIndex);

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: keyword.keyword, href: `/${params.keyword}` },
            { label: `${location.city}, ${location.state}`, href: '#' }
          ]}
        />

        <h1 className="text-4xl font-bold mb-8">
          {keyword.keyword} Services in {location.city}, {location.state}
        </h1>

        <Suspense fallback={<div>Loading...</div>}>
          <PlacesList places={currentPlaces} />
        </Suspense>

        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl={`/${params.keyword}/${params.location}`}
          />
        )}
      </div>
    </>
  );
}
