import { useEffect, useState } from 'react';
import PortalLogin from './pages/PortalLogin';
import PortalDashboard from './pages/PortalDashboard';
import PortalAppointments from './pages/PortalAppointments';
import PortalPrescriptions from './pages/PortalPrescriptions';
import AdminPatientList from './pages/AdminPatientList';
import AdminPatientNew from './pages/AdminPatientNew';
import AdminPatientDetail from './pages/AdminPatientDetail';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      setCurrentPath(window.location.pathname);
    };

    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      setCurrentPath(window.location.pathname);
    };

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  if (currentPath === '/') {
    return <PortalLogin />;
  }

  if (currentPath === '/portal') {
    return <PortalDashboard />;
  }

  if (currentPath === '/portal/appointments') {
    return <PortalAppointments />;
  }

  if (currentPath === '/portal/prescriptions') {
    return <PortalPrescriptions />;
  }

  if (currentPath === '/admin') {
    return <AdminPatientList />;
  }

  if (currentPath === '/admin/patients/new') {
    return <AdminPatientNew />;
  }

  if (currentPath.startsWith('/admin/patients/')) {
    const patientId = currentPath.split('/')[3];
    return <AdminPatientDetail patientId={patientId} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <a href="/" className="text-blue-600 hover:text-blue-800">
          Go to Portal Login
        </a>
      </div>
    </div>
  );
}

export default App;
