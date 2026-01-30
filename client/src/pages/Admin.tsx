import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SlideshowImage } from "@shared/schema";

export default function Admin() {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [portfolioSaved, setPortfolioSaved] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [contactInstagram, setContactInstagram] = useState("");
  const [contactSaved, setContactSaved] = useState(false);
  const [impressumText, setImpressumText] = useState("");
  const [impressumSaved, setImpressumSaved] = useState(false);
  const [cvContent, setCvContent] = useState("");
  const [cvSaved, setCvSaved] = useState(false);
  const [newsLine, setNewsLine] = useState("");
  const [newsSaved, setNewsSaved] = useState(false);
  const [enabledPages, setEnabledPages] = useState<string[]>(["portfolio", "cv", "projects", "contact", "archive"]);
  const [pagesSaved, setPagesSaved] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState("");
  const [faviconSaved, setFaviconSaved] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const allPages = [
    { id: "portfolio", label: "portfolio" },
    { id: "cv", label: "cv" },
    { id: "projects", label: "projects" },
    { id: "contact", label: "contact" },
    { id: "archive", label: "archive" },
  ];

  const { data: images = [], isLoading } = useQuery<SlideshowImage[]>({
    queryKey: ["/api/slideshow"],
    queryFn: async () => {
      const res = await fetch("/api/slideshow");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: analyticsData } = useQuery<{
    stats: { page: string; views: number }[];
    total: number;
    last7Days: number;
    last30Days: number;
  }>({
    queryKey: ["/api/analytics/stats"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/stats");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: portfolioData } = useQuery<{ value: string | null }>({
    queryKey: ["/api/settings/portfolioLink"],
    queryFn: async () => {
      const res = await fetch("/api/settings/portfolioLink");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: emailData } = useQuery<{ value: string | null }>({
    queryKey: ["/api/settings/contactEmail"],
    queryFn: async () => {
      const res = await fetch("/api/settings/contactEmail");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: instagramData } = useQuery<{ value: string | null }>({
    queryKey: ["/api/settings/contactInstagram"],
    queryFn: async () => {
      const res = await fetch("/api/settings/contactInstagram");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: impressumData } = useQuery<{ value: string | null }>({
    queryKey: ["/api/settings/impressumText"],
    queryFn: async () => {
      const res = await fetch("/api/settings/impressumText");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: cvData } = useQuery<{ value: string | null }>({
    queryKey: ["/api/settings/cvContent"],
    queryFn: async () => {
      const res = await fetch("/api/settings/cvContent");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: newsData } = useQuery<{ value: string | null }>({
    queryKey: ["/api/settings/newsLine"],
    queryFn: async () => {
      const res = await fetch("/api/settings/newsLine");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: enabledPagesData } = useQuery<{ value: string | null }>({
    queryKey: ["/api/settings/enabledPages"],
    queryFn: async () => {
      const res = await fetch("/api/settings/enabledPages");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: faviconData } = useQuery<{ value: string | null }>({
    queryKey: ["/api/settings/faviconUrl"],
    queryFn: async () => {
      const res = await fetch("/api/settings/faviconUrl");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (portfolioData?.value) {
      setPortfolioLink(portfolioData.value);
    }
  }, [portfolioData]);

  useEffect(() => {
    if (emailData?.value) {
      setContactEmail(emailData.value);
    }
  }, [emailData]);

  useEffect(() => {
    if (instagramData?.value) {
      setContactInstagram(instagramData.value);
    }
  }, [instagramData]);

  useEffect(() => {
    if (impressumData?.value) {
      setImpressumText(impressumData.value);
    }
  }, [impressumData]);

  useEffect(() => {
    if (cvData?.value) {
      setCvContent(cvData.value);
    }
  }, [cvData]);

  useEffect(() => {
    if (newsData?.value) {
      setNewsLine(newsData.value);
    }
  }, [newsData]);

  useEffect(() => {
    if (enabledPagesData?.value) {
      try {
        setEnabledPages(JSON.parse(enabledPagesData.value));
      } catch {
        setEnabledPages(["portfolio", "cv", "projects", "contact", "archive"]);
      }
    }
  }, [enabledPagesData]);

  useEffect(() => {
    if (faviconData?.value) {
      setFaviconUrl(faviconData.value);
    }
  }, [faviconData]);

  const savePortfolioLink = useMutation({
    mutationFn: async (value: string) => {
      const res = await fetch("/api/settings/portfolioLink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/portfolioLink"] });
      setPortfolioSaved(true);
      setTimeout(() => setPortfolioSaved(false), 2000);
    },
  });

  const saveContactSettings = useMutation({
    mutationFn: async () => {
      const emailRes = await fetch("/api/settings/contactEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: contactEmail }),
      });
      if (!emailRes.ok) throw new Error("Failed to save email");
      
      const igRes = await fetch("/api/settings/contactInstagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: contactInstagram }),
      });
      if (!igRes.ok) throw new Error("Failed to save instagram");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/contactEmail"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/contactInstagram"] });
      setContactSaved(true);
      setTimeout(() => setContactSaved(false), 2000);
    },
  });

  const saveImpressum = useMutation({
    mutationFn: async (value: string) => {
      const res = await fetch("/api/settings/impressumText", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/impressumText"] });
      setImpressumSaved(true);
      setTimeout(() => setImpressumSaved(false), 2000);
    },
  });

  const saveCvContent = useMutation({
    mutationFn: async (value: string) => {
      const res = await fetch("/api/settings/cvContent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/cvContent"] });
      setCvSaved(true);
      setTimeout(() => setCvSaved(false), 2000);
    },
  });

  const saveNewsLine = useMutation({
    mutationFn: async (value: string) => {
      const res = await fetch("/api/settings/newsLine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/newsLine"] });
      setNewsSaved(true);
      setTimeout(() => setNewsSaved(false), 2000);
    },
  });

  const saveEnabledPages = useMutation({
    mutationFn: async (pages: string[]) => {
      const res = await fetch("/api/settings/enabledPages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: JSON.stringify(pages) }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/enabledPages"] });
      setPagesSaved(true);
      setTimeout(() => setPagesSaved(false), 2000);
    },
  });

  const saveFavicon = useMutation({
    mutationFn: async (url: string) => {
      const res = await fetch("/api/settings/faviconUrl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: url }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/faviconUrl"] });
      setFaviconSaved(true);
      setTimeout(() => setFaviconSaved(false), 2000);
    },
  });

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFaviconUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/upload/url", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      
      setFaviconUrl(data.url);
      saveFavicon.mutate(data.url);
    } catch (error) {
      console.error("Favicon upload failed:", error);
    } finally {
      setFaviconUploading(false);
    }
  };

  const addImage = useMutation({
    mutationFn: async (data: { imageUrl: string; altText: string; displayOrder: number }) => {
      const res = await fetch("/api/slideshow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add image");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slideshow"] });
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  });

  const updateAltText = useMutation({
    mutationFn: async ({ id, altText }: { id: string; altText: string }) => {
      const res = await fetch(`/api/slideshow/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ altText }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slideshow"] });
    },
  });

  const deleteImage = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/slideshow/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slideshow"] });
    },
  });

  const reorderImages = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const res = await fetch("/api/slideshow/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      if (!res.ok) throw new Error("Failed to reorder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slideshow"] });
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        setAuthError("incorrect password");
      }
    } catch {
      setAuthError("connection error");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/uploads/image", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload file");
      const { url } = await uploadRes.json();

      addImage.mutate({
        imageUrl: url,
        altText: "",
        displayOrder: images.length,
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...images.map(img => img.id)];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    reorderImages.mutate(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === images.length - 1) return;
    const newOrder = [...images.map(img => img.id)];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    reorderImages.mutate(newOrder);
  };

  const handleSavePortfolioLink = (e: React.FormEvent) => {
    e.preventDefault();
    savePortfolioLink.mutate(portfolioLink);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen p-8 flex flex-col relative">
        <header className="fixed top-4 left-4">
          <a href="/" className="font-mono text-xs text-gray-400 hover:text-black no-underline">
            ← back
          </a>
        </header>

        <main className="flex-1 flex flex-col justify-center items-center">
          <div className="border border-black p-8 max-w-sm w-full bg-white">
            <div className="font-mono text-xs uppercase mb-6 bg-black text-white inline-block px-2 py-1">
              admin login
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="font-mono text-xs block mb-1 lowercase">password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-black p-2 font-mono text-sm focus:outline-none"
                  data-testid="input-password"
                  autoFocus
                />
              </div>
              {authError && (
                <p className="font-mono text-xs text-red-600 lowercase">{authError}</p>
              )}
              <button
                type="submit"
                className="bg-black text-white px-4 py-2 font-mono text-sm lowercase hover:bg-gray-800 w-full"
                data-testid="button-login"
              >
                enter
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 flex flex-col relative">
      <header className="fixed top-4 left-4">
        <a href="/" className="font-mono text-xs text-gray-400 hover:text-black no-underline">
          ← back
        </a>
      </header>

      <main className="flex-1 flex flex-col items-center mt-24 max-w-2xl mx-auto w-full">
        <div className="border border-black p-6 w-full bg-white mb-8">
          <div className="font-mono text-xs uppercase mb-4 bg-black text-white inline-block px-2 py-1">
            admin / external links
          </div>

          <form onSubmit={handleSavePortfolioLink} className="space-y-4">
            <div>
              <label className="font-mono text-xs block mb-1 lowercase">portfolio link (google drive):</label>
              <input
                type="url"
                value={portfolioLink}
                onChange={(e) => setPortfolioLink(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full border border-black p-2 font-mono text-sm focus:outline-none"
                data-testid="input-portfolio-link"
              />
            </div>
            <button
              type="submit"
              disabled={savePortfolioLink.isPending}
              className="bg-black text-white px-4 py-2 font-mono text-sm lowercase hover:bg-gray-800 disabled:opacity-50"
              data-testid="button-save-portfolio"
            >
              {savePortfolioLink.isPending ? "saving..." : portfolioSaved ? "saved!" : "save link"}
            </button>
          </form>
        </div>

        <div className="border border-black p-6 w-full bg-white mb-8">
          <div className="font-mono text-xs uppercase mb-4 bg-black text-white inline-block px-2 py-1">
            admin / news line
          </div>

          <form onSubmit={(e) => { e.preventDefault(); saveNewsLine.mutate(newsLine); }} className="space-y-4">
            <div>
              <label className="font-mono text-xs block mb-1 lowercase">news text (shown on homepage):</label>
              <input
                type="text"
                value={newsLine}
                onChange={(e) => setNewsLine(e.target.value)}
                placeholder="latest news or announcement..."
                className="w-full border border-black p-2 font-mono text-sm focus:outline-none"
                data-testid="input-news-line"
              />
            </div>
            <button
              type="submit"
              disabled={saveNewsLine.isPending}
              className="bg-black text-white px-4 py-2 font-mono text-sm lowercase hover:bg-gray-800 disabled:opacity-50"
              data-testid="button-save-news"
            >
              {saveNewsLine.isPending ? "saving..." : newsSaved ? "saved!" : "save news"}
            </button>
          </form>
        </div>

        <div className="border border-black p-6 w-full bg-white mb-8">
          <div className="font-mono text-xs uppercase mb-4 bg-black text-white inline-block px-2 py-1">
            admin / navigation pages
          </div>

          <div className="space-y-2 mb-4">
            {allPages.map((page) => (
              <label key={page.id} className="flex items-center gap-2 font-mono text-sm lowercase cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabledPages.includes(page.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setEnabledPages([...enabledPages, page.id]);
                    } else {
                      setEnabledPages(enabledPages.filter(p => p !== page.id));
                    }
                  }}
                  className="w-4 h-4 border border-black"
                  data-testid={`checkbox-page-${page.id}`}
                />
                {page.label}
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={() => saveEnabledPages.mutate(enabledPages)}
            disabled={saveEnabledPages.isPending}
            className="bg-black text-white px-4 py-2 font-mono text-sm lowercase hover:bg-gray-800 disabled:opacity-50"
            data-testid="button-save-pages"
          >
            {saveEnabledPages.isPending ? "saving..." : pagesSaved ? "saved!" : "save pages"}
          </button>
        </div>

        <div className="border border-black p-6 w-full bg-white mb-8">
          <div className="font-mono text-xs uppercase mb-4 bg-black text-white inline-block px-2 py-1">
            admin / favicon
          </div>

          <div className="space-y-4">
            <p className="font-mono text-xs lowercase text-gray-600">
              upload a favicon image (.ico, .png, or .svg - recommended size: 32x32 or 64x64)
            </p>
            
            {faviconUrl && (
              <div className="flex items-center gap-4">
                <img 
                  src={faviconUrl} 
                  alt="Current favicon" 
                  className="w-8 h-8 border border-black"
                  style={{ imageRendering: "pixelated" }}
                />
                <span className="font-mono text-xs lowercase text-gray-600">current favicon</span>
              </div>
            )}

            <div className="flex gap-2">
              <input
                ref={faviconInputRef}
                type="file"
                accept=".ico,.png,.svg,image/x-icon,image/png,image/svg+xml"
                onChange={handleFaviconUpload}
                className="hidden"
                data-testid="input-favicon-file"
              />
              <button
                type="button"
                onClick={() => faviconInputRef.current?.click()}
                disabled={faviconUploading}
                className="bg-black text-white px-4 py-2 font-mono text-sm lowercase hover:bg-gray-800 disabled:opacity-50"
                data-testid="button-upload-favicon"
              >
                {faviconUploading ? "uploading..." : faviconSaved ? "saved!" : "upload favicon"}
              </button>
            </div>

            <div>
              <label className="font-mono text-xs block mb-1 lowercase">or paste favicon url:</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={faviconUrl}
                  onChange={(e) => setFaviconUrl(e.target.value)}
                  placeholder="https://example.com/favicon.ico"
                  className="flex-1 border border-black p-2 font-mono text-sm focus:outline-none"
                  data-testid="input-favicon-url"
                />
                <button
                  type="button"
                  onClick={() => saveFavicon.mutate(faviconUrl)}
                  disabled={saveFavicon.isPending || !faviconUrl}
                  className="bg-black text-white px-4 py-2 font-mono text-sm lowercase hover:bg-gray-800 disabled:opacity-50"
                  data-testid="button-save-favicon-url"
                >
                  save
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-black p-6 w-full bg-white mb-8">
          <div className="font-mono text-xs uppercase mb-4 bg-black text-white inline-block px-2 py-1">
            admin / contact info
          </div>

          <form onSubmit={(e) => { e.preventDefault(); saveContactSettings.mutate(); }} className="space-y-4">
            <div>
              <label className="font-mono text-xs block mb-1 lowercase">email:</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="jesaja.trummer@gmail.com"
                className="w-full border border-black p-2 font-mono text-sm focus:outline-none"
                data-testid="input-contact-email"
              />
            </div>
            <div>
              <label className="font-mono text-xs block mb-1 lowercase">instagram handle:</label>
              <input
                type="text"
                value={contactInstagram}
                onChange={(e) => setContactInstagram(e.target.value)}
                placeholder="jesaja.trummer"
                className="w-full border border-black p-2 font-mono text-sm focus:outline-none"
                data-testid="input-contact-instagram"
              />
            </div>
            <button
              type="submit"
              disabled={saveContactSettings.isPending}
              className="bg-black text-white px-4 py-2 font-mono text-sm lowercase hover:bg-gray-800 disabled:opacity-50"
              data-testid="button-save-contact"
            >
              {saveContactSettings.isPending ? "saving..." : contactSaved ? "saved!" : "save contact info"}
            </button>
          </form>
        </div>

        <div className="border border-black p-6 w-full bg-white mb-8">
          <div className="font-mono text-xs uppercase mb-4 bg-black text-white inline-block px-2 py-1">
            admin / cv
          </div>
          <p className="font-mono text-xs lowercase mb-4 text-gray-600">
            edit your curriculum vitae. use html for formatting: &lt;b&gt;bold&lt;/b&gt;, &lt;u&gt;underline&lt;/u&gt;, &lt;span class="serif"&gt;serif font&lt;/span&gt;
          </p>
          <form onSubmit={(e) => { e.preventDefault(); saveCvContent.mutate(cvContent); }} className="space-y-4">
            <div>
              <label className="font-mono text-xs block mb-1 lowercase">cv content (html):</label>
              <textarea
                value={cvContent}
                onChange={(e) => setCvContent(e.target.value)}
                rows={15}
                placeholder="<b>education</b>&#10;2020-2024 — university of arts&#10;&#10;<b>exhibitions</b>&#10;2024 — solo show, gallery xyz"
                className="w-full border border-black p-2 font-mono text-sm focus:outline-none resize-y"
                data-testid="input-cv-content"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saveCvContent.isPending}
                className="bg-black text-white px-4 py-2 font-mono text-sm lowercase hover:bg-gray-800 disabled:opacity-50"
                data-testid="button-save-cv"
              >
                {saveCvContent.isPending ? "saving..." : cvSaved ? "saved!" : "save cv"}
              </button>
            </div>
            {cvContent && (
              <div className="border border-gray-300 p-4 mt-4">
                <div className="font-mono text-xs lowercase mb-2 text-gray-600">preview:</div>
                <div className="cv-content font-mono text-sm" dangerouslySetInnerHTML={{ __html: cvContent }} />
              </div>
            )}
          </form>
        </div>

        <div className="border border-black p-6 w-full bg-white mb-8">
          <div className="font-mono text-xs uppercase mb-4 bg-black text-white inline-block px-2 py-1">
            admin / impressum
          </div>

          <form onSubmit={(e) => { e.preventDefault(); saveImpressum.mutate(impressumText); }} className="space-y-4">
            <div>
              <label className="font-mono text-xs block mb-1 lowercase">impressum / legal notice text:</label>
              <textarea
                value={impressumText}
                onChange={(e) => setImpressumText(e.target.value)}
                rows={10}
                placeholder="enter your impressum / legal notice text here..."
                className="w-full border border-black p-2 font-mono text-sm focus:outline-none resize-y"
                data-testid="input-impressum-text"
              />
            </div>
            <button
              type="submit"
              disabled={saveImpressum.isPending}
              className="bg-black text-white px-4 py-2 font-mono text-sm lowercase hover:bg-gray-800 disabled:opacity-50"
              data-testid="button-save-impressum"
            >
              {saveImpressum.isPending ? "saving..." : impressumSaved ? "saved!" : "save impressum"}
            </button>
          </form>
        </div>

        <div className="border border-black p-6 w-full bg-white mb-8">
          <div className="font-mono text-xs uppercase mb-4 bg-black text-white inline-block px-2 py-1">
            admin / analytics
          </div>
          <p className="font-mono text-xs lowercase mb-4 text-gray-600">
            anonymous page view statistics (only tracked when visitors accept cookies)
          </p>
          {analyticsData && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="border border-black p-3">
                  <div className="font-mono text-2xl">{analyticsData.total}</div>
                  <div className="font-mono text-xs lowercase text-gray-600">total views</div>
                </div>
                <div className="border border-black p-3">
                  <div className="font-mono text-2xl">{analyticsData.last7Days}</div>
                  <div className="font-mono text-xs lowercase text-gray-600">last 7 days</div>
                </div>
                <div className="border border-black p-3">
                  <div className="font-mono text-2xl">{analyticsData.last30Days}</div>
                  <div className="font-mono text-xs lowercase text-gray-600">last 30 days</div>
                </div>
              </div>
              {analyticsData.stats.length > 0 && (
                <div>
                  <div className="font-mono text-xs lowercase mb-2">views by page:</div>
                  <div className="border border-black">
                    {analyticsData.stats.map((stat, i) => (
                      <div key={stat.page} className={`flex justify-between p-2 font-mono text-sm ${i !== analyticsData.stats.length - 1 ? 'border-b border-black' : ''}`}>
                        <span className="lowercase">{stat.page}</span>
                        <span>{stat.views}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border border-black p-6 w-full bg-white mb-8">
          <div className="font-mono text-xs uppercase mb-4 bg-black text-white inline-block px-2 py-1">
            admin / slideshow manager
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <label className="font-mono text-xs block mb-1 lowercase">upload image:</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="w-full border border-black p-2 font-mono text-sm focus:outline-none file:mr-4 file:py-1 file:px-2 file:border file:border-black file:bg-white file:font-mono file:text-xs file:lowercase file:cursor-pointer hover:file:bg-black hover:file:text-white disabled:opacity-50"
                data-testid="input-file-upload"
              />
            </div>
            {isUploading && (
              <p className="font-mono text-xs lowercase">uploading...</p>
            )}
            {uploadError && (
              <p className="font-mono text-xs text-red-600 lowercase">{uploadError}</p>
            )}
                      </div>

          <div className="font-mono text-xs mb-4 lowercase">
            images ({images.length}):
          </div>

          {isLoading ? (
            <p className="font-mono text-xs lowercase">loading...</p>
          ) : images.length === 0 ? (
            <p className="font-mono text-xs lowercase text-gray-500">no images yet. upload one above.</p>
          ) : (
            <div className="space-y-4">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="border border-black p-4 flex gap-4 items-start"
                  data-testid={`image-item-${image.id}`}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.altText || "artwork"}
                    className="w-24 h-24 object-cover border border-black"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect fill='%23eee' width='96' height='96'/%3E%3Ctext x='48' y='48' text-anchor='middle' dy='.3em' font-family='monospace' font-size='10'%3Eerror%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div className="flex-1 font-mono text-xs lowercase">
                    <div className="mb-2">
                      <label className="text-gray-500 block mb-1">description:</label>
                      <input
                        type="text"
                        defaultValue={image.altText || ""}
                        placeholder="enter description..."
                        onBlur={(e) => {
                          if (e.target.value !== image.altText) {
                            updateAltText.mutate({ id: image.id, altText: e.target.value });
                          }
                        }}
                        className="w-full border border-black p-1 font-mono text-xs focus:outline-none"
                        data-testid={`input-alt-${image.id}`}
                      />
                    </div>
                    <p className="text-gray-500">position: {index + 1}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0 || reorderImages.isPending}
                        className="border border-black px-2 py-1 hover:bg-black hover:text-white disabled:opacity-30"
                        data-testid={`button-move-up-${image.id}`}
                      >
                        up
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === images.length - 1 || reorderImages.isPending}
                        className="border border-black px-2 py-1 hover:bg-black hover:text-white disabled:opacity-30"
                        data-testid={`button-move-down-${image.id}`}
                      >
                        down
                      </button>
                      <button
                        onClick={() => deleteImage.mutate(image.id)}
                        disabled={deleteImage.isPending}
                        className="border border-red-600 text-red-600 px-2 py-1 hover:bg-red-600 hover:text-white disabled:opacity-50"
                        data-testid={`button-delete-${image.id}`}
                      >
                        delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <a href="/admin/archive" className="border border-black p-4 w-full bg-white mb-8 block hover:bg-black hover:text-white transition-colors">
          <div className="font-mono text-xs uppercase">
            manage archive →
          </div>
          <p className="font-mono text-xs lowercase mt-1 opacity-70">
            add, edit, and delete archive entries
          </p>
        </a>

        <a href="/admin/projects" className="border border-black p-4 w-full bg-white mb-8 block hover:bg-black hover:text-white transition-colors">
          <div className="font-mono text-xs uppercase">
            manage projects →
          </div>
          <p className="font-mono text-xs lowercase mt-1 opacity-70">
            add, edit, and delete project entries
          </p>
        </a>
      </main>
    </div>
  );
}
