import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";

export function NewsletterSignup() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const subscribe = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/newsletter/subscribe", { email });
      return res.json();
    },
    onSuccess: () => {
      setStatus("success");
      setMessage(t("subscribe success"));
      setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    },
    onError: () => {
      setStatus("error");
      setMessage(t("already subscribed"));
      setTimeout(() => setStatus("idle"), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      subscribe.mutate(email.trim());
    }
  };

  return (
    <div className="border-t border-black pt-4 mt-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-wider">{t("newsletter")}</label>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("enter email")}
            className="flex-1 border border-black px-2 py-1 text-sm font-mono bg-transparent focus:outline-none"
            disabled={subscribe.isPending}
            data-testid="input-newsletter-email"
          />
          <button
            type="submit"
            disabled={subscribe.isPending || !email.trim()}
            className="border border-black px-3 py-1 text-sm font-mono hover:bg-black hover:text-white transition-colors disabled:opacity-50"
            data-testid="button-newsletter-subscribe"
          >
            {subscribe.isPending ? "..." : t("subscribe")}
          </button>
        </div>
        {status !== "idle" && (
          <span className={`text-xs ${status === "success" ? "text-green-600" : "text-red-600"}`}>
            {message}
          </span>
        )}
      </form>
    </div>
  );
}
