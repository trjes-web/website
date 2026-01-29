import { useQuery } from "@tanstack/react-query";

interface CVPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CVPopup({ isOpen, onClose }: CVPopupProps) {
  const { data: cvData } = useQuery<{ value: string | null }>({
    queryKey: ["/api/settings/cvContent"],
    queryFn: async () => {
      const res = await fetch("/api/settings/cvContent");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isOpen,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />
      <div 
        className="relative bg-white border-2 border-black shadow-lg max-w-md w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col"
        style={{ minHeight: "400px" }}
      >
        <div className="flex justify-between items-center border-b-2 border-black p-3">
          <span className="font-mono text-xs uppercase">curriculum vitae</span>
          <button 
            onClick={onClose}
            className="font-mono text-xs px-2 py-1 hover:text-[#FF00FF]"
            data-testid="button-close-cv"
          >
            close
          </button>
        </div>
        <div 
          className="flex-1 overflow-y-auto p-6 font-mono text-sm"
          style={{ lineHeight: "1.6" }}
        >
          {cvData?.value ? (
            <div 
              className="cv-content"
              dangerouslySetInnerHTML={{ __html: cvData.value }}
            />
          ) : (
            <p className="text-gray-500 lowercase">no cv content yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
