import { useState, useEffect } from "react";

interface GalleryImage {
  url: string;
  caption?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [images.length]);

  if (images.length === 0) return null;

  const goToPrev = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="mb-6">
      <img
        src={images[index].url}
        alt={images[index].caption || title}
        className="w-full max-h-[70vh] object-contain mx-auto"
        loading="lazy"
      />
      
      {images[index].caption && (
        <p className="font-mono text-[11px] text-gray-500 mt-2 lowercase italic text-center">
          {images[index].caption}
        </p>
      )}

      {images.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-6 font-mono text-xs lowercase">
          <button onClick={goToPrev} className="text-gray-400 hover:text-black">
            ← prev
          </button>
          <span className="text-gray-400">{index + 1}/{images.length}</span>
          <button onClick={goToNext} className="text-gray-400 hover:text-black">
            next →
          </button>
        </div>
      )}
    </div>
  );
}
