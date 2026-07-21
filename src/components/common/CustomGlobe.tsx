import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, Cloud, Activity } from 'lucide-react';

export const CustomGlobe: React.FC = () => {
  // Generate random connecting dots and lines
  const points = [
    { x: 120, y: 150, delay: 0 },
    { x: 280, y: 110, delay: 0.5 },
    { x: 180, y: 220, delay: 0.8 },
    { x: 320, y: 240, delay: 1.2 },
    { x: 90, y: 280, delay: 1.5 },
    { x: 400, y: 180, delay: 2.0 }
  ];

  return (
    <div className="relative w-full max-w-[500px] aspect-square mx-auto flex items-center justify-center">
      {/* Ambient Radial Glows */}
      <div className="absolute inset-0 bg-gradient-to-tr from-secondary/10 via-transparent to-accent/10 rounded-full filter blur-3xl pointer-events-none" />
      
      {/* Floating Metric Card 1: Top Left */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-4 -left-14 z-25 p-3.5 bg-white/80 dark:bg-dark-card/85 backdrop-blur-md border border-slate-100 dark:border-slate-800/80 rounded-xl shadow-lg flex items-center space-x-3 w-40 text-left pointer-events-none"
      >
        <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
          <Cpu className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">AI Inference</p>
          <h4 className="text-sm font-bold text-slate-850 dark:text-white font-mono leading-tight">Optimal Speed</h4>
        </div>
      </motion.div>

      {/* Floating Metric Card 2: Top Right */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-12 -right-16 z-25 p-3.5 bg-white/80 dark:bg-dark-card/85 backdrop-blur-md border border-slate-100 dark:border-slate-800/80 rounded-xl shadow-lg flex items-center space-x-3 w-44 text-left pointer-events-none"
      >
        <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
          <Cloud className="h-4 w-4 animate-pulse" />
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Systems Health</p>
          <h4 className="text-sm font-bold text-slate-850 dark:text-white font-mono leading-tight">Systems Active</h4>
        </div>
      </motion.div>

      {/* Floating Metric Card 3: Bottom Left */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute bottom-16 -left-16 z-25 p-3.5 bg-white/80 dark:bg-dark-card/85 backdrop-blur-md border border-slate-100 dark:border-slate-800/80 rounded-xl shadow-lg flex items-center space-x-3 w-40 text-left pointer-events-none"
      >
        <div className="p-2 bg-accent/10 text-accent rounded-lg">
          <Activity className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Throughput</p>
          <h4 className="text-sm font-bold text-slate-850 dark:text-white font-mono leading-tight">High Stream</h4>
        </div>
      </motion.div>

      {/* Floating Metric Card 4: Bottom Right */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute bottom-6 -right-12 z-25 p-3.5 bg-white/80 dark:bg-dark-card/85 backdrop-blur-md border border-slate-100 dark:border-slate-800/80 rounded-xl shadow-lg flex items-center space-x-3 w-44 text-left pointer-events-none"
      >
        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Intrusion Shield</p>
          <h4 className="text-sm font-bold text-slate-850 dark:text-white font-mono leading-tight">Zero-Trust</h4>
        </div>
      </motion.div>

      {/* SVG Canvas for Globe */}
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full relative z-10"
      >
        {/* Spinning Outer Ring */}
        <motion.circle
          cx="250"
          cy="250"
          r="230"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="8 12"
          className="text-slate-200 dark:text-slate-800"
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        />

        {/* Inner Grid Circle */}
        <motion.circle
          cx="250"
          cy="250"
          r="200"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-slate-300 dark:text-slate-800/80"
        />

        {/* Latitudes & Longitudes */}
        <path d="M 50 250 Q 250 120 450 250" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-800/60" />
        <path d="M 50 250 Q 250 380 450 250" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-800/60" />
        <path d="M 250 50 Q 120 250 250 450" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-800/60" />
        <path d="M 250 50 Q 380 250 250 450" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-800/60" />

        {/* Center horizontal and vertical axes */}
        <line x1="50" y1="250" x2="450" y2="250" stroke="currentColor" strokeWidth="0.8" className="text-slate-100 dark:text-slate-900" />
        <line x1="250" y1="50" x2="250" y2="450" stroke="currentColor" strokeWidth="0.8" className="text-slate-100 dark:text-slate-900" />

        {/* Global Connection Paths */}
        <motion.path
          d="M 120 150 Q 200 80 280 110"
          fill="none"
          stroke="url(#accentGradient)"
          strokeWidth="2.5"
          strokeDasharray="100"
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: [100, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.path
          d="M 180 220 Q 250 300 320 240"
          fill="none"
          stroke="url(#cyanGradient)"
          strokeWidth="2.5"
          strokeDasharray="100"
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: [100, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        <motion.path
          d="M 90 280 Q 230 380 400 180"
          fill="none"
          stroke="url(#accentGradient)"
          strokeWidth="1.5"
          strokeDasharray="120"
          initial={{ strokeDashoffset: 120 }}
          animate={{ strokeDashoffset: [120, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        {/* Client locations / Pins */}
        {points.map((pt, idx) => (
          <g key={idx}>
            <motion.circle
              cx={pt.x}
              cy={pt.y}
              r="14"
              fill="currentColor"
              className="text-secondary/20 dark:text-accent/25"
              initial={{ scale: 0.8, opacity: 0.3 }}
              animate={{ scale: [0.8, 1.8, 0.8], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: pt.delay }}
            />
            <circle
              cx={pt.x}
              cy={pt.y}
              r="4.5"
              fill="#00C2FF"
            />
          </g>
        ))}

        {/* Gradients */}
        <defs>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F62FE" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#00C2FF" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00C2FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0F62FE" stopOpacity="0.15" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
export default CustomGlobe;
