import { ReactNode, useEffect, useState } from 'react';
import { getCurrentPatient, logoutPatient } from '../lib/auth';
import { Activity, Calendar, Pill, LogOut } from 'lucide-react';

interface PortalLayoutProps {
  children: ReactNode;
  currentPage?: 'dashboard' | 'appointments' | 'prescriptions';
}

export default function PortalLayout({ children, currentPage = 'dashboard' }: PortalLayoutProps) {
  const [patient, setPatient] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const currentPatient = getCurrentPatient();
    if (!currentPatient) {
      window.location.href = '/';
      return;
    }
    setPatient(currentPatient);
  }, []);

  function handleLogout() {
    logoutPatient();
    window.location.href = '/';
  }

  if (!patient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <Activity className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">Patient Portal</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                <div className="text-xs text-gray-500">{patient.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-6">
          <aside className="w-64">
            <nav className="space-y-1">
              <a
                href="/portal"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === 'dashboard'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Activity className="w-5 h-5" />
                <span>Dashboard</span>
              </a>
              <a
                href="/portal/appointments"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === 'appointments'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Appointments</span>
              </a>
              <a
                href="/portal/prescriptions"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === 'prescriptions'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Pill className="w-5 h-5" />
                <span>Prescriptions</span>
              </a>
            </nav>
          </aside>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
