import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'primary',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase';
  
  const variants = {
    primary: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300',
    secondary: 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-blue-200',
    accent: 'bg-accent/10 text-accent dark:bg-accent/20 dark:text-cyan-200',
    success: 'bg-success/10 text-success dark:bg-success/20 dark:text-green-300',
    warning: 'bg-warning/10 text-warning dark:bg-warning/20 dark:text-amber-300',
    danger: 'bg-danger/10 text-danger dark:bg-danger/20 dark:text-red-300',
    outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  );
};
