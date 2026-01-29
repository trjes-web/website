import { useQuery } from "@tanstack/react-query";
import { FloatingNav } from "@/components/FloatingNav";

export default function Contact() {
  const { data: emailData } = useQuery<{ value: string | null }>({
    queryKey: ["/api/settings/contactEmail"],
    queryFn: async () => {
      const res = await fetch("/api/settings/contactEmail");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: instagramData } = useQuery<{ value: string | null }>({
    queryKey: ["/api/settings/contactInstagram"],
    queryFn: async () => {
      const res = await fetch("/api/settings/contactInstagram");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const email = emailData?.value || "jesaja.trummer@gmail.com";
  const instagram = instagramData?.value || "jesaja.trummer";

  return (
    <div className="min-h-screen p-8 flex flex-col relative">
      <FloatingNav />

      <header className="fixed top-4 left-4 z-10">
        <h1 className="text-xl font-bold font-sans lowercase border-b border-black inline-block">
          <a href="/" className="no-underline text-black hover:bg-black hover:text-white transition-colors">
            jesaja aljoscha trummer
          </a>
        </h1>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center relative z-10">
        <div className="font-mono text-sm lowercase space-y-4">
          <p>
            <a
              href={`mailto:${email}`}
              className="underline hover:no-underline"
              data-testid="link-email"
            >
              {email}
            </a>
          </p>
          <p>
            <a
              href={`https://instagram.com/${instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
              data-testid="link-instagram"
            >
              @{instagram.replace('@', '')}
            </a>
          </p>
        </div>
      </main>

      <footer className="fixed bottom-4 left-0 right-0 text-center">
        <a href="/impressum" className="font-mono text-[10px] text-gray-400 lowercase hover:text-black" data-testid="link-impressum">
          impressum / legal notice
        </a>
      </footer>
    </div>
  );
}
