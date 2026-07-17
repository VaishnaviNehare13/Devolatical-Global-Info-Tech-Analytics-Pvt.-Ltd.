import React from 'react';

export const CookiePolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-left space-y-6">
      <h1 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
        Cookie Policy
      </h1>
      <p className="text-xs text-slate-400">Effective Date: July 17, 2026</p>
      
      <p className="text-sm text-slate-500 leading-relaxed">
        Our platform uses functional cookies to track active client sessions and retain dark/light mode configurations in local storage caches.
      </p>

      <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-8">1. Necessary Session Cookies</h3>
      <p className="text-sm text-slate-500 leading-relaxed">
        Functional parameters are crucial to verify user tokens across our admin and client routing gates. Disabling cookies will terminate dashboard login features.
      </p>
    </div>
  );
};
export default CookiePolicy;
