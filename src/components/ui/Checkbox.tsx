import React from 'react';
import { cn } from '../../utils/cn';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1.5">
        <label className="inline-flex items-start space-x-3 cursor-pointer select-none">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              'mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-800 text-secondary focus:ring-secondary/50 bg-white dark:bg-dark-card transition-colors cursor-pointer',
              className
            )}
            {...props}
          />
          {label && (
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {label}
            </span>
          )}
        </label>
        {error && (
          <p className="text-xs text-danger font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
