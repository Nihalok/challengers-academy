import React, { useState } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

/**
 * Optimized Image Component
 * - Appends Unsplash optimization parameters
 * - Handles lazy loading by default
 * - Provides WebP/AVIF support via URL params
 * - Implements simple blur-up or placeholder effect
 */
export default function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false, 
  className,
  imgClassName,
  ...props 
}: OptimizedImageProps & { imgClassName?: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, []);

  // Helper to optimize Unsplash URLs
  const getOptimizedUrl = (url: string) => {
    if (url.includes('images.unsplash.com')) {
      const separator = url.includes('?') ? '&' : '?';
      let optimized = `${url}${separator}auto=format,compress&q=80`;
      if (width) optimized += `&w=${width}`;
      if (height) optimized += `&h=${height}`;
      return optimized;
    }
    return url;
  };

  const optimizedSrc = getOptimizedUrl(src);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton / Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-espresso/5 animate-pulse" />
      )}
      
      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${imgClassName || ''}`}
        referrerPolicy="no-referrer"
        {...props}
      />
    </div>
  );
}
