import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Sun, Moon, Database, Server, Code } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import logo from '../../assets/logo.png';


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

  const officialServicePillars = [
    {
      name: 'Advanced Data Analytics',
      desc: 'Business Intelligence, Data Visualization, Predictive Analytics, Dashboards & Automated Reporting.',
      icon: <Database className="h-5 w-5 text-secondary" />,
      path: '/services'
    },
    {
      name: 'IT Infrastructure Solutions',
      desc: 'Cloud Migration, Network Architecture, Infrastructure Monitoring, Secure Deployments & IT Support.',
      icon: <Server className="h-5 w-5 text-accent" />,
      path: '/services'
    },
    {
      name: 'Custom Software Solutions',
      desc: 'Enterprise Web Applications, Mobile Applications, Workflow Automation & Business Software.',
      icon: <Code className="h-5 w-5 text-indigo-500" />,
      path: '/services'
    }
  ];

  const megaIndustries = [
    { name: 'Banking & Financial Services', path: '/industries' },
    { name: 'Healthcare & Life Sciences', path: '/industries' },
    { name: 'Retail & E-commerce', path: '/industries' },
    { name: 'Manufacturing & Heavy Industry', path: '/industries' },
    { name: 'Logistics & Distribution', path: '/industries' },
    { name: 'Government & Public Sector', path: '/industries' },
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
        <Link to="/" className="flex items-center gap-4 cursor-pointer">
          <img
            src={logo}
            alt="Devolatical Global Info-Tech & Analytics Pvt. Ltd."
            className="h-10 md:h-12 lg:h-14 w-auto object-contain flex-shrink-0"
            loading="eager"
            decoding="async"
          />
          <div className="flex flex-col text-left">
            <span className="font-heading font-bold text-base leading-none tracking-wide text-primary dark:text-white uppercase">
              Devolatical
            </span>
            <span className="text-[9px] font-sans font-semibold tracking-widest text-slate-400 uppercase mt-0.5">
              Global Info-Tech & Analytics
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-7">
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
                {link.hasDropdown && <ChevronDown className="h-3.5 w-3.5 opacity-70" />}
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
                      'absolute top-full left-1/2 -translate-x-1/2 pt-4 z-50 pointer-events-auto',
                      link.hasDropdown === 'services' ? 'w-[520px]' : 'w-[420px]'
                    )}
                  >
                    <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-800 rounded-xl shadow-2xl p-5 text-left">
                      {link.hasDropdown === 'services' && (
                        <div className="space-y-3">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100 dark:border-slate-800">
                            Official Core Services
                          </div>
                          {officialServicePillars.map((service) => (
                            <Link
                              key={service.name}
                              to={service.path}
                              className="flex items-start space-x-3.5 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                            >
                              <div className="flex-shrink-0 p-2.5 rounded-lg bg-slate-50 dark:bg-dark border border-slate-100 dark:border-slate-800 group-hover:border-secondary/30 transition-colors">
                                {service.icon}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-850 dark:text-white leading-none mb-1 group-hover:text-secondary transition-colors">
                                  {service.name}
                                </h4>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                  {service.desc}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {link.hasDropdown === 'industries' && (
                        <div className="space-y-3">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100 dark:border-slate-800">
                            Enterprise Sectors
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {megaIndustries.map((ind) => (
                              <Link
                                key={ind.name}
                                to={ind.path}
                                className="p-2.5 text-xs text-slate-650 hover:text-secondary dark:text-slate-300 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors font-medium"
                              >
                                {ind.name}
                              </Link>
                            ))}
                          </div>
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
            aria-label="Toggle theme"
            className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          {/* Portal Links */}
          <Link to="/login" className="text-xs font-semibold text-slate-650 hover:text-primary dark:text-slate-300 dark:hover:text-white mr-1 transition-colors">
            Client Portal
          </Link>
          <Link to="/contact">
            <Button variant="secondary" size="sm" className="text-xs font-bold px-4">
              Schedule Consultation
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger / Actions */}
        <div className="flex lg:hidden items-center space-x-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
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
            className="lg:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-dark-card overflow-hidden text-left"
          >
            <div className="px-6 py-6 space-y-3 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-semibold text-slate-800 dark:text-white py-1 hover:text-secondary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col space-y-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 text-center py-2 border border-slate-200 dark:border-slate-800 rounded-lg"
                >
                  Client Portal Login
                </Link>
                <Link to="/contact" onClick={() => setIsOpen(false)} className="w-full">
                  <Button variant="secondary" className="w-full justify-center text-xs font-bold">
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

export default Navbar;
