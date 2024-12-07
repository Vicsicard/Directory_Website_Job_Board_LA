import { Metadata } from 'next';
import { generateStaticPaths, getKeywords, getLocations, generateSlug } from '@/utils/csvParser';
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
      title: 'Page Not Found',
      description: 'The requested page could not be found.'
    };
  }

  const seoData = generateSeoMetadata(keyword.keyword, location.city, location.state);

  return {
    title: seoData.title,
    description: seoData.description,
    openGraph: seoData.openGraph,
    twitter: {
      card: 'summary_large_image',
      title: seoData.title,
      description: seoData.description,
    },
    alternates: {
      canonical: seoData.canonical,
    },
  };
}

export async function generateStaticParams() {
  const paths = await generateStaticPaths();
  return paths.map(path => path.params);
}

export default async function Page({ params, searchParams }: PageProps) {
  const keywords = await getKeywords();
  const locations = await getLocations();
  
  const keyword = keywords.find(k => generateSlug(k.keyword) === params.keyword);
  const location = locations.find(l => generateSlug(`${l.city}-${l.state}`) === params.location);
  
  if (!keyword || !location) {
    notFound();
  }

  const page = parseInt(searchParams.page || '1', 10);
  const ITEMS_PER_PAGE = 10;

  try {
    const data = await getPlaces(keyword.keyword, `${location.city}, ${location.state}`, {
      page,
      limit: ITEMS_PER_PAGE,
    });

    if (!data || !data.items || data.items.length === 0) {
      notFound();
    }

    const seoData = generateSeoMetadata(keyword.keyword, location.city, location.state);
    const structuredData = generateStructuredData(
      keyword.keyword,
      location.city,
      location.state,
      data.items.map(item => ({
        name: item.name,
        rating: item.rating,
        reviewCount: item.user_ratings_total,
        address: item.formatted_address,
        phone: item.formatted_phone_number,
      }))
    );

    const breadcrumbs = [
      { name: 'Home', href: '/' },
      { name: keyword.keyword, href: `/${params.keyword}` },
      { name: `${location.city}, ${location.state}`, href: `/${params.keyword}/${params.location}` },
    ];

    return (
      <>
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={breadcrumbs} />
          
          <h1 className="text-4xl font-bold mb-8">
            {seoData.title}
          </h1>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <p className="text-lg text-gray-700 mb-4">
              {seoData.description}
            </p>
          </div>

          <Suspense fallback={<div>Loading places...</div>}>
            <PlacesList places={data.items} />
          </Suspense>

          {data.total_pages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={data.total_pages}
              baseUrl={`/${params.keyword}/${params.location}`}
            />
          )}
        </div>
      </>
    );
  } catch (error) {
    console.error('Error fetching places:', error);
    notFound();
  }
}
