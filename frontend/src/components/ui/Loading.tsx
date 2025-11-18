'use client';

import React from 'react';
import { Loader2, Wine } from 'lucide-react';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'wine' | 'luxury';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  fullScreen = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-body-sm',
    md: 'text-body-md',
    lg: 'text-body-lg',
    xl: 'text-heading-sm',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-ivory/80 backdrop-blur-sm'
    : 'flex items-center justify-center';

  const renderSpinner = () => (
    <Loader2 className={`${sizeClasses[size]} animate-spin text-burgundy`} />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`bg-burgundy rounded-full animate-pulse ${
            size === 'sm' ? 'h-2 w-2' : 
            size === 'md' ? 'h-3 w-3' : 
            size === 'lg' ? 'h-4 w-4' : 'h-6 w-6'
          }`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );

  const renderWine = () => (
    <div className="relative">
      <Wine className={`${sizeClasses[size]} text-burgundy animate-pulse`} />
      <div className="absolute inset-0 animate-ping">
        <Wine className={`${sizeClasses[size]} text-champagne opacity-30`} />
      </div>
    </div>
  );

  const renderLuxury = () => (
    <div className="relative">
      {/* Outer ring */}
      <div className={`${sizeClasses[size]} border-4 border-champagne/20 rounded-full animate-spin`}>
        <div className="absolute inset-0 border-4 border-transparent border-t-burgundy rounded-full animate-spin" 
             style={{ animationDuration: '1s' }} />
      </div>
      
      {/* Inner ring */}
      <div className={`absolute inset-2 border-2 border-champagne/40 rounded-full animate-spin`}
           style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}>
        <div className="absolute inset-0 border-2 border-transparent border-t-champagne rounded-full animate-spin"
             style={{ animationDuration: '1.5s' }} />
      </div>
      
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1 h-1 bg-burgundy rounded-full animate-pulse" />
      </div>
    </div>
  );

  const renderLoadingIndicator = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'wine':
        return renderWine();
      case 'luxury':
        return renderLuxury();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex flex-col items-center space-y-3">
        {renderLoadingIndicator()}
        
        {text && (
          <p className={`${textSizeClasses[size]} text-olive font-medium animate-pulse`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

// Skeleton Loading Component
export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1,
}) => {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-olive/20 via-olive/30 to-olive/20 bg-[length:200%_100%]';
  
  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded',
    circular: 'rounded-full',
    rounded: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]} ${
              i === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
            style={{ height: height || '1rem' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

// Loading Overlay Component
export interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  variant?: LoadingProps['variant'];
  children: React.ReactNode;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  text = 'Loading...',
  variant = 'luxury',
  children,
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-ivory/80 backdrop-blur-sm rounded-lg">
          <Loading variant={variant} text={text} size="lg" />
        </div>
      )}
    </div>
  );
};

// Page Loading Component
export const PageLoading: React.FC<{ text?: string }> = ({ 
  text = 'Loading luxury wines...' 
}) => (
  <Loading
    variant="luxury"
    size="xl"
    text={text}
    fullScreen
  />
);

export default Loading;