import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface TimelineEvent {
  id: string | number;
  date: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ events, className }) => {
  return (
    <div className={cn('relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 md:ml-6 pl-6 space-y-8', className)}>
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="relative"
        >
          {/* Timeline Node */}
          <span className="absolute -left-[35px] top-1 flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-dark border-2 border-secondary text-secondary shadow-sm">
            {event.icon ? (
              event.icon
            ) : (
              <span className="w-2 h-2 rounded-full bg-secondary" />
            )}
          </span>
          
          {/* Content */}
          <div className="flex flex-col space-y-1 bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-800/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-xs font-semibold text-secondary dark:text-cyan-400 tracking-wider uppercase">
              {event.date}
            </span>
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {event.title}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {event.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
