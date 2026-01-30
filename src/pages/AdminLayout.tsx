import { ReactNode } from 'react';
import { Users } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">EMR Admin</span>
            </div>
            <a
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Patient Portal
            </a>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
