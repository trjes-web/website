import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export function DynamicFavicon() {
  const { data: faviconData } = useQuery<{ value: string | null }>({
    queryKey: ["/api/settings/faviconUrl"],
    queryFn: async () => {
      const res = await fetch("/api/settings/faviconUrl");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (faviconData?.value) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = faviconData.value;
    }
  }, [faviconData?.value]);

  return null;
}
