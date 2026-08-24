import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import WhatsAppButton from './components/common/WhatsAppButton';

// Application Routes
import AppRoutes from './routes/AppRoutes';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <AuthProvider>
      <SettingsProvider>
        <ScrollToTop />
        {!isAdminRoute && <Header />}

        <AppRoutes />

        {!isAdminRoute && <WhatsAppButton />}
        {!isAdminRoute && <Footer />}
      </SettingsProvider>
    </AuthProvider>
  );
}
