import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ui/Toast';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { ClientPortalLayout } from './components/layout/ClientPortalLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ErrorLayout } from './components/layout/ErrorLayout';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Services from './pages/public/Services';
import Industries from './pages/public/Industries';
import CaseStudies from './pages/public/CaseStudies';
import Insights from './pages/public/Insights';
import Careers from './pages/public/Careers';
import Contact from './pages/public/Contact';
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';
import CookiePolicy from './pages/public/CookiePolicy';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Client Portal Pages
import ClientOverview from './pages/client/ClientOverview';
import ClientProjects from './pages/client/ClientProjects';
import ClientInvoices from './pages/client/ClientInvoices';
import ClientSupport from './pages/client/ClientSupport';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPipelines from './pages/admin/AdminPipelines';
import AdminAudit from './pages/admin/AdminAudit';
import AdminSecurity from './pages/admin/AdminSecurity';
import AdminSettings from './pages/admin/AdminSettings';

// Error Pages
import NotFound from './pages/error/NotFound';
import Maintenance from './pages/error/Maintenance';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="services" element={<Services />} />
              <Route path="industries" element={<Industries />} />
              <Route path="case-studies" element={<CaseStudies />} />
              <Route path="insights" element={<Insights />} />
              <Route path="careers" element={<Careers />} />
              <Route path="contact" element={<Contact />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />
              <Route path="cookie-policy" element={<CookiePolicy />} />
            </Route>

            {/* Authentication Pages */}
            <Route path="/" element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>

            {/* Client Portal Pages */}
            <Route path="/portal" element={<ClientPortalLayout />}>
              <Route index element={<ClientOverview />} />
              <Route path="projects" element={<ClientProjects />} />
              <Route path="invoices" element={<ClientInvoices />} />
              <Route path="support" element={<ClientSupport />} />
            </Route>

            {/* Admin Dashboard Pages */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="pipelines" element={<AdminPipelines />} />
              <Route path="audit" element={<AdminAudit />} />
              <Route path="security" element={<AdminSecurity />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Error Pages */}
            <Route path="/" element={<ErrorLayout />}>
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
