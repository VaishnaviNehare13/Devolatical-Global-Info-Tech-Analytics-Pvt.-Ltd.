import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Database, TrendingUp, Server, Network, Clock } from 'lucide-react';

export const HeroDashboard: React.FC = () => {
  // 16 Server node health states
  const serverNodes = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    health: Math.random() > 0.15 ? 'healthy' : 'warning',
    delay: Math.random() * 2
  }));

  // Connection points for mock topology
  const networkNodes = [
    { x: 50, y: 80, label: 'Kinesis Ingest' },
    { x: 180, y: 50, label: 'Spark ETL' },
    { x: 180, y: 120, label: 'Kafka Buffer' },
    { x: 300, y: 80, label: 'Snowflake Core' }
  ];

  return (
    <div className="relative w-full max-w-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-2xl p-6 overflow-hidden text-left">
      {/* Glow overlays */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-secondary/5 filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-accent/5 filter blur-3xl pointer-events-none" />

      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/40 pb-4 mb-6">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-red-400/80" />
          <span className="w-3 h-3 rounded-full bg-amber-400/80" />
          <span className="w-3 h-3 rounded-full bg-green-400/80" />
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold font-mono pl-2">
            devolatical-ops-cluster-04 // Active
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest font-mono">
            Syncing
          </span>
        </div>
      </div>

      {/* Grid of Telemetry & Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Live KPI Stats (7/12) */}
        <div className="md:col-span-7 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* KPI Card 1 */}
            <div className="p-4 bg-slate-50/50 dark:bg-dark/20 border border-slate-100 dark:border-slate-800/50 rounded-xl space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Ingestion Rate</span>
                <Database className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <h4 className="text-xl font-bold font-mono tracking-tight text-slate-800 dark:text-white">
                  234k <span className="text-xs text-slate-400">/s</span>
                </h4>
                <p className="text-[9px] text-green-500 font-medium mt-1">▲ 14% peak load</p>
              </div>
            </div>

            {/* KPI Card 2 */}
            <div className="p-4 bg-slate-50/50 dark:bg-dark/20 border border-slate-100 dark:border-slate-800/50 rounded-xl space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Avg Latency</span>
                <Clock className="h-4 w-4 text-accent" />
              </div>
              <div>
                <h4 className="text-xl font-bold font-mono tracking-tight text-slate-800 dark:text-white">
                  0.38 <span className="text-xs text-slate-400">ms</span>
                </h4>
                <p className="text-[9px] text-green-500 font-medium mt-1">✓ Under SLA limit</p>
              </div>
            </div>
          </div>

          {/* Real-time Ingestion Stream Chart */}
          <div className="p-4 bg-slate-50/50 dark:bg-dark/20 border border-slate-100 dark:border-slate-800/50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-slate-400 dark:text-slate-500">
                <TrendingUp className="h-4 w-4 text-secondary" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Pipeline Throughput</span>
              </div>
              <span className="text-[9px] font-semibold text-slate-500 font-mono">4.8 GB/s</span>
            </div>
            
            {/* SVG area graph with grid lines */}
            <div className="h-24 relative overflow-hidden">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0F62FE" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#0F62FE" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1="25" x2="300" y2="25" stroke="currentColor" strokeWidth="0.5" className="text-slate-100 dark:text-slate-800/50" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="300" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-slate-100 dark:text-slate-800/50" strokeDasharray="3 3" />
                <line x1="0" y1="75" x2="300" y2="75" stroke="currentColor" strokeWidth="0.5" className="text-slate-100 dark:text-slate-800/50" strokeDasharray="3 3" />
                
                {/* Area Fill */}
                <motion.path
                  d="M 0 100 L 0 50 Q 50 30 100 65 T 200 40 Q 250 85 300 35 L 300 100 Z"
                  fill="url(#chartGradient)"
                />
                
                {/* Stroke Line */}
                <motion.path
                  d="M 0 50 Q 50 30 100 65 T 200 40 Q 250 85 300 35"
                  fill="none"
                  stroke="#0F62FE"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Right Column: Server Nodes & Topology (5/12) */}
        <div className="md:col-span-5 space-y-4">
          {/* Server Nodes Grid */}
          <div className="p-4 bg-slate-50/50 dark:bg-dark/20 border border-slate-100 dark:border-slate-800/50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Compute Grid</span>
              <Server className="h-4 w-4 text-slate-400" />
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {serverNodes.map((node) => (
                <motion.div
                  key={node.id}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, delay: node.delay }}
                  className={`h-6 rounded-md flex items-center justify-center border text-[8px] font-mono font-bold ${
                    node.health === 'healthy'
                      ? 'bg-green-500/10 border-green-500/20 text-green-500'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                  }`}
                >
                  N-{node.id}
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI Predict / Deployment Status */}
          <div className="p-4 bg-slate-50/50 dark:bg-dark/20 border border-slate-100 dark:border-slate-800/50 rounded-xl space-y-3">
            <div className="flex items-center space-x-1.5 text-slate-400 dark:text-slate-500">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              <span className="text-[9px] font-bold uppercase tracking-wider">AI Inference Audit</span>
            </div>
            
            <div className="space-y-1.5 font-mono text-[9px] text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Confidence:</span>
                <span className="text-green-500 font-bold">Optimal</span>
              </div>
              <div className="flex justify-between">
                <span>Anomaly Shield:</span>
                <span className="text-secondary font-bold">Active</span>
              </div>
              <div className="flex justify-between">
                <span>Verification:</span>
                <span className="text-slate-650 dark:text-slate-300">Enterprise Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Network Topology Graphic at Bottom */}
      <div className="mt-6 border-t border-slate-50 dark:border-slate-800/40 pt-4 flex flex-col space-y-2">
        <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500 mb-2">
          <Network className="h-4 w-4 text-accent" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Global Topology Routes</span>
        </div>
        
        {/* SVG Network diagram */}
        <div className="h-20 bg-slate-50/50 dark:bg-dark/20 border border-slate-100 dark:border-slate-800/50 rounded-xl relative flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 350 150">
            {/* Draw connecting lines */}
            <motion.path
              d="M 50 80 H 180 V 50 M 50 80 H 180 V 120 M 180 50 H 300 V 80 M 180 120 H 300 V 80"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-slate-200 dark:text-slate-800/60"
            />
            {/* Glowing moving particles along lines */}
            <motion.circle
              cx="50"
              cy="80"
              r="3"
              fill="#0F62FE"
              animate={{ cx: [50, 180, 180, 300], cy: [80, 80, 50, 80] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
            <motion.circle
              cx="50"
              cy="80"
              r="3"
              fill="#00C2FF"
              animate={{ cx: [50, 180, 180, 300], cy: [80, 80, 120, 80] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: 2 }}
            />

            {/* Nodes */}
            {networkNodes.map((n, idx) => (
              <g key={idx}>
                <circle cx={n.x} cy={n.y} r="5" fill="#1e293b" className="stroke-2 stroke-secondary" />
                <text x={n.x} y={n.y - 10} textAnchor="middle" fill="currentColor" className="text-[8px] font-semibold text-slate-500 dark:text-slate-400 font-mono">
                  {n.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
};
export default HeroDashboard;
