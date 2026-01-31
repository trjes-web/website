import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { SaySomething } from "@/components/SaySomething";
import type { RecentEntry } from "@shared/schema";

export default function Recent() {
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [saySomethingOpen, setSaySomethingOpen] = useState(false);

  const { data: entries = [] } = useQuery<RecentEntry[]>({
    queryKey: ["/api/recent"],
  });

  const currentEntry = entries[currentEntryIndex];
  const images = currentEntry?.images || [];
  const currentImage = images[currentImageIndex];

  const nextImage = () => {
    if (images.length === 0) return;
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else if (currentEntryIndex < entries.length - 1) {
      setCurrentEntryIndex(currentEntryIndex + 1);
      setCurrentImageIndex(0);
    }
  };

  const prevImage = () => {
    if (images.length === 0) return;
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else if (currentEntryIndex > 0) {
      setCurrentEntryIndex(currentEntryIndex - 1);
      const prevEntry = entries[currentEntryIndex - 1];
      const prevImages = prevEntry?.images || [];
      setCurrentImageIndex(Math.max(0, prevImages.length - 1));
    }
  };

  const totalImages = entries.reduce((sum, e) => sum + (e.images?.length || 0), 0);
  const currentGlobalIndex = entries.slice(0, currentEntryIndex).reduce((sum, e) => sum + (e.images?.length || 0), 0) + currentImageIndex + 1;

  if (entries.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-mono">
        <div className="text-center lowercase">
          <p className="text-gray-600 mb-4">no recent entries</p>
          <Link href="/" className="underline hover:opacity-60">back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-mono flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl aspect-[16/10] relative">
          {currentImage && (
            <img
              src={currentImage.url}
              alt={currentImage.caption || currentEntry?.title || ""}
              className="w-full h-full object-contain"
              loading="lazy"
              data-testid="recent-image"
            />
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={prevImage}
              disabled={currentEntryIndex === 0 && currentImageIndex === 0}
              className="text-xl hover:opacity-60 disabled:opacity-30 transition-opacity"
              data-testid="button-prev"
            >
              &lt;
            </button>
            <span className="text-sm lowercase" data-testid="image-counter">
              {currentGlobalIndex} / {totalImages}
            </span>
            <button
              onClick={nextImage}
              disabled={currentEntryIndex === entries.length - 1 && currentImageIndex === images.length - 1}
              className="text-xl hover:opacity-60 disabled:opacity-30 transition-opacity"
              data-testid="button-next"
            >
              &gt;
            </button>
          </div>

          <div className="flex items-center gap-6">
            {currentEntry && (
              <span className="text-sm lowercase text-gray-600" data-testid="entry-title">
                {currentEntry.title}
              </span>
            )}
            
            <button
              onClick={() => setSaySomethingOpen(!saySomethingOpen)}
              className="text-sm lowercase underline hover:opacity-60 transition-opacity"
              data-testid="button-say-something"
            >
              say something
            </button>

            <Link href="/" className="text-sm lowercase underline hover:opacity-60">
              home
            </Link>
          </div>
        </div>

        {currentImage?.caption && (
          <div className="max-w-6xl mx-auto mt-2">
            <p className="text-sm lowercase text-gray-600" data-testid="image-caption">
              {currentImage.caption}
            </p>
          </div>
        )}
      </div>

      <SaySomething 
        isOpen={saySomethingOpen} 
        onClose={() => setSaySomethingOpen(false)}
        imageUrl={currentImage?.url}
        imageCaption={currentImage?.caption}
        entryTitle={currentEntry?.title}
      />
    </div>
  );
}
