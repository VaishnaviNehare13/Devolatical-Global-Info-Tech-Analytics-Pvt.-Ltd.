import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingLayout } from './components/layout/LoadingLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';

// Layouts (Eagerly loaded for instant shell render)
import { PublicLayout } from './components/layout/PublicLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { ClientPortalLayout } from './components/layout/ClientPortalLayout';
import { EmployeeLayout } from './components/layout/EmployeeLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ErrorLayout } from './components/layout/ErrorLayout';

// Public Pages (Lazy Loaded for route-level code splitting)
const Home = lazy(() => import('./pages/public/Home'));
const About = lazy(() => import('./pages/public/About'));
const Services = lazy(() => import('./pages/public/Services'));
const Industries = lazy(() => import('./pages/public/Industries'));
const CaseStudies = lazy(() => import('./pages/public/CaseStudies'));
const Insights = lazy(() => import('./pages/public/Insights'));
const Careers = lazy(() => import('./pages/public/Careers'));
const Contact = lazy(() => import('./pages/public/Contact'));
const Privacy = lazy(() => import('./pages/public/Privacy'));
const Terms = lazy(() => import('./pages/public/Terms'));
const CookiePolicy = lazy(() => import('./pages/public/CookiePolicy'));

// Auth Pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));

// Client Portal Pages
const ClientOverview = lazy(() => import('./pages/client/ClientOverview'));
const ClientProjects = lazy(() => import('./pages/client/ClientProjects'));
const ClientInvoices = lazy(() => import('./pages/client/ClientInvoices'));
const ClientSupport = lazy(() => import('./pages/client/ClientSupport'));
const ClientProfile = lazy(() => import('./pages/client/ClientProfile'));

// Employee Workspace Pages
const EmployeeDashboard = lazy(() => import('./pages/employee/EmployeeDashboard'));
const EmployeeTasks = lazy(() => import('./pages/employee/EmployeeTasks'));
const EmployeeProjects = lazy(() => import('./pages/employee/EmployeeProjects'));
const EmployeeDocuments = lazy(() => import('./pages/employee/EmployeeDocuments'));
const EmployeeProfile = lazy(() => import('./pages/employee/EmployeeProfile'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminLeads = lazy(() => import('./pages/admin/AdminLeads'));
const AdminInvoices = lazy(() => import('./pages/admin/AdminInvoices'));
const AdminTickets = lazy(() => import('./pages/admin/AdminTickets'));
const AdminCareers = lazy(() => import('./pages/admin/AdminCareers'));
const AdminPipelines = lazy(() => import('./pages/admin/AdminPipelines'));
const AdminAudit = lazy(() => import('./pages/admin/AdminAudit'));
const AdminSecurity = lazy(() => import('./pages/admin/AdminSecurity'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

// Error Pages
const NotFound = lazy(() => import('./pages/error/NotFound'));
const Maintenance = lazy(() => import('./pages/error/Maintenance'));

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <AuthProvider>
              <ScrollToTop />
              <Suspense fallback={<LoadingLayout />}>
                <Routes>
                  {/* Public Marketing & Legal Pages */}
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

                  {/* Client Portal Pages (Guarded) */}
                  <Route
                    path="/portal"
                    element={
                      <ProtectedRoute>
                        <ClientPortalLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<ClientOverview />} />
                    <Route path="projects" element={<ClientProjects />} />
                    <Route path="invoices" element={<ClientInvoices />} />
                    <Route path="support" element={<ClientSupport />} />
                    <Route path="profile" element={<ClientProfile />} />
                  </Route>

                  {/* Employee Workspace Pages (Role-Guarded for Internal Staff & Admin Preview) */}
                  <Route
                    path="/employee"
                    element={
                      <ProtectedRoute
                        allowedRoles={['EMPLOYEE', 'Employee', 'SUPER_ADMIN', 'ADMIN', 'Super Admin', 'Admin']}
                      >
                        <EmployeeLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<EmployeeDashboard />} />
                    <Route path="tasks" element={<EmployeeTasks />} />
                    <Route path="projects" element={<EmployeeProjects />} />
                    <Route path="documents" element={<EmployeeDocuments />} />
                    <Route path="profile" element={<EmployeeProfile />} />
                  </Route>

                  {/* Admin Dashboard Pages (Role-Guarded for Administrative Roles) */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'Super Admin', 'Admin']}>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="leads" element={<AdminLeads />} />
                    <Route path="invoices" element={<AdminInvoices />} />
                    <Route path="tickets" element={<AdminTickets />} />
                    <Route path="careers" element={<AdminCareers />} />
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
              </Suspense>
            </AuthProvider>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
