import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ScrollToTop from '../common/ScrollToTop';

export const ErrorLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center p-6 text-center">
      <ScrollToTop />
      
      <div className="w-full max-w-md bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl p-8 md:p-12 relative overflow-hidden">
        {/* Decorative ambient background */}
        <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-danger/5 filter blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-secondary/5 filter blur-2xl pointer-events-none" />
        
        {/* Render child pages: NotFound or Maintenance */}
        <Outlet />

        <div className="mt-8 border-t border-slate-50 dark:border-slate-800/40 pt-6">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to safe environment</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
