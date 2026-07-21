import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import ScrollToTop from '../common/ScrollToTop';
import logo from '../../assets/logo.png';


export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 dark:bg-dark text-slate-800 dark:text-slate-100">
      <ScrollToTop />
      
      {/* Left Column: Brand & Graphics (Hidden on smaller screens) */}
      <div className="hidden lg:flex lg:col-span-5 bg-primary dark:bg-slate-950 flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-accent/20 filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-secondary/15 filter blur-3xl pointer-events-none" />
        
        {/* Back Link */}
        <Link to="/" className="flex items-center space-x-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer group">
          <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to homepage</span>
        </Link>

        {/* Brand Banner */}
        <div className="space-y-4 max-w-sm">
          <Link to="/" className="flex items-center gap-4 mb-6 cursor-pointer">
            <img
              src={logo}
              alt="Devolatical Global Info-Tech & Analytics Pvt. Ltd."
              className="h-11 w-auto object-contain flex-shrink-0"
              loading="eager"
              decoding="async"
            />
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg leading-none tracking-wide text-white uppercase">
                Devolatical
              </span>
              <span className="text-[10px] font-sans font-semibold tracking-widest text-slate-400 uppercase mt-0.5">
                Global Info-Tech
              </span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold font-heading leading-tight">
            Enterprise Portal & Analytics Hub
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Access secure data pipelines, system audit trails, cloud provisioning, and project delivery status boards.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400 border-t border-white/10 pt-6">
          <ShieldCheck className="h-5 w-5 text-accent" />
          <span>Designed with enterprise security best practices. 256-bit SSL encryption active.</span>
        </div>
      </div>

      {/* Right Column: Authentication Card Forms */}
      <div className="lg:col-span-7 flex flex-col justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-md mx-auto">
          {/* Back Home (Mobile Only) */}
          <Link to="/" className="inline-flex lg:hidden items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 mb-8 cursor-pointer">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Site</span>
          </Link>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
