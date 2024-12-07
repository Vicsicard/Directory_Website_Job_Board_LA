'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function Pagination({ currentPage, totalItems, itemsPerPage }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) {
    return null;
  }

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <nav className="flex justify-center mt-8" aria-label="Pagination">
      <ul className="flex items-center -space-x-px">
        {/* Previous Page */}
        {currentPage > 1 && (
          <li>
            <Link
              href={createPageUrl(currentPage - 1)}
              className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700"
            >
              Previous
            </Link>
          </li>
        )}

        {/* Page Numbers */}
        {[...Array(totalPages)].map((_, index) => {
          const pageNumber = index + 1;
          const isCurrentPage = pageNumber === currentPage;

          return (
            <li key={pageNumber}>
              <Link
                href={createPageUrl(pageNumber)}
                className={`px-3 py-2 leading-tight border ${
                  isCurrentPage
                    ? 'text-blue-600 bg-blue-50 border-blue-300 hover:bg-blue-100 hover:text-blue-700'
                    : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                {pageNumber}
              </Link>
            </li>
          );
        })}

        {/* Next Page */}
        {currentPage < totalPages && (
          <li>
            <Link
              href={createPageUrl(currentPage + 1)}
              className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700"
            >
              Next
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
