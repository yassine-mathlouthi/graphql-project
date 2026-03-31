import { Outlet, Link } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gray-900 text-white p-2 rounded group-hover:bg-gray-800 transition-colors">
              <Gamepad2 size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">
              Atlas
            </span>
          </Link>
          <nav className="flex gap-4">
            <Link 
              to="/add-game" 
              className="px-4 py-2 bg-gray-900 text-sm font-medium text-white rounded hover:bg-gray-800 transition-colors"
            >
              Add Project
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-white py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500 font-medium">
          &copy; {new Date().getFullYear()} Atlas Games Database. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
