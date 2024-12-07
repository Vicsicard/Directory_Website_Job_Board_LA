export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex justify-between items-center">
          <a href="/" className="text-xl font-bold text-gray-900">
            Local Directory
          </a>
          <div className="flex space-x-4">
            <a href="/search" className="text-gray-600 hover:text-gray-900">
              Search
            </a>
            <a href="/categories" className="text-gray-600 hover:text-gray-900">
              Categories
            </a>
            <a href="/locations" className="text-gray-600 hover:text-gray-900">
              Locations
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
