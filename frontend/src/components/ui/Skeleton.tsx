'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className = '',
  width,
  height,
  variant = 'rectangular',
  animation = 'pulse'
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200';
  
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded',
    circular: 'rounded-full'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse', // Could implement wave animation with CSS
    none: ''
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}

// Specialized skeleton components for common use cases
export function TextSkeleton({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height="1rem"
          width={index === lines - 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  );
}

export function ProductCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`border rounded-lg p-4 space-y-4 ${className}`}>
      {/* Product Image */}
      <Skeleton variant="rectangular" height="200px" className="w-full" />
      
      {/* Product Title */}
      <Skeleton variant="text" height="1.5rem" width="80%" />
      
      {/* Product Description */}
      <TextSkeleton lines={2} />
      
      {/* Price */}
      <Skeleton variant="text" height="1.25rem" width="40%" />
      
      {/* Button */}
      <Skeleton variant="rectangular" height="2.5rem" className="w-full" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 6, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${className}`}>
      {/* Product Images */}
      <div className="space-y-4">
        <Skeleton variant="rectangular" height="400px" className="w-full" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="rectangular" height="80px" className="w-full" />
          ))}
        </div>
      </div>
      
      {/* Product Info */}
      <div className="space-y-6">
        <Skeleton variant="text" height="2rem" width="90%" />
        <TextSkeleton lines={3} />
        <Skeleton variant="text" height="1.5rem" width="30%" />
        <div className="space-y-2">
          <Skeleton variant="rectangular" height="3rem" className="w-full" />
          <Skeleton variant="rectangular" height="3rem" className="w-full" />
        </div>
        <TextSkeleton lines={4} />
      </div>
    </div>
  );
}

export function CartItemSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-4 p-4 border-b ${className}`}>
      <Skeleton variant="rectangular" width="80px" height="80px" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" height="1.25rem" width="70%" />
        <Skeleton variant="text" height="1rem" width="40%" />
        <Skeleton variant="text" height="1rem" width="30%" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="rectangular" width="80px" height="2rem" />
        <Skeleton variant="text" height="1rem" width="60px" />
      </div>
    </div>
  );
}

export function UserProfileSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profile Header */}
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" width="80px" height="80px" />
        <div className="space-y-2">
          <Skeleton variant="text" height="1.5rem" width="200px" />
          <Skeleton variant="text" height="1rem" width="150px" />
        </div>
      </div>
      
      {/* Profile Sections */}
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton variant="text" height="1.25rem" width="150px" />
          <div className="space-y-2">
            <TextSkeleton lines={2} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}: { 
  rows?: number; 
  columns?: number; 
  className?: string; 
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Table Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} variant="text" height="1.25rem" width="80%" />
        ))}
      </div>
      
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" height="1rem" width="90%" />
          ))}
        </div>
      ))}
    </div>
  );
}