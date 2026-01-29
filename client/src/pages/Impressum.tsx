import { useQuery } from "@tanstack/react-query";
import { FloatingNav } from "@/components/FloatingNav";

export default function Impressum() {
  const { data: impressumData, isLoading } = useQuery<{ value: string | null }>({
    queryKey: ["/api/settings/impressumText"],
    queryFn: async () => {
      const res = await fetch("/api/settings/impressumText");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const impressumText = impressumData?.value || "impressum content will be added here.";

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

      <main className="flex-1 mt-24 max-w-2xl mx-auto w-full">
        <div className="font-mono text-xs uppercase mb-6">
          impressum / legal notice
        </div>

        {isLoading ? (
          <p className="font-mono text-xs lowercase">loading...</p>
        ) : (
          <div className="font-mono text-sm lowercase whitespace-pre-wrap leading-relaxed" data-testid="text-impressum">
            {impressumText}
          </div>
        )}
      </main>

      <footer className="mt-16 font-mono text-[10px] lowercase text-center">
        <a href="/" className="text-gray-400 hover:text-black">back to home</a>
      </footer>
    </div>
  );
}
