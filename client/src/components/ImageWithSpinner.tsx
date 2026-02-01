import { useState } from "react";

interface ImageWithSpinnerProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  "data-testid"?: string;
}

export function ImageWithSpinner({ src, alt, className = "", style, "data-testid": testId }: ImageWithSpinnerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full h-full">
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="font-mono text-xs text-gray-400 lowercase">failed to load</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={style}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        data-testid={testId}
      />
    </div>
  );
}
