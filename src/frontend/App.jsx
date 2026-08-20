import { useEffect, useState } from 'react';
import { api } from './models/api';

// Page Imports
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import RegistrationForm from './pages/RegistrationForm.jsx';
import StudentStatus from './pages/StudentStatus.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import StudentsList from './pages/StudentsList.jsx';
import StudentDetails from './pages/StudentDetails.jsx';

// Global Component Imports
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import { RefreshCw } from 'lucide-react';
import { useLanguage } from './controllers/LanguageContext.jsx';

export default function App() {
  const { lang, t } = useLanguage();
  const [user, setUser] = useState(null);
  const [currentRoute, setCurrentRoute] = useState('/');
  const [bootstrapping, setBootstrapping] = useState(true);

  // Authenticate session on bootup
  useEffect(() => {
    async function bootstrapSession() {
      const token = localStorage.getItem('uniport_token');
      if (token) {
        try {
          const userData = await api.auth.me();
          setUser(userData);
          // Auto-route based on account role if they were on auth pages
          if (['/', '/login', '/register'].includes(currentRoute)) {
            setCurrentRoute(userData.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
          }
        } catch (err) {
          console.error("Expired or corrupted token rejected.");
          localStorage.removeItem('uniport_token');
        }
      }
      setBootstrapping(false);
    }
    bootstrapSession();
  }, []);

  const handleLoginSuccess = (token, userData) => {
    localStorage.setItem('uniport_token', token);
    setUser(userData);
    setCurrentRoute(userData.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
  };

  const handleRegisterSuccess = (token, userData) => {
    localStorage.setItem('uniport_token', token);
    setUser(userData);
    setCurrentRoute('/student/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('uniport_token');
    setUser(null);
    setCurrentRoute('/');
  };

  const handleNavigate = (route) => {
    // Basic guards
    if (!user && route.startsWith('/student')) {
      setCurrentRoute('/login');
      return;
    }
    if (!user && route.startsWith('/admin')) {
      setCurrentRoute('/login');
      return;
    }
    if (user && user.role === 'student' && route.startsWith('/admin')) {
      setCurrentRoute('/student/dashboard');
      return;
    }
    if (user && user.role === 'admin' && route.startsWith('/student')) {
      setCurrentRoute('/admin/dashboard');
      return;
    }

    setCurrentRoute(route);
  };

  if (bootstrapping) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center text-slate-900 dark:text-zinc-100 gap-3 font-semibold">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-[11px] uppercase tracking-wider text-blue-600 font-bold">
          Verifying secure ASU session keys...
        </span>
      </div>
    );
  }

  // Router Conditional Rendering
  const renderPageContent = () => {
    // Parse dynamic administrative routes
    if (currentRoute.startsWith('/admin/students/')) {
      const parts = currentRoute.split('/');
      const studentId = parts[3]; // Matches 'id' in: "" / "admin" / "students" / ":id"
      return (
        <StudentDetails
          id={studentId}
          onBack={() => handleNavigate('/admin/students')}
          apiService={api}
        />
      );
    }

    switch (currentRoute) {
      case '/':
        return (
          <Home
            onNavigate={handleNavigate}
            isLoggedIn={!!user}
            userRole={user?.role}
          />
        );
      case '/login':
        return (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onNavigate={handleNavigate}
            apiService={api}
          />
        );
      case '/register':
        return (
          <Register
            onRegisterSuccess={handleRegisterSuccess}
            onNavigate={handleNavigate}
            apiService={api}
          />
        );

      // Student views
      case '/student/dashboard':
        return (
          <StudentDashboard
            user={user}
            onNavigate={handleNavigate}
            apiService={api}
          />
        );
      case '/student/register-form':
        return (
          <RegistrationForm
            apiService={api}
            onNavigate={handleNavigate}
          />
        );
      case '/student/status':
        return (
          <StudentStatus
            apiService={api}
            onNavigate={handleNavigate}
          />
        );

      // Administrative views
      case '/admin/dashboard':
        return (
          <AdminDashboard
            onNavigate={handleNavigate}
            apiService={api}
          />
        );
      case '/admin/students':
        return (
          <StudentsList
            onNavigate={handleNavigate}
            apiService={api}
          />
        );

      default:
        return (
          <Home
            onNavigate={handleNavigate}
            isLoggedIn={!!user}
            userRole={user?.role}
          />
        );
    }
  };

  // Determine if sidebar should be rendered on student/admin pages
  const showSidebar = user && (currentRoute.startsWith('/student') || currentRoute.startsWith('/admin'));
  const isAuthPage = currentRoute === '/login' || currentRoute === '/register';

  return (
    <div
      dir={lang === 'fa' || lang === 'ps' ? 'rtl' : 'ltr'}
      className={`${isAuthPage ? 'h-screen h-[100dvh] max-h-screen overflow-hidden' : 'min-h-screen'} bg-transparent flex flex-col text-slate-950 dark:text-zinc-150 antialiased font-sans transition-colors duration-200 ${
        lang === 'fa' || lang === 'ps' ? 'font-sans' : ''
      }`}
    >
      {!isAuthPage && (
        <Navbar
          user={user}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          currentRoute={currentRoute}
        />
      )}

      {showSidebar ? (
        <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col min-h-0 px-3.5 sm:px-6 py-3 sm:py-4">
          <Sidebar
            user={user}
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
          />
          <main className="flex-1 w-full min-h-0">
            {renderPageContent()}
          </main>
        </div>
      ) : (
        <main className={`flex-1 w-full flex flex-col min-h-0 ${isAuthPage ? 'h-full max-h-screen overflow-hidden justify-start items-center' : ''}`}>
          {renderPageContent()}
        </main>
      )}
    </div>
  );
}
