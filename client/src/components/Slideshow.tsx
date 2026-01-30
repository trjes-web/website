import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { SlideshowImage } from "@shared/schema";

export function Slideshow() {
  const [index, setIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: dbImages = [] } = useQuery<SlideshowImage[]>({
    queryKey: ["/api/slideshow"],
    queryFn: async () => {
      const res = await fetch("/api/slideshow");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

const images = dbImages.map(img => ({ url: img.imageUrl, altText: img.altText || "" }));

  useEffect(() => {
    if (images.length <= 1 || isExpanded) return;
    
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [images.length, isExpanded]);

  useEffect(() => {
    setIndex(0);
  }, [dbImages.length]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
      if (isExpanded) {
        if (e.key === "ArrowLeft") {
          setIndex((prev) => (prev - 1 + images.length) % images.length);
        } else if (e.key === "ArrowRight") {
          setIndex((prev) => (prev + 1) % images.length);
        }
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isExpanded, images.length]);

  if (images.length === 0) {
    return (
      <div className="relative w-full max-w-lg aspect-[4/3] overflow-hidden mx-auto bg-white flex items-center justify-center">
        <p className="font-mono text-xs lowercase text-gray-500">no images</p>
      </div>
    );
  }

  const currentAltText = images[index]?.altText;

  const goToPrev = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <>
      <div 
        className="relative w-full max-w-lg aspect-[4/3] overflow-hidden mx-auto bg-white cursor-pointer"
        onClick={() => setIsExpanded(true)}
        data-testid="slideshow-container"
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.img
            key={index}
            src={images[index].url}
            alt={currentAltText || `slide ${index + 1}`}
            className="absolute inset-0 w-full h-full object-contain"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ backgroundColor: "rgba(255, 255, 255, 0.92)" }}
            onClick={() => setIsExpanded(false)}
            data-testid="lightbox-overlay"
          >
            <div 
              className="flex flex-col items-center max-w-[90vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[index].url}
                alt={currentAltText || `slide ${index + 1}`}
                className="max-w-full max-h-[75vh] object-contain"
                data-testid="lightbox-image"
              />
              
              {currentAltText && (
                <div className="mt-4 font-mono text-sm lowercase text-gray-700 text-center">
                  {currentAltText}
                </div>
              )}

              <div className="mt-4 flex items-center gap-6 font-mono text-xs lowercase">
                {images.length > 1 && (
                  <button
                    onClick={goToPrev}
                    className="text-gray-400 hover:text-black"
                    data-testid="button-prev"
                  >
                    ← prev
                  </button>
                )}
                
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-400 hover:text-black"
                  data-testid="button-close-lightbox"
                >
                  back
                </button>

                {images.length > 1 && (
                  <button
                    onClick={goToNext}
                    className="text-gray-400 hover:text-black"
                    data-testid="button-next"
                  >
                    next →
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
