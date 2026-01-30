import { useQuery } from "@tanstack/react-query";
import { FloatingNav } from "@/components/FloatingNav";
import { EnvelopeParticles, useEnvelopeParticles } from "@/components/EnvelopeParticles";

export default function Contact() {
  const { particles, triggerParticles } = useEnvelopeParticles();

  const handleLinkHover = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    triggerParticles(centerX, centerY);
  };

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
      <EnvelopeParticles particles={particles} />

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
              className="underline hover:no-underline hover:text-[#FF00FF] transition-colors"
              data-testid="link-email"
              onMouseEnter={handleLinkHover}
            >
              {email}
            </a>
          </p>
          <p>
            <a
              href={`https://instagram.com/${instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline hover:text-[#FF00FF] transition-colors"
              data-testid="link-instagram"
              onMouseEnter={handleLinkHover}
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
