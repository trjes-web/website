// FILE: client/src/pages/Exhibitions.tsx

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FloatingNav } from "@/components/FloatingNav";
import { ImageGallery } from "@/components/ImageGallery";
import type { Exhibition } from "@shared/schema";

export default function Exhibitions() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: exhibitions = [], isLoading } = useQuery<Exhibition[]>({
    queryKey: ["/api/exhibitions"],
    queryFn: async () => {
      const res = await fetch("/api/exhibitions");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const filteredExhibitions = useMemo(() => {
    if (!searchQuery.trim()) return exhibitions;
    const query = searchQuery.toLowerCase();
    return exhibitions.filter(ex => 
      ex.title.toLowerCase().includes(query) ||
      ex.description?.toLowerCase().includes(query) ||
      ex.date?.toLowerCase().includes(query) ||
      ex.location?.toLowerCase().includes(query)
    );
  }, [exhibitions, searchQuery]);

  return (
    <div className="min-h-screen p-8 flex flex-col relative">
      <FloatingNav />

      <header className="fixed top-4 left-4">
        <h1 className="text-xl font-bold font-sans lowercase border-b border-black inline-block">
          <a href="/" className="no-underline text-black hover:bg-black hover:text-white transition-colors">
            jesaja aljoscha trummer
          </a>
        </h1>
      </header>

      <main className="flex-1 mt-24 max-w-3xl mx-auto w-full">
        {exhibitions.length > 0 && (
          <div className="mb-8">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="search archive..."
              className="w-full max-w-xs border border-black p-2 font-mono text-sm focus:outline-none lowercase"
              data-testid="input-search-archive"
            />
          </div>
        )}

        {isLoading ? (
          <p className="font-mono text-xs lowercase">loading...</p>
        ) : filteredExhibitions.length === 0 ? (
          <p className="font-mono text-xs lowercase text-gray-500">
            {searchQuery ? "no results found." : "no archive entries yet."}
          </p>
        ) : (
          <div className="space-y-16">
            {filteredExhibitions.map((exhibition) => {
              const images = (exhibition.images as { url: string; caption?: string }[]) || [];
              const links = (exhibition.links as { url: string; text: string }[]) || [];
              return (
                <article key={exhibition.id} className="border-b border-black pb-12" data-testid={`exhibition-${exhibition.id}`}>
                  <div className="mb-6">
                    <h2 className="font-sans text-xl font-bold lowercase" data-testid={`text-title-${exhibition.id}`}>
                      {exhibition.title}
                    </h2>
                    {(exhibition.date || exhibition.location) && (
                      <p className="font-mono text-xs text-gray-600 lowercase" data-testid={`text-date-location-${exhibition.id}`}>
                        {exhibition.date}{exhibition.date && exhibition.location && " — "}{exhibition.location}
                      </p>
                    )}
                  </div>

                  {images.length > 0 && (
                    <ImageGallery images={images} title={exhibition.title} />
                  )}
                  
                  {exhibition.description && (
                    <div className="font-mono text-sm lowercase whitespace-pre-wrap leading-relaxed mb-4" data-testid={`text-description-${exhibition.id}`}>
                      {exhibition.description}
                    </div>
                  )}

                  {links.length > 0 && (
                    <div className="flex flex-wrap gap-4">
                      {links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs lowercase underline hover:no-underline inline-block"
                        >
                          {link.text || "link"} →
                        </a>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>

      <footer className="mt-16 font-mono text-[10px] lowercase text-center">
        <a href="/impressum" className="text-gray-400 hover:text-black">impressum / legal notice</a>
      </footer>
    </div>
  );
}
