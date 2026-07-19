import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Sun, Moon, Database, Shield, Cpu, BarChart2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'services' | 'industries' | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on path changes
  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services', hasDropdown: 'services' },
    { name: 'Industries', path: '/industries', hasDropdown: 'industries' },
    { name: 'Case Studies', path: '/case-studies' },
    { name: 'Insights', path: '/insights' },
    { name: 'Careers', path: '/careers' },
    { name: 'Contact', path: '/contact' }
  ];

  const megaServices = [
    { name: 'Data Strategy & Advisory', desc: 'Enterprise roadmap assessments & strategy playbooks.', icon: <Database className="h-5 w-5 text-secondary" />, path: '/services' },
    { name: 'Enterprise Data Architecture', desc: 'Unified semantic models & decoupled cloud lakehouses.', icon: <BarChart2 className="h-5 w-5 text-accent" />, path: '/services' },
    { name: 'Data Engineering & ETL', desc: 'Apache Spark pipelines & high-throughput streaming integrations.', icon: <Cpu className="h-5 w-5 text-indigo-500" />, path: '/services' },
    { name: 'Data Governance & Risk', desc: 'Metadata catalogs, active stewardship & audit readiness logs.', icon: <Shield className="h-5 w-5 text-emerald-500" />, path: '/services' },
    { name: 'Business Intelligence', desc: 'Revenue analytics dashboarding & metric transformations.', icon: <BarChart2 className="h-5 w-5 text-red-500" />, path: '/services' },
    { name: 'AI & Machine Learning', desc: 'Predictive modeling algorithms & scalable PyTorch clusters.', icon: <Cpu className="h-5 w-5 text-yellow-500" />, path: '/services' }
  ];

  const megaIndustries = [
    { name: 'Healthcare & Life Sciences', path: '/industries' },
    { name: 'Banking & Financial Services', path: '/industries' },
    { name: 'Retail & E-commerce', path: '/industries' },
    { name: 'Manufacturing & Heavy Industry', path: '/industries' },
    { name: 'Logistics & Distribution', path: '/industries' },
    { name: 'Government & Public Sector', path: '/industries' },
    { name: 'Higher Education', path: '/industries' },
    { name: 'High-Technology & Software', path: '/industries' }
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 w-full z-40 transition-all duration-300 border-b border-transparent',
        isScrolled
          ? 'bg-white/90 dark:bg-dark/90 backdrop-blur-md shadow-sm border-slate-100 dark:border-slate-800'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 cursor-pointer">
          <svg className="h-9 w-9" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#002E5B" />
                <stop offset="50%" stopColor="#0F62FE" />
                <stop offset="100%" stopColor="#00C2FF" />
              </linearGradient>
            </defs>
            <path d="M50 5 L90 30 L90 70 L50 95 L10 70 L10 30 Z" stroke="url(#logoGrad)" strokeWidth="6" strokeLinejoin="round" />
            <path d="M50 25 L75 40 L75 60 L50 75 L25 60 L25 40 Z" fill="url(#logoGrad)" opacity="0.85" />
            <circle cx="50" cy="50" r="10" fill="#FFFFFF" />
          </svg>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-base leading-none tracking-wide text-primary dark:text-white uppercase">
              Devolatical
            </span>
            <span className="text-[9px] font-sans font-semibold tracking-widest text-slate-400 uppercase mt-0.5">
              Global Info-Tech
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <div
              key={link.name}
              className="relative"
              onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.hasDropdown as any)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                to={link.path}
                className={cn(
                  'flex items-center space-x-1 py-2 text-sm font-medium tracking-wide text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer',
                  location.pathname === link.path && 'text-primary dark:text-white font-semibold'
                )}
              >
                <span>{link.name}</span>
                {link.hasDropdown && <ChevronDown className="h-3.5 w-3.5" />}
              </Link>

              {/* MegaMenu Dropdown */}
              <AnimatePresence>
                {link.hasDropdown && activeDropdown === link.hasDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[600px] z-50 pointer-events-auto',
                      link.hasDropdown === 'industries' && 'w-[400px]'
                    )}
                  >
                    <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-800 rounded-xl shadow-2xl p-6 grid grid-cols-1 gap-4">
                      {link.hasDropdown === 'services' && (
                        <div className="grid grid-cols-2 gap-4">
                          {megaServices.map((service) => (
                            <Link
                              key={service.name}
                              to={service.path}
                              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                            >
                              <div className="flex-shrink-0 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                                {service.icon}
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-slate-800 dark:text-white leading-none mb-1">
                                  {service.name}
                                </h4>
                                <p className="text-xs text-slate-400 leading-tight">
                                  {service.desc}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {link.hasDropdown === 'industries' && (
                        <div className="grid grid-cols-2 gap-2">
                          {megaIndustries.map((ind) => (
                            <Link
                              key={ind.name}
                              to={ind.path}
                              className="p-2 text-sm text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg transition-colors font-medium"
                            >
                              {ind.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Right Side CTAs */}
        <div className="hidden lg:flex items-center space-x-4">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          {/* Portal Links */}
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white mr-2">
            Client Portal
          </Link>
          <Link to="/contact">
            <Button variant="secondary" size="sm">
              Schedule Consultation
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger / Actions */}
        <div className="flex lg:hidden items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-dark-card overflow-hidden"
          >
            <div className="px-6 py-8 space-y-4 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-base font-semibold text-slate-800 dark:text-white"
                >
                  {link.name}
                </Link>
              ))}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col space-y-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-semibold text-slate-600 dark:text-slate-300 text-center py-2"
                >
                  Client Portal
                </Link>
                <Link to="/contact" onClick={() => setIsOpen(false)} className="w-full">
                  <Button variant="secondary" className="w-full justify-center">
                    Schedule Consultation
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
