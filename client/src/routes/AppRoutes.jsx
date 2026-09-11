import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Public Pages (kept in main bundle for optimal FCP)
import Home from '../pages/public/Home';
import Collections from '../pages/public/Collections';
import CollectionDetail from '../pages/public/CollectionDetail';
import Portfolio from '../pages/public/Portfolio';
import ProjectDetail from '../pages/public/ProjectDetail';
import About from '../pages/public/About';
import Contact from '../pages/public/Contact';
import Consultation from '../pages/public/Consultation';
import NotFound from '../pages/public/NotFound';

// Protected Route Guard
import ProtectedRoute from './ProtectedRoute';

// Lazy-Loaded Admin CMS Pages
const AdminLayout = lazy(() => import('../layouts/AdminLayout'));
const AdminLogin = lazy(() => import('../pages/admin/AdminLogin'));
const DashboardOverview = lazy(() => import('../pages/admin/DashboardOverview'));
const ProductsManager = lazy(() => import('../pages/admin/ProductsManager'));
const CollectionsManager = lazy(() => import('../pages/admin/CollectionsManager'));
const ProjectsManager = lazy(() => import('../pages/admin/ProjectsManager'));
const ConsultationsManager = lazy(() => import('../pages/admin/ConsultationsManager'));
const ContactEnquiriesManager = lazy(() => import('../pages/admin/ContactEnquiriesManager'));
const NewsletterManager = lazy(() => import('../pages/admin/NewsletterManager'));
const FaqsManager = lazy(() => import('../pages/admin/FaqsManager'));
const TestimonialsManager = lazy(() => import('../pages/admin/TestimonialsManager'));
const SettingsManager = lazy(() => import('../pages/admin/SettingsManager'));
const ChangePasswordManager = lazy(() => import('../pages/admin/ChangePasswordManager'));

// Branded Luxury Loading Fallback
function BrandedLoadingFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0d2613',
        color: '#f3f3eb',
        gap: '16px',
        padding: '20px',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <span
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '28px',
            letterSpacing: '0.2em',
            color: '#e6c77a',
            display: 'block',
          }}
        >
          VELOURA
        </span>
        <span
          style={{
            fontSize: '9px',
            letterSpacing: '0.3em',
            color: 'rgba(243, 243, 235, 0.6)',
            textTransform: 'uppercase',
          }}
        >
          LIGHTING CMS
        </span>
      </div>
      <div
        style={{
          width: '40px',
          height: '2px',
          backgroundColor: '#e6c77a',
          animation: 'pulse 1.5s infinite ease-in-out',
        }}
      />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<BrandedLoadingFallback />}>
      <Routes>
        {/* Public Website Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/collections/:slug" element={<CollectionDetail />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/portfolio/:slug" element={<ProjectDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/consultation" element={<Consultation />} />

        {/* Admin Authentication */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin CMS Routes */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="products" element={<ProductsManager />} />
            <Route path="collections" element={<CollectionsManager />} />
            <Route path="projects" element={<ProjectsManager />} />
            <Route path="consultations" element={<ConsultationsManager />} />
            <Route path="contact" element={<ContactEnquiriesManager />} />
            <Route path="newsletter" element={<NewsletterManager />} />
            <Route path="faqs" element={<FaqsManager />} />
            <Route path="testimonials" element={<TestimonialsManager />} />
            <Route path="account" element={<ChangePasswordManager />} />
            <Route path="settings" element={<SettingsManager />} />
          </Route>
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
