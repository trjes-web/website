import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SaySomethingProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  imageCaption?: string;
  entryTitle?: string;
}

export function SaySomething({ isOpen, onClose, imageUrl, imageCaption, entryTitle }: SaySomethingProps) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const sendMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/contact/message", { 
        name, 
        message,
        imageUrl: imageUrl || "",
        imageCaption: imageCaption || "",
        entryTitle: entryTitle || "",
      });
    },
    onSuccess: () => {
      toast({ title: "message sent" });
      setName("");
      setMessage("");
      onClose();
    },
    onError: () => {
      toast({ title: "failed to send", variant: "destructive" });
    },
  });

  if (!isOpen) return null;

  return (
    <div 
      className="fixed bottom-16 right-4 z-50 font-mono"
      onClick={(e) => e.stopPropagation()}
      data-testid="say-something-popup"
    >
      <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] max-w-xs">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm lowercase">say something</span>
          <button 
            onClick={onClose}
            className="text-black hover:opacity-60 text-lg leading-none"
            data-testid="close-say-something"
          >
            x
          </button>
        </div>

        {entryTitle && (
          <p className="text-xs text-gray-500 mb-2 lowercase">
            about: {entryTitle}
          </p>
        )}
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim() && message.trim()) {
              sendMutation.mutate();
            }
          }}
          className="space-y-3"
        >
          <input
            type="text"
            placeholder="your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border-2 border-black p-2 text-sm font-mono focus:outline-none lowercase"
            data-testid="input-name"
          />
          <textarea
            placeholder="your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={3}
            className="w-full border-2 border-black p-2 text-sm font-mono focus:outline-none lowercase resize-none"
            data-testid="input-message"
          />
          <button
            type="submit"
            disabled={sendMutation.isPending || !name.trim() || !message.trim()}
            className="w-full border-2 border-black p-2 text-sm font-mono lowercase hover:bg-black hover:text-white transition-colors disabled:opacity-50"
            data-testid="button-send"
          >
            {sendMutation.isPending ? "sending..." : "send"}
          </button>
        </form>
      </div>
    </div>
  );
}
