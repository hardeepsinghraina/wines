'use client';

import React, { forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'luxury';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className = '',
      variant = 'default',
      padding = 'md',
      hover = false,
      interactive = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'rounded-lg transition-all duration-200',
      interactive && 'cursor-pointer',
    ];

    const variantClasses = {
      default: [
        'bg-ivory border border-olive/20 shadow-luxury',
      ],
      elevated: [
        'bg-ivory border border-champagne/30 shadow-luxury-lg',
      ],
      outlined: [
        'bg-transparent border-2 border-burgundy/20 hover:border-burgundy/40',
      ],
      glass: [
        'glass-effect border border-champagne/20',
      ],
      luxury: [
        'bg-gradient-to-br from-ivory to-ivory/80 border border-champagne/40',
        'shadow-gold-lg relative overflow-hidden',
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-champagne/5 before:to-transparent',
      ],
    };

    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    };

    const hoverClasses = hover ? [
      'hover:shadow-luxury-lg hover:-translate-y-1',
      variant === 'luxury' && 'hover:shadow-gold-lg',
    ] : [];

    const interactiveClasses = interactive ? [
      'hover:shadow-luxury-lg hover:-translate-y-1',
      'active:scale-98 active:shadow-luxury',
      'focus:outline-none focus:ring-2 focus:ring-burgundy focus:ring-offset-2 focus:ring-offset-ivory',
    ] : [];

    const classes = [
      ...baseClasses,
      ...variantClasses[variant],
      paddingClasses[padding],
      ...(hover ? hoverClasses : []),
      ...(interactive ? interactiveClasses : []),
      className,
    ].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        className={classes}
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? 'button' : undefined}
        {...props}
      >
        {children}
        
        {/* Luxury variant decorative elements */}
        {variant === 'luxury' && (
          <>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-champagne/10 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-burgundy/5 to-transparent rounded-tr-full" />
          </>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  divider?: boolean;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = '', divider = false, children, ...props }, ref) => {
    const classes = [
      'flex flex-col space-y-1.5',
      divider && 'pb-4 border-b border-olive/20',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className = '', as: Component = 'h3', children, ...props }, ref) => {
    const classes = [
      'font-display font-semibold text-heading-md text-charcoal leading-tight',
      className,
    ].join(' ');

    return (
      <Component ref={ref} className={classes} {...props}>
        {children}
      </Component>
    );
  }
);

CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className = '', children, ...props }, ref) => {
    const classes = [
      'text-body-sm text-olive leading-relaxed',
      className,
    ].join(' ');

    return (
      <p ref={ref} className={classes} {...props}>
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', children, ...props }, ref) => {
    const classes = ['flex-1', className].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  divider?: boolean;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = '', divider = false, children, ...props }, ref) => {
    const classes = [
      'flex items-center',
      divider && 'pt-4 border-t border-olive/20',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export default Card;