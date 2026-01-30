import { useQuery } from "@tanstack/react-query";
import { FloatingNav } from "@/components/FloatingNav";
import { ImageGallery } from "@/components/ImageGallery";
import type { Project } from "@shared/schema";

export default function Projects() {
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

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
        {isLoading ? (
          <p className="font-mono text-xs lowercase">loading...</p>
        ) : projects.length === 0 ? (
          <p className="font-mono text-xs lowercase text-gray-500">no projects yet.</p>
        ) : (
          <div className="space-y-16">
            {projects.map((project) => {
              const images = (project.images as { url: string; caption?: string }[]) || [];
              return (
                <article key={project.id} className="border-b border-black pb-12" data-testid={`project-${project.id}`}>
                  <div className="mb-6">
                    <h2 className="font-sans text-xl font-bold lowercase" data-testid={`text-title-${project.id}`}>
                      {project.title}
                    </h2>
                    {project.date && (
                      <p className="font-mono text-xs text-gray-600 lowercase" data-testid={`text-date-${project.id}`}>
                        {project.date}
                      </p>
                    )}
                  </div>

                  {images.length > 0 && (
                    <ImageGallery images={images} title={project.title} />
                  )}
                  
                  {project.description && (
                    <div className="font-mono text-sm lowercase whitespace-pre-wrap leading-relaxed" data-testid={`text-description-${project.id}`}>
                      {project.description}
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
