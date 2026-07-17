import React, { useState } from 'react';
import { cn } from '../../utils/cn';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, onFocus, onBlur, value, defaultValue, onChange, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [internalVal, setInternalVal] = useState((value || defaultValue || '') as string);

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setFocused(false);
      if (onBlur) onBlur(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInternalVal(e.target.value);
      if (onChange) onChange(e);
    };

    const isFloating = focused || internalVal.length > 0 || (props.placeholder && props.placeholder.length > 0);

    return (
      <div className="relative w-full mb-4">
        <textarea
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            'w-full px-4 py-3 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white transition-all outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 placeholder-slate-400 dark:placeholder-slate-600 min-h-[120px] resize-y',
            error && 'border-danger focus:border-danger focus:ring-danger/30',
            className
          )}
          {...props}
        />
        {label && (
          <label
            className={cn(
              'absolute left-4 top-3 text-slate-400 dark:text-slate-500 text-sm transition-all pointer-events-none origin-left',
              isFloating && 'top-1 text-xs text-secondary font-medium',
              error && isFloating && 'text-danger'
            )}
          >
            {label}
          </label>
        )}
        {error && (
          <p className="mt-1 text-xs text-danger font-medium">{error}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
