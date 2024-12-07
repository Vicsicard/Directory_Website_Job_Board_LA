export default function Footer() {
  return (
    <footer className="bg-gray-50 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Local Directory. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
