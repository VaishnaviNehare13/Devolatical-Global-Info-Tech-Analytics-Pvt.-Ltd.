import React from 'react';

export const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-left space-y-6">
      <h1 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
        Terms of Service
      </h1>
      <p className="text-xs text-slate-400">Last Updated: July 17, 2026</p>
      
      <p className="text-sm text-slate-500 leading-relaxed">
        By accessing the Devolatical Global corporate public website or Client Portal, you agree to follow our System Security Charter and acceptable usage parameters.
      </p>

      <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-8">1. Authorized Usage</h3>
      <p className="text-sm text-slate-500 leading-relaxed">
        Client portal credentials must be kept confidential. Any unauthorized scripting, ingestion overloading, or DDoS attempts on our pipelines will trigger immediate session terminations and security logs reviews.
      </p>
    </div>
  );
};
export default Terms;
