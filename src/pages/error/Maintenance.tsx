import React from 'react';
import { Hammer } from 'lucide-react';

export const Maintenance: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-150 dark:border-amber-900/30 rounded-full text-warning">
          <Hammer className="h-10 w-10 animate-pulse" />
        </div>
      </div>
      <h1 className="text-4xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
        503
      </h1>
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
        System Maintenance
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
        Our core data pipelines are undergoing scheduled optimization. We will resume complete service capability shortly.
      </p>
    </div>
  );
};
export default Maintenance;
