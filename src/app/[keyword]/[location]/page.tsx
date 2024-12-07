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

  const title = `${keyword.keyword} in ${location.city}, ${location.state}`;
  const description = `Find and compare the best ${keyword.keyword} services in ${location.city}, ${location.state}. Read reviews, check ratings, and contact local providers.`;

  return {
    title: `${title} | Local Services Directory`,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export async function generateStaticParams() {
  const keywords = await getKeywords();
  const locations = await getLocations();
  
  const params = [];
  
  for (const keyword of keywords) {
    for (const location of locations) {
      params.push({
        keyword: generateSlug(keyword.keyword),
        location: generateSlug(`${location.city}-${location.state}`)
      });
    }
  }
  
  return params;
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
  const limit = 10;
  
  try {
    const places = await getPlaces(keyword.keyword, location.city, location.state, page, limit);
    
    if (!places || !places.items || places.items.length === 0) {
      notFound();
    }

    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: keyword.keyword, url: `/${params.keyword}` },
      { name: `${location.city}, ${location.state}`, url: `/${params.keyword}/${params.location}` }
    ];

    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbs} />
        
        <h1 className="text-4xl font-bold mb-8">
          {keyword.keyword} in {location.city}, {location.state}
        </h1>
        
        <Suspense fallback={<div>Loading places...</div>}>
          <PlacesList places={places.items} />
        </Suspense>
        
        {places.total_pages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={places.total_pages}
            baseUrl={`/${params.keyword}/${params.location}`}
          />
        )}
        
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              generateStructuredData(keyword.keyword, location.city, location.state, places.items)
            )
          }}
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching places:', error);
    notFound();
  }
}
