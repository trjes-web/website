import { FloatingNav } from "@/components/FloatingNav";
import { Slideshow } from "@/components/Slideshow";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  const { data: newsData } = useQuery<{ value: string | null }>({
    queryKey: ["/api/settings/newsLine"],
    queryFn: async () => {
      const res = await fetch("/api/settings/newsLine");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const newsLine = newsData?.value || "";

  return (
    <div className="min-h-screen p-8 flex flex-col justify-center relative">
      <FloatingNav />
      
      <header className="fixed top-4 left-4">
        <h1 className="text-xl font-bold font-sans lowercase border-b border-black inline-block">
          jesaja aljoscha trummer
        </h1>
        {newsLine && (
          <p className="font-sans text-base lowercase mt-4">
            {newsLine}
          </p>
        )}
      </header>

      <main className="w-full flex-1 flex flex-col justify-center items-center mt-32">
        <Slideshow />
      </main>

      <footer className="fixed bottom-4 left-0 right-0 font-mono text-[10px] lowercase text-center">
        <a href="/impressum" className="text-gray-400 hover:text-black">{t("impressum")}</a>
      </footer>
    </div>
  );
}
