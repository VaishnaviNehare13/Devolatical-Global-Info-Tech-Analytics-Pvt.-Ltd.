import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  Briefcase,
  FileText,
  User,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import { NotificationBell } from '../common/NotificationBell';
import logo from '../../assets/logo.png';

export const EmployeeLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  const handleLogout = async () => {
    try {
      await logout();
      showToast('Successfully logged out of Employee Workspace.', 'info');
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const menuItems = [
    { name: 'Employee Dashboard', path: '/employee', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'My Tasks', path: '/employee/tasks', icon: <CheckSquare className="h-5 w-5" /> },
    { name: 'My Projects', path: '/employee/projects', icon: <Briefcase className="h-5 w-5" /> },
    { name: 'Documents', path: '/employee/documents', icon: <FileText className="h-5 w-5" /> },
    { name: 'Profile & Settings', path: '/employee/profile', icon: <User className="h-5 w-5" /> },
  ];

  // Derive user initials and display name
  const userProfile = user && 'displayName' in user ? (user as { displayName?: string; firstName?: string; lastName?: string }) : null;
  const displayName =
    userProfile?.displayName ||
    (userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim() : '') ||
    user?.email ||
    'Employee User';

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n: string) => n[0].toUpperCase())
    .join('') || 'EU';


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
            <span className="text-[8px] font-sans font-semibold tracking-widest text-slate-400 uppercase mt-0.5">
              Employee Workspace
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
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${
                    isActive ? 'rotate-90' : 'group-hover:translate-x-1'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Operational Security Clearance Banner */}
        <div className="mx-4 mb-4 p-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-left">
          <div className="flex items-center gap-2 text-xs font-semibold text-accent mb-1">
            <Shield className="h-3.5 w-3.5" />
            <span>Internal RBAC</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-snug">
            Authorized workspace for technical execution & project delivery.
          </p>
        </div>

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
            <span>Logout Session</span>
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
            Devolatical Team
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg border border-slate-800 cursor-pointer"
          aria-label="Toggle mobile menu"
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
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-amber-400" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                <span>Toggle Theme</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 p-3 rounded-lg text-sm font-medium text-danger hover:bg-red-950/20"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout Session</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* Top Header */}
        <header className="hidden lg:flex h-20 bg-white dark:bg-dark-card border-b border-slate-100 dark:border-slate-800/40 items-center justify-between px-8 flex-shrink-0">
          <div className="flex flex-col text-left">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Operations & Technical Delivery Hub
            </h2>
            <span className="text-xs text-slate-400">Internal Enterprise Workspace</span>
          </div>

          <div className="flex items-center space-x-6 relative">
            {/* Notification Bell */}
            <NotificationBell role="employee" />

            {/* Employee Avatar Info */}
            <div className="flex items-center space-x-3 border-l border-slate-100 dark:border-slate-800/60 pl-6 text-left">
              <div className="h-9 w-9 rounded-full bg-secondary/15 text-secondary border border-secondary/30 flex items-center justify-center font-bold text-sm font-heading">
                {initials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-950 dark:text-white leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] text-slate-400 font-medium font-mono">
                  Clearance: Technical Ops
                </span>
              </div>
            </div>
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

export default EmployeeLayout;
