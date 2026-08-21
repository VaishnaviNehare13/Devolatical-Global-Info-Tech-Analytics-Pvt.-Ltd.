import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Database, ShieldAlert, Settings, LogOut, Sun, Moon, ChevronRight, Menu, X, Terminal, Users, Inbox, Briefcase, LifeBuoy, TrendingUp, Receipt, FolderGit2, Building2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import { NotificationBell } from '../common/NotificationBell';
import logo from '../../assets/logo.png';


export const AdminLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Derive dynamic admin identity
  const userProfile = user && 'displayName' in user ? (user as { displayName?: string; firstName?: string; lastName?: string }) : null;
  const displayName =
    userProfile?.displayName ||
    (userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim() : '') ||
    user?.email ||
    'System Admin';

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n: string) => n[0].toUpperCase())
    .join('') || 'SA';

  const firstRole = user?.roles?.[0];
  const primaryRole = typeof firstRole === 'string'
    ? firstRole
    : (firstRole as { name?: string; code?: string } | undefined)?.name ||
      (firstRole as { name?: string; code?: string } | undefined)?.code ||
      'Super Admin';

  const handleLogout = async () => {

    try {
      await logout();
      showToast('Successfully logged out of Admin Panel.', 'info');
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const menuItems = [
    { name: 'Admin Dashboard', path: '/admin', icon: <BarChart3 className="h-5 w-5" /> },
    { name: 'Analytics & Reports', path: '/admin/analytics', icon: <TrendingUp className="h-5 w-5" /> },
    { name: 'Project Management', path: '/admin/projects', icon: <FolderGit2 className="h-5 w-5" /> },
    { name: 'Client CRM', path: '/admin/clients', icon: <Building2 className="h-5 w-5" /> },
    { name: 'User Directory', path: '/admin/users', icon: <Users className="h-5 w-5" /> },
    { name: 'Lead Directory', path: '/admin/leads', icon: <Inbox className="h-5 w-5" /> },
    { name: 'Invoices & Billing', path: '/admin/invoices', icon: <Receipt className="h-5 w-5" /> },
    { name: 'Support Tickets', path: '/admin/tickets', icon: <LifeBuoy className="h-5 w-5" /> },
    { name: 'Recruitment', path: '/admin/careers', icon: <Briefcase className="h-5 w-5" /> },
    { name: 'Data Pipelines', path: '/admin/pipelines', icon: <Database className="h-5 w-5" /> },
    { name: 'System Audit Logs', path: '/admin/audit', icon: <Terminal className="h-5 w-5" /> },
    { name: 'Security & Access', path: '/admin/security', icon: <ShieldAlert className="h-5 w-5" /> },
    { name: 'Global Settings', path: '/admin/settings', icon: <Settings className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark text-slate-800 dark:text-slate-100 flex flex-col lg:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 flex-shrink-0">
        {/* Brand */}
        <Link to="/" className="p-6 border-b border-slate-800 flex items-center gap-4 cursor-pointer">
          <img
            src={logo}
            alt="Devolatical Global Info-Tech & Analytics Pvt. Ltd."
            className="h-10 w-auto object-contain flex-shrink-0"
            loading="eager"
            decoding="async"
          />
          <div className="flex flex-col">
            <span className="font-heading font-bold text-sm leading-none tracking-wide text-white uppercase">
              Devolatical
            </span>
            <span className="text-[8px] font-sans font-semibold tracking-widest text-slate-500 uppercase mt-0.5">
              Admin Environment
            </span>
          </div>
        </Link>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-secondary text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
                <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 flex flex-col space-y-2">
          <button
            onClick={toggleTheme}
            className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-5 w-5 text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-5 w-5" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-red-950/20 transition-colors cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout Admin</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header Menu Trigger */}
      <header className="lg:hidden h-16 bg-slate-900 text-white flex items-center justify-between px-6 z-30">
        <Link to="/" className="flex items-center gap-3.5 cursor-pointer">
          <img
            src={logo}
            alt="Devolatical Global Info-Tech & Analytics Pvt. Ltd."
            className="h-8 w-auto object-contain flex-shrink-0"
            loading="eager"
            decoding="async"
          />
          <span className="font-heading font-bold text-sm text-white uppercase">
            Devolatical Admin
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg border border-slate-850 cursor-pointer"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-slate-900 text-slate-300 px-6 py-4 space-y-2 flex flex-col z-20 border-b border-slate-800"
          >
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 p-3 rounded-lg text-sm font-medium ${
                  location.pathname === item.path
                    ? 'bg-secondary text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
            <div className="border-t border-slate-800 pt-4 flex flex-col space-y-2">
              <button
                onClick={() => {
                  toggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 p-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
                <span>Toggle Theme</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 p-3 rounded-lg text-sm font-medium text-danger hover:bg-red-950/20"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout Admin</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* Top Header */}
        <header className="hidden lg:flex h-20 bg-white dark:bg-dark-card border-b border-slate-50 dark:border-slate-800/40 items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            System Operations Panel
          </h2>
          <div className="flex items-center space-x-6">
            {/* Notification Bell */}
            <NotificationBell role="admin" />

            {/* Admin Avatar Info */}
            <Link to="/admin/settings" className="flex items-center space-x-3 border-l border-slate-100 dark:border-slate-800/60 pl-6 text-left cursor-pointer group">
              <div className="h-9 w-9 rounded-full bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 flex items-center justify-center text-accent font-bold text-sm font-heading group-hover:scale-105 transition-transform">
                {initials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-950 dark:text-white leading-tight group-hover:text-accent transition-colors">{displayName}</span>
                <span className="text-[10px] text-slate-400 font-medium font-mono">Clearance: {primaryRole}</span>
              </div>
            </Link>
          </div>

        </header>

        {/* Routed Sub-pages content viewport */}
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
