import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'timer' | 'ah' | 'grammar' | 'trivia';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl btn-tactile focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeStyles = {
    sm: 'h-9 px-3 text-xs gap-1.5 min-h-[36px]',
    md: 'h-11 px-4 text-sm gap-2 min-h-[44px]',
    lg: 'h-13 px-6 text-base font-semibold gap-2.5 min-h-[52px]',
    xl: 'h-16 px-8 text-lg font-bold gap-3 min-h-[64px]',
  };

  const variantStyles = {
    primary:
      'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-subtle focus-visible:ring-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200',
    secondary:
      'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-750',
    outline:
      'bg-transparent text-slate-800 border border-slate-300 hover:bg-slate-50 active:bg-slate-100 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800',
    danger:
      'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 active:bg-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
    timer:
      'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-subtle focus-visible:ring-emerald-600',
    ah:
      'bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800 shadow-subtle focus-visible:ring-amber-600',
    grammar:
      'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 shadow-subtle focus-visible:ring-purple-600',
    trivia:
      'bg-sky-600 text-white hover:bg-sky-700 active:bg-sky-800 shadow-subtle focus-visible:ring-sky-600',
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          fullWidth && 'w-full',
          className
        )
      )}
      disabled={disabled}
      {...props}
    >
      {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
