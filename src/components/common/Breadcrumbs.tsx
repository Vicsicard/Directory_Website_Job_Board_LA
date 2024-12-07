import Link from 'next/link';

interface Crumb {
  name: string;
  url: string | null;
}

interface BreadcrumbsProps {
  items: Crumb[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="text-sm mb-6" aria-label="Breadcrumb">
      <ol className="list-none p-0 inline-flex">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={item.name} className="flex items-center">
              {index > 0 && <span className="mx-2 text-gray-500">/</span>}
              {isLast || !item.url ? (
                <span className="text-gray-600" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link 
                  href={item.url}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
