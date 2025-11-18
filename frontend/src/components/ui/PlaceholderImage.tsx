'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Wine, Package, User, ImageIcon } from 'lucide-react';

export type PlaceholderType = 'wine' | 'product' | 'avatar' | 'general';

interface PlaceholderImageProps {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  placeholderType?: PlaceholderType;
  onLoad?: () => void;
  onError?: () => void;
}

const PlaceholderIcon = ({ type, className }: { type: PlaceholderType; className?: string }) => {
  const iconProps = {
    className: cn('text-gray-400', className),
    strokeWidth: 1.5,
  };

  switch (type) {
    case 'wine':
      return <Wine {...iconProps} />;
    case 'product':
      return <Package {...iconProps} />;
    case 'avatar':
      return <User {...iconProps} />;
    default:
      return <ImageIcon {...iconProps} />;
  }
};

const getPlaceholderBackground = (type: PlaceholderType): string => {
  switch (type) {
    case 'wine':
      return 'bg-gradient-to-br from-purple-50 to-red-50';
    case 'product':
      return 'bg-gradient-to-br from-blue-50 to-indigo-50';
    case 'avatar':
      return 'bg-gradient-to-br from-gray-100 to-gray-200';
    default:
      return 'bg-gray-100';
  }
};

export function PlaceholderImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  placeholderType = 'general',
  onLoad,
  onError,
}: PlaceholderImageProps) {
  const [isLoading, setIsLoading] = useState(!!src);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Show placeholder if no src provided or if there's an error
  if (!src || hasError) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center',
          getPlaceholderBackground(placeholderType),
          'border border-gray-200',
          className
        )}
        style={!fill ? { width, height } : undefined}
      >
        <PlaceholderIcon 
          type={placeholderType} 
          className="w-8 h-8 md:w-12 md:h-12" 
        />
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && (
        <div className={cn(
          'absolute inset-0 animate-pulse',
          getPlaceholderBackground(placeholderType)
        )}>
          <div className="flex items-center justify-center h-full">
            <PlaceholderIcon 
              type={placeholderType} 
              className="w-6 h-6 animate-pulse" 
            />
          </div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

// Specialized wine image component
export function WineImage({
  src,
  alt,
  className,
  priority = false,
  width = 300,
  height = 600,
  fill = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  fill?: boolean;
}) {
  return (
    <PlaceholderImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={className}
      priority={priority}
      quality={90}
      sizes="(max-width: 768px) 150px, (max-width: 1200px) 250px, 300px"
      placeholder="blur"
      placeholderType="wine"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
    />
  );
}

// Avatar component with fallback
export function AvatarImage({
  src,
  alt,
  size = 40,
  className,
}: {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <PlaceholderImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full', className)}
      quality={90}
      placeholderType="avatar"
    />
  );
}

// Product image component
export function ProductImage({
  src,
  alt,
  className,
  priority = false,
  fill = false,
  width,
  height,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}) {
  return (
    <PlaceholderImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={className}
      priority={priority}
      quality={90}
      placeholderType="product"
      sizes={fill ? "100vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
    />
  );
}