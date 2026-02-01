import { useState, useRef, useEffect } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  blurHash?: string;
  "data-testid"?: string;
}

export function LazyImage({ src, alt, className = "", style, blurHash, "data-testid": testId }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "100px" }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const placeholderStyle: React.CSSProperties = {
    backgroundColor: "#e5e5e5",
    filter: isLoaded ? "none" : "blur(20px)",
    transform: isLoaded ? "scale(1)" : "scale(1.1)",
    transition: "filter 0.3s, transform 0.3s",
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`} style={style}>
      <div className="absolute inset-0" style={placeholderStyle} />
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          className={`relative z-10 w-full h-full object-contain transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          loading="lazy"
          data-testid={testId}
        />
      )}
      {!isInView && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <span className="font-mono text-xs text-gray-400 lowercase">failed</span>
        </div>
      )}
    </div>
  );
}
