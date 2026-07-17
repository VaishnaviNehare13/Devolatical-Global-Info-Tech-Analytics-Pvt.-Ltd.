import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Send, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../ui/Toast';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    showToast('Successfully subscribed to Devolatical Global newsletter!', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800/80 pt-16 pb-12">
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
                Global Info-Tech
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Architecting intelligent enterprise data ecosystems, advanced cloud analytics, and custom SaaS platforms for Fortune 500 companies.
          </p>
          <div className="flex space-x-4">
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
            Services & Solutions
          </h4>
          <ul className="space-y-3.5 text-sm">
            <li>
              <Link to="/services" className="hover:text-white text-slate-400 transition-colors">
                Advanced Data Analytics
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-white text-slate-400 transition-colors">
                Business Intelligence
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-white text-slate-400 transition-colors">
                AI & Machine Learning
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-white text-slate-400 transition-colors">
                Cloud Migration
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-white text-slate-400 transition-colors">
                Cyber Security
              </Link>
            </li>
          </ul>
        </div>

        {/* Global Offices */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
            Global Offices
          </h4>
          <ul className="space-y-4 text-sm text-slate-400">
            <li className="flex items-start">
              <MapPin className="h-5 w-5 mr-3 text-secondary flex-shrink-0 mt-0.5" />
              <span>
                <strong>Headquarters:</strong><br />
                Suite 4200, 1 World Trade Center,<br />
                New York, NY 10007, USA
              </span>
            </li>
            <li className="flex items-start">
              <MapPin className="h-5 w-5 mr-3 text-accent flex-shrink-0 mt-0.5" />
              <span>
                <strong>Global Tech Hub:</strong><br />
                Levels 5-8, Godrej One, Bandra Kurla Complex,<br />
                Mumbai, MH 400051, India
              </span>
            </li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
            Intelligence Briefing
          </h4>
          <p className="text-sm text-slate-400 mb-4 leading-relaxed">
            Subscribe to our weekly analysis reports on global data trends and cloud architectures.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
            <div className="relative">
              <Input
                type="email"
                placeholder="Enter work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 mb-0 py-3.5"
                required
              />
            </div>
            <Button type="submit" variant="secondary" className="w-full justify-center">
              <span className="mr-2">Subscribe</span>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Underlay */}
      <div className="max-w-7xl mx-auto px-6 border-t border-slate-800/80 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
        <div className="flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0 mb-4 md:mb-0">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-secondary" />
            <span>© 2026 Devolatical Global Info-Tech & Analytics Pvt. Ltd. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-3 text-[9px] font-mono tracking-wider text-slate-550">
            <span className="px-2 py-0.5 border border-slate-800 rounded">SOC 2 TYPE II DESIGNED</span>
            <span className="px-2 py-0.5 border border-slate-800 rounded">ISO 27001 KEY ALIGNMENT</span>
          </div>
        </div>
        <div className="flex space-x-6">
          <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          <Link to="/cookie-policy" className="hover:text-slate-300 transition-colors">Cookie settings</Link>
        </div>
      </div>
    </footer>
  );
};
