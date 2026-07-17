import React from 'react';

export const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-left space-y-6">
      <h1 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
        Privacy Policy
      </h1>
      <p className="text-xs text-slate-400">Effective Date: July 17, 2026</p>
      
      <p className="text-sm text-slate-500 leading-relaxed">
        At Devolatical Global Info-Tech & Analytics Pvt. Ltd., we prioritize the security and confidentiality of client data. This Privacy Policy details our ingestion standards, cookies logs, and security parameters across all public websites, client portals, and administrative workspaces.
      </p>

      <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-8">1. Information We Collect</h3>
      <p className="text-sm text-slate-500 leading-relaxed">
        We collect work emails, corporate naming variables, and telemetry logs provided voluntarily through contact inquiries, recruitment portals, and SSO client workspace portals.
      </p>

      <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-8">2. Hashing and Security Storage</h3>
      <p className="text-sm text-slate-500 leading-relaxed">
        All stored passwords and sensitive telemetry streams are hashed using AES-256-GCM configurations. Data stores are locked and audited under SOC 2 compliance guidelines.
      </p>
    </div>
  );
};
export default Privacy;
