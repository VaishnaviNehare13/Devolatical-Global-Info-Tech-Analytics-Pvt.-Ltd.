import React from 'react';
import { motion } from 'framer-motion';

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
      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-secondary/5 dark:bg-accent/5 rounded-full filter blur-3xl" />
      
      {/* SVG Canvas */}
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
          strokeWidth="1"
          strokeDasharray="8 8"
          className="text-slate-200 dark:text-slate-800"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        />

        {/* Inner Grid Circle */}
        <motion.circle
          cx="250"
          cy="250"
          r="200"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-slate-300 dark:text-slate-700/60"
        />

        {/* Latitudes & Longitudes */}
        <path d="M 50 250 Q 250 150 450 250" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-800/80" />
        <path d="M 50 250 Q 250 350 450 250" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-800/80" />
        <path d="M 250 50 Q 150 250 250 450" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-800/80" />
        <path d="M 250 50 Q 350 250 250 450" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-800/80" />

        {/* Global Connection Paths */}
        <motion.path
          d="M 120 150 Q 200 80 280 110"
          fill="none"
          stroke="url(#accentGradient)"
          strokeWidth="2"
          strokeDasharray="100"
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.path
          d="M 180 220 Q 250 300 320 240"
          fill="none"
          stroke="url(#cyanGradient)"
          strokeWidth="2"
          strokeDasharray="100"
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        {/* Client locations / Pins */}
        {points.map((pt, idx) => (
          <g key={idx}>
            {/* Pulsing Outer Circle */}
            <motion.circle
              cx={pt.x}
              cy={pt.y}
              r="12"
              fill="currentColor"
              className="text-accent/30"
              initial={{ scale: 0.8, opacity: 0.3 }}
              animate={{ scale: [0.8, 1.8, 0.8], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: pt.delay }}
            />
            {/* Core Node */}
            <circle
              cx={pt.x}
              cy={pt.y}
              r="4"
              fill="#00C2FF"
              className="shadow-glow"
            />
          </g>
        ))}

        {/* Gradients */}
        <defs>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F62FE" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00C2FF" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00C2FF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0F62FE" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
