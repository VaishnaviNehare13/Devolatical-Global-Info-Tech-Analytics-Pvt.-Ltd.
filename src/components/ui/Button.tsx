import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
    
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary/95 active:bg-primary/90 shadow-md hover:shadow-lg dark:bg-secondary dark:hover:bg-secondary/95',
      secondary: 'bg-secondary text-white hover:bg-secondary/95 active:bg-secondary/90 shadow-md hover:shadow-lg',
      outline: 'border border-primary text-primary hover:bg-primary/5 dark:border-secondary dark:text-secondary dark:hover:bg-secondary/5',
      ghost: 'text-primary hover:bg-primary/5 dark:text-secondary dark:hover:bg-secondary/5',
      danger: 'bg-danger text-white hover:bg-danger/95 active:bg-danger/90 shadow-md',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
