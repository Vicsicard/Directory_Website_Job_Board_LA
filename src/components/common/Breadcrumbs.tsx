'use client';

import Link from 'next/link';
import { generateSlug } from '@/utils/csvParser';
import { Location } from '@/utils/csvParser';
import ChevronRightIcon from './ChevronRightIcon'; // Assuming the icon is in the same directory

export interface BreadcrumbsProps {
  keyword: string;
  location: Location;
}

export default function Breadcrumbs({ keyword, location }: BreadcrumbsProps) {
  const keywordSlug = generateSlug(keyword);
  const locationSlug = generateSlug(`${location.location}-${location.state}`);

  return (
    <nav className="text-sm font-medium" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-4">
        <li>
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            Home
          </Link>
        </li>
        <li>
          <div className="flex items-center">
            <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden={true} />
            <Link
              href={`/${keywordSlug}`}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              {keyword}
            </Link>
          </div>
        </li>
        <li>
          <div className="flex items-center">
            <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden={true} />
            <Link
              href={`/${keywordSlug}/${locationSlug}`}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              {location.location}, {location.state}
            </Link>
          </div>
        </li>
      </ol>
    </nav>
  );
}
