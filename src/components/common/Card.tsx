import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'elevated' | 'outline' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all';

  const variantStyles = {
    default:
      'bg-white border border-slate-200/80 shadow-subtle dark:bg-slate-900 dark:border-slate-800',
    subtle:
      'bg-slate-50 border border-slate-200/60 dark:bg-slate-900/50 dark:border-slate-800/80',
    elevated:
      'bg-white border border-slate-200 shadow-card dark:bg-slate-900 dark:border-slate-800',
    outline:
      'bg-transparent border border-slate-200 dark:border-slate-800',
    interactive:
      'bg-white border border-slate-200/80 shadow-subtle hover:border-slate-300 hover:shadow-card active:scale-[0.99] cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={twMerge(
        clsx(baseStyles, variantStyles[variant], paddingStyles[padding], className)
      )}
      {...props}
    >
      {children}
    </div>
  );
};
