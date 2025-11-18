'use client';

import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'luxury' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'inline-flex items-center justify-center font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ivory',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      'relative overflow-hidden',
    ];

    const variantClasses = {
      primary: [
        'bg-burgundy text-ivory hover:bg-burgundy-light',
        'focus:ring-burgundy shadow-luxury hover:shadow-luxury-lg',
        'active:bg-burgundy-dark active:scale-95',
      ],
      secondary: [
        'bg-champagne text-charcoal hover:bg-champagne-light',
        'focus:ring-champagne shadow-gold hover:shadow-gold-lg',
        'active:bg-champagne-dark active:scale-95',
      ],
      outline: [
        'border-2 border-burgundy text-burgundy bg-transparent hover:bg-burgundy hover:text-ivory',
        'focus:ring-burgundy',
        'active:scale-95',
      ],
      ghost: [
        'text-charcoal bg-transparent hover:bg-champagne/10 hover:text-burgundy',
        'focus:ring-champagne/50',
        'active:scale-95',
      ],
      luxury: [
        'bg-luxury-gradient text-ivory hover:opacity-90',
        'focus:ring-burgundy shadow-luxury-lg',
        'active:scale-95 relative overflow-hidden',
        'before:absolute before:inset-0 before:bg-white/10 before:opacity-0 before:transition-opacity',
        'hover:before:opacity-100',
      ],
      danger: [
        'bg-red-600 text-ivory hover:bg-red-700',
        'focus:ring-red-500 shadow-lg hover:shadow-xl',
        'active:bg-red-800 active:scale-95',
      ],
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-body-sm rounded-md gap-1.5',
      md: 'px-4 py-2 text-body-md rounded-lg gap-2',
      lg: 'px-6 py-3 text-body-lg rounded-lg gap-2',
      xl: 'px-8 py-4 text-heading-sm rounded-xl gap-3',
    };

    const widthClasses = fullWidth ? 'w-full' : '';

    const classes = [
      ...baseClasses,
      ...variantClasses[variant],
      sizeClasses[size],
      widthClasses,
      className,
    ].join(' ');

    const iconSize = {
      sm: 'h-4 w-4',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
      xl: 'h-6 w-6',
    };

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className={`${iconSize[size]} animate-spin`} />
        )}
        
        {!isLoading && leftIcon && (
          <span className={iconSize[size]}>{leftIcon}</span>
        )}
        
        {children && (
          <span className={isLoading ? 'opacity-0' : ''}>{children}</span>
        )}
        
        {!isLoading && rightIcon && (
          <span className={iconSize[size]}>{rightIcon}</span>
        )}

        {/* Luxury variant shimmer effect */}
        {variant === 'luxury' && (
          <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;