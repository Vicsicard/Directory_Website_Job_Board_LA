import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/solid';

interface Crumb {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-4">
        {items.map((item, index) => (
          <li key={item.url} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon
                className="flex-shrink-0 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            )}
            
            <Link
              href={item.url}
              className={`ml-4 text-sm font-medium ${
                index === items.length - 1
                  ? 'text-gray-700 hover:text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-current={index === items.length - 1 ? 'page' : undefined}
            >
              {index === 0 ? (
                <span className="flex items-center">
                  <HomeIcon className="flex-shrink-0 h-5 w-5" />
                  <span className="sr-only">{item.name}</span>
                </span>
              ) : (
                item.name
              )}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
