import React from 'react';

export const LoadingLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark flex flex-col justify-center items-center p-6">
      <div className="flex flex-col items-center space-y-4">
        {/* Animated Brand Logo pulsing */}
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold text-2xl shadow-glow animate-pulse">
            D
          </div>
          <div className="absolute inset-0 h-16 w-16 rounded-2xl border-2 border-secondary animate-ping opacity-30" />
        </div>
        
        {/* Loading text details */}
        <div className="text-center space-y-1">
          <h3 className="font-heading font-bold text-sm tracking-wider text-slate-800 dark:text-white uppercase">
            Devolatical Global
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
            Provisioning Secure Channels...
          </p>
        </div>
      </div>
    </div>
  );
};
export default LoadingLayout;
