import React from 'react';
import { ShieldX } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900/30 rounded-full text-danger">
          <ShieldX className="h-10 w-10 animate-bounce" />
        </div>
      </div>
      <h1 className="text-4xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
        404
      </h1>
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
        Access Denied / Not Found
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
        The requested resource is either locked, has been archived, or the security token expired. Verify your destination path.
      </p>
    </div>
  );
};
export default NotFound;
