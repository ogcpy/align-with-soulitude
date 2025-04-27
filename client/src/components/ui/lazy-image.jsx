import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * LazyImage component for optimized image loading
 * @param {string} src - Image source URL
 * @param {string} alt - Alternative text
 * @param {string} className - CSS classes
 * @param {string} placeholderColor - Optional color for placeholder
 */
export function LazyImage({ 
  src, 
  alt, 
  className = "", 
  placeholderColor = "#f1f1f1",
  ...props 
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(false);

    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      if (isMounted) {
        setImageSrc(src);
        setIsLoading(false);
      }
    };
    
    img.onerror = () => {
      if (isMounted) {
        setError(true);
        setIsLoading(false);
      }
    };

    return () => {
      isMounted = false;
    };
  }, [src]);

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ backgroundColor: placeholderColor }}
        aria-label={`Loading ${alt}`}
      >
        <Loader2 className="h-8 w-8 animate-spin text-[#EAB69B]" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ backgroundColor: placeholderColor }}
        aria-label={`Failed to load ${alt}`}
      >
        <p className="text-sm text-gray-500">Image could not be loaded</p>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading="lazy"
      {...props}
    />
  );
}