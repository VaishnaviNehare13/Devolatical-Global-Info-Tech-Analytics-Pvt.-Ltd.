import React from 'react';
import { motion } from 'framer-motion';
import { Database, TrendingUp, Cpu } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="relative w-full bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden text-left">
      {/* Top Controls Grid */}
      <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/40 pb-4 mb-6">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="px-3 py-1 bg-slate-50 dark:bg-dark rounded-md border border-slate-100 dark:border-slate-800/40 text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono">
          devolatical-telemetry-v1
        </div>
      </div>

      {/* Main Grid Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* KPI Panel 1 */}
        <div className="p-4 bg-slate-50 dark:bg-dark/40 border border-slate-100/50 dark:border-slate-800/40 rounded-xl flex items-center space-x-4">
          <div className="p-2.5 bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300 rounded-lg">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Active Clusters</span>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">12 Nodes</h4>
          </div>
        </div>

        {/* KPI Panel 2 */}
        <div className="p-4 bg-slate-50 dark:bg-dark/40 border border-slate-100/50 dark:border-slate-800/40 rounded-xl flex items-center space-x-4">
          <div className="p-2.5 bg-secondary/10 text-secondary dark:bg-secondary/20 rounded-lg">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Processing Vol</span>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">4.8 TB/s</h4>
          </div>
        </div>

        {/* KPI Panel 3 */}
        <div className="p-4 bg-slate-50 dark:bg-dark/40 border border-slate-100/50 dark:border-slate-800/40 rounded-xl flex items-center space-x-4">
          <div className="p-2.5 bg-accent/10 text-accent dark:bg-accent/20 rounded-lg">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Queue Latency</span>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">0.42 ms</h4>
          </div>
        </div>
      </div>

      {/* Interactive Telemetry Chart */}
      <div className="h-44 flex flex-col justify-end">
        <div className="flex-1 flex items-end space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800/60">
          {[42, 85, 34, 94, 60, 48, 80, 56, 74].map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-slate-50 dark:bg-dark/40 rounded h-32 flex items-end overflow-hidden">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${val}%` }}
                  transition={{ duration: 1.2, delay: idx * 0.08, ease: 'easeOut' }}
                  className="w-full bg-gradient-to-t from-primary to-accent rounded-t"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold uppercase mt-2 font-mono">
          <span>ETL Stream Performance</span>
          <span>Zero-Downtime Pipeline</span>
        </div>
      </div>
    </div>
  );
};
export default AnalyticsDashboard;
