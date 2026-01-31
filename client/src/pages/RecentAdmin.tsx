import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { RecentEntry } from "@shared/schema";

interface RecentImage {
  url: string;
  caption?: string;
}

export default function RecentAdmin() {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    images: [] as RecentImage[],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: entries = [], isLoading } = useQuery<RecentEntry[]>({
    queryKey: ["/api/recent"],
    queryFn: async () => {
      const res = await fetch("/api/recent?includeHidden=true");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const createEntry = useMutation({
    mutationFn: async (data: typeof formData & { displayOrder: number }) => {
      const res = await fetch("/api/recent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, password: adminPassword }),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recent"] });
      resetForm();
    },
  });

  const updateEntry = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const res = await fetch(`/api/recent/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, password: adminPassword }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recent"] });
      resetForm();
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/recent/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recent"] });
    },
  });

  const toggleVisibility = useMutation({
    mutationFn: async ({ id, visible }: { id: string; visible: boolean }) => {
      const res = await fetch(`/api/recent/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible, password: adminPassword }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recent"] });
    },
  });

  const reorderEntries = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const res = await fetch("/api/recent/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds, password: adminPassword }),
      });
      if (!res.ok) throw new Error("Failed to reorder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recent"] });
    },
  });

  const moveEntry = (index: number, direction: "up" | "down") => {
    const newList = [...entries];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newList.length) return;
    [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
    reorderEntries.mutate(newList.map(e => e.id));
  };

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
        setAdminPassword(password);
      } else {
        setAuthError("incorrect password");
      }
    } catch {
      setAuthError("connection error");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      images: [],
    });
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImages: RecentImage[] = [];

    for (const file of Array.from(files)) {
      try {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        const res = await fetch("/api/uploads/image", {
          method: "POST",
          body: formDataUpload,
        });
        if (res.ok) {
          const data = await res.json();
          newImages.push({ url: data.url, caption: "" });
        }
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const updateImageCaption = (index: number, caption: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, caption } : img
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateEntry.mutate({ id: editingId, data: formData });
    } else {
      createEntry.mutate({ ...formData, displayOrder: entries.length });
    }
  };

  const startEdit = (entry: RecentEntry) => {
    setEditingId(entry.id);
    setFormData({
      title: entry.title,
      description: entry.description || "",
      images: (entry.images as RecentImage[]) || [],
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-mono p-4">
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
          <h1 className="text-xl lowercase">recent admin</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            className="w-full border-2 border-black p-2 lowercase"
            data-testid="input-password"
          />
          {authError && <p className="text-red-600 text-sm">{authError}</p>}
          <button
            type="submit"
            className="w-full border-2 border-black p-2 lowercase hover:bg-black hover:text-white"
            data-testid="button-login"
          >
            login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-mono p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl lowercase">recent admin</h1>
          <a href="/admin" className="underline lowercase hover:opacity-60">back to admin</a>
        </div>

        <form onSubmit={handleSubmit} className="border-2 border-black p-4 mb-8 space-y-4">
          <h2 className="lowercase">{editingId ? "edit entry" : "add new entry"}</h2>
          
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="title"
            required
            className="w-full border-2 border-black p-2 lowercase"
            data-testid="input-title"
          />

          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="description (optional)"
            rows={3}
            className="w-full border-2 border-black p-2 lowercase"
            data-testid="input-description"
          />

          <div>
            <label className="block lowercase mb-2">images</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="w-full border-2 border-black p-2"
              data-testid="input-images"
            />
            {isUploading && <p className="text-sm mt-1">uploading...</p>}
          </div>

          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {formData.images.map((img, index) => (
                <div key={index} className="border border-black p-2">
                  <img src={img.url} alt="" className="w-full h-24 object-cover mb-2" />
                  <input
                    type="text"
                    value={img.caption || ""}
                    onChange={(e) => updateImageCaption(index, e.target.value)}
                    placeholder="caption"
                    className="w-full border border-black p-1 text-xs lowercase mb-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="text-xs lowercase text-red-600 hover:underline"
                  >
                    remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createEntry.isPending || updateEntry.isPending}
              className="border-2 border-black p-2 lowercase hover:bg-black hover:text-white disabled:opacity-50"
              data-testid="button-submit"
            >
              {editingId ? "update" : "create"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="border-2 border-black p-2 lowercase hover:bg-gray-100"
              >
                cancel
              </button>
            )}
          </div>
        </form>

        <div className="space-y-4">
          <h2 className="lowercase">entries ({entries.length})</h2>
          {isLoading && <p>loading...</p>}
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`border-2 border-black p-4 ${!entry.visible ? 'opacity-50' : ''}`}
              data-testid={`entry-${entry.id}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold lowercase">{entry.title}</h3>
                  {entry.description && (
                    <p className="text-sm text-gray-600 lowercase">{entry.description}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {(entry.images as RecentImage[])?.length || 0} images
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => moveEntry(index, "up")}
                    disabled={index === 0}
                    className="text-sm disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveEntry(index, "down")}
                    disabled={index === entries.length - 1}
                    className="text-sm disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => startEdit(entry)}
                  className="text-sm lowercase underline hover:opacity-60"
                >
                  edit
                </button>
                <button
                  onClick={() => toggleVisibility.mutate({ id: entry.id, visible: !entry.visible })}
                  className="text-sm lowercase underline hover:opacity-60"
                >
                  {entry.visible ? "hide" : "show"}
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this entry?")) {
                      deleteEntry.mutate(entry.id);
                    }
                  }}
                  className="text-sm lowercase underline text-red-600 hover:opacity-60"
                >
                  delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
