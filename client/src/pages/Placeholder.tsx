import { FloatingNav } from "@/components/FloatingNav";

interface PlaceholderProps {
  title: string;
}

export default function Placeholder({ title }: PlaceholderProps) {
  return (
    <div className="min-h-screen p-8 flex flex-col relative">
      <FloatingNav />
      
      <header className="fixed top-4 left-4">
        <h1 className="text-xl font-bold font-sans lowercase border-b border-black inline-block mb-2">
          <a href="/" className="no-underline text-black hover:bg-black hover:text-white transition-colors">jesaja aljoscha trummer</a>
        </h1>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center mt-20">
        <div className="border border-black p-8 max-w-2xl w-full min-h-[400px] bg-white relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="absolute -top-3 left-4 bg-white px-2 border border-black font-mono text-[10px] lowercase">
            {title.toLowerCase()}
          </div>
          
          <div className="font-mono space-y-4 text-sm lowercase">
            <p>content for: {title.toLowerCase()}</p>
            <p>----------------------------------------</p>
            {title === "CONTACT" && (
              <div className="space-y-2">
                <p>email: hello@artist.com</p>
                <p>instagram: @artist</p>
              </div>
            )}
            {title === "CV" && (
              <div className="space-y-2">
                <p>2026 - present: independent artist</p>
                <p>2024 - 2026: art school</p>
                <p>2022 - 2024: early works</p>
              </div>
            )}
            {title !== "CONTACT" && title !== "CV" && (
              <p>[ content under construction ]</p>
            )}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-4 left-0 right-0 font-mono text-[10px] lowercase text-center">
        <a href="/impressum" className="text-gray-400 hover:text-black">impressum / legal notice</a>
      </footer>
    </div>
  );
}
