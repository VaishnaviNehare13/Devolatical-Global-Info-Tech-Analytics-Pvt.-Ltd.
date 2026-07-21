import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Send, ShieldCheck, Mail } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../ui/Toast';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    showToast('Successfully subscribed to Devolatical Global analysis updates!', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800/80 pt-16 pb-12 text-left">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Brand Details */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <svg className="h-9 w-9" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="footerLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#002E5B" />
                  <stop offset="50%" stopColor="#0F62FE" />
                  <stop offset="100%" stopColor="#00C2FF" />
                </linearGradient>
              </defs>
              <path d="M50 5 L90 30 L90 70 L50 95 L10 70 L10 30 Z" stroke="url(#footerLogoGrad)" strokeWidth="6" strokeLinejoin="round" />
              <path d="M50 25 L75 40 L75 60 L50 75 L25 60 L25 40 Z" fill="url(#footerLogoGrad)" opacity="0.85" />
              <circle cx="50" cy="50" r="10" fill="#FFFFFF" />
            </svg>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-base leading-none tracking-wide text-white uppercase">
                Devolatical
              </span>
              <span className="text-[9px] font-sans font-semibold tracking-widest text-slate-500 uppercase mt-0.5">
                Global Info-Tech & Analytics
              </span>
            </div>
          </div>
          <p className="text-xs font-semibold text-secondary uppercase tracking-wider">
            "Empowering Growth Through Advanced Analytics & Smart Technology"
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Delivering high-performance software solutions, robust IT infrastructure, and actionable data analytics that empower businesses worldwide.
          </p>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Mail className="h-4 w-4 text-secondary flex-shrink-0" />
            <a href="mailto:devolaticalglobalinfotech@gmail.com" className="hover:text-white transition-colors">
              devolaticalglobalinfotech@gmail.com
            </a>
          </div>
        </div>

        {/* Core Offerings */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
            Official Services
          </h4>
          <ul className="space-y-3.5 text-xs text-slate-400">
            <li>
              <Link to="/services" className="hover:text-white transition-colors font-medium">
                Advanced Data Analytics
              </Link>
              <p className="text-[10px] text-slate-500 mt-0.5">BI, Visualization, Predictive Analytics, Dashboards</p>
            </li>
            <li>
              <Link to="/services" className="hover:text-white transition-colors font-medium">
                IT Infrastructure Solutions
              </Link>
              <p className="text-[10px] text-slate-500 mt-0.5">Cloud Migration, Network Architecture, Monitoring</p>
            </li>
            <li>
              <Link to="/services" className="hover:text-white transition-colors font-medium">
                Custom Software Solutions
              </Link>
              <p className="text-[10px] text-slate-500 mt-0.5">Enterprise Web, Mobile Apps, Workflow Automation</p>
            </li>
          </ul>
        </div>

        {/* Official Location */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
            Company Location
          </h4>
          <ul className="space-y-4 text-xs text-slate-400">
            <li className="flex items-start">
              <MapPin className="h-5 w-5 mr-3 text-secondary flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-200">Registered Office & Tech Hub:</strong><br />
                Andheri West,<br />
                Mumbai, Maharashtra,<br />
                India
              </span>
            </li>
          </ul>
        </div>

        {/* Intelligence Briefing */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
            Intelligence Briefing
          </h4>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Subscribe to our periodic technical analysis reports on data pipelines and enterprise cloud architectures.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
            <div className="relative">
              <Input
                type="email"
                placeholder="Enter work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 mb-0 py-3 text-xs"
                required
              />
            </div>
            <Button type="submit" variant="secondary" className="w-full justify-center text-xs py-2.5">
              <span className="mr-2">Subscribe</span>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </div>

      {/* Underlay & Security Indicators */}
      <div className="max-w-7xl mx-auto px-6 border-t border-slate-800/80 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
        <div className="flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0 mb-4 md:mb-0">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-secondary" />
            <span>© 2026 Devolatical Global Info-Tech & Analytics Pvt. Ltd. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[9px] font-mono tracking-wider text-slate-400">
            <span className="px-2 py-0.5 border border-slate-800 rounded bg-slate-850">End-to-End Encryption</span>
            <span className="px-2 py-0.5 border border-slate-800 rounded bg-slate-850">Multi-Factor Authentication (MFA)</span>
            <span className="px-2 py-0.5 border border-slate-800 rounded bg-slate-850">Secure Client Portal</span>
            <span className="px-2 py-0.5 border border-slate-800 rounded bg-slate-850">Enterprise-Grade Security</span>
          </div>
        </div>
        <div className="flex space-x-6 text-xs">
          <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          <Link to="/cookie-policy" className="hover:text-slate-300 transition-colors">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
