import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Project } from "@shared/schema";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface ProjectImage {
  url: string;
  caption?: string;
}

interface CustomLink {
  label: string;
  url: string;
}

export default function ProjectsAdmin() {
  const queryClient = useQueryClient();
  const { isAuthenticated, password: adminPassword, login, isLocked, requiresCode } = useAdminAuth();
  const [inputPassword, setInputPassword] = useState("");
  const [unlockCode, setUnlockCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    images: [] as ProjectImage[],
    date: "",
    customLinks: [] as CustomLink[],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const createProject = useMutation({
    mutationFn: async (data: typeof formData & { displayOrder: number }) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      resetForm();
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      resetForm();
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  const toggleVisibility = useMutation({
    mutationFn: async ({ id, visible }: { id: string; visible: boolean }) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  const reorderProjects = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const res = await fetch("/api/projects/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      if (!res.ok) throw new Error("Failed to reorder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  const moveEntry = (index: number, direction: "up" | "down") => {
    const newList = [...projects];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newList.length) return;
    [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
    reorderProjects.mutate(newList.map(p => p.id));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const result = await login(inputPassword, unlockCode || undefined);
    if (!result.success) {
      setAuthError(result.error || "incorrect password");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      images: [],
      date: "",
      customLinks: [],
    });
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/uploads/image", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Failed to upload file");
        const { url } = await uploadRes.json();

        setFormData(prev => ({
          ...prev,
          images: [...prev.images, { url, caption: "" }],
        }));
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const updateImageCaption = (index: number, caption: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? { ...img, caption } : img),
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...formData.images];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newImages.length) return;
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingId) {
      updateProject.mutate({ id: editingId, data: formData });
    } else {
      createProject.mutate({ ...formData, displayOrder: projects.length });
    }
  };

  const startEdit = (project: Project) => {
    setEditingId(project.id);
    const images = (project.images as ProjectImage[]) || [];
    const customLinks = (project.customLinks as CustomLink[]) || [];
    setFormData({
      title: project.title,
      description: project.description || "",
      images: images,
      date: project.date || "",
      customLinks: customLinks,
    });
  };

  const addCustomLink = () => {
    setFormData(prev => ({
      ...prev,
      customLinks: [...prev.customLinks, { label: "", url: "" }],
    }));
  };

  const updateCustomLink = (index: number, field: "label" | "url", value: string) => {
    setFormData(prev => ({
      ...prev,
      customLinks: prev.customLinks.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      ),
    }));
  };

  const removeCustomLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customLinks: prev.customLinks.filter((_, i) => i !== index),
    }));
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
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  className="w-full border border-black p-2 font-mono text-sm focus:outline-none"
                  autoFocus
                  data-testid="input-password"
                />
              </div>
              {requiresCode && (
                <div>
                  <label className="font-mono text-xs block mb-1 lowercase">unlock code:</label>
                  <input
                    type="text"
                    value={unlockCode}
                    onChange={(e) => setUnlockCode(e.target.value.toUpperCase())}
                    placeholder="XXXXXX"
                    className="w-full border border-black p-2 font-mono text-sm focus:outline-none uppercase"
                    data-testid="input-unlock-code"
                  />
                </div>
              )}
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
            {editingId ? "edit project" : "add new project"}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-xs block mb-1 lowercase">title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border border-black p-2 font-mono text-sm focus:outline-none"
                required
                data-testid="input-title"
              />
            </div>

            <div>
              <label className="font-mono text-xs block mb-1 lowercase">date</label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                placeholder="e.g. 2024"
                className="w-full border border-black p-2 font-mono text-sm focus:outline-none"
                data-testid="input-date"
              />
            </div>

            <div>
              <label className="font-mono text-xs block mb-1 lowercase">description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={5}
                className="w-full border border-black p-2 font-mono text-sm focus:outline-none resize-y"
                placeholder="write about this project..."
                data-testid="input-description"
              />
            </div>

            <div>
              <label className="font-mono text-xs block mb-1 lowercase">images (you can add multiple)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                disabled={isUploading}
                className="w-full border border-black p-2 font-mono text-sm focus:outline-none file:mr-4 file:py-1 file:px-2 file:border file:border-black file:bg-white file:font-mono file:text-xs file:lowercase file:cursor-pointer hover:file:bg-black hover:file:text-white disabled:opacity-50"
                data-testid="input-images"
              />
              {isUploading && <p className="font-mono text-xs lowercase mt-1">uploading...</p>}
              
              {formData.images.length > 0 && (
                <div className="mt-4 space-y-3">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="border border-gray-300 p-3">
                      <div className="flex gap-3 items-start">
                        <img src={img.url} alt="" className="w-20 h-20 object-cover border border-black flex-shrink-0" />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={img.caption || ""}
                            onChange={(e) => updateImageCaption(idx, e.target.value)}
                            placeholder="image caption (optional)"
                            className="w-full border border-black p-1 font-mono text-xs focus:outline-none mb-2"
                            data-testid={`input-caption-${idx}`}
                          />
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => moveImage(idx, "up")}
                              disabled={idx === 0}
                              className="border border-black px-2 py-0.5 text-xs font-mono hover:bg-black hover:text-white disabled:opacity-30"
                            >
                              up
                            </button>
                            <button
                              type="button"
                              onClick={() => moveImage(idx, "down")}
                              disabled={idx === formData.images.length - 1}
                              className="border border-black px-2 py-0.5 text-xs font-mono hover:bg-black hover:text-white disabled:opacity-30"
                            >
                              down
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="border border-red-600 text-red-600 px-2 py-0.5 text-xs font-mono hover:bg-red-600 hover:text-white"
                              data-testid={`button-remove-image-${idx}`}
                            >
                              remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="font-mono text-xs block mb-2 lowercase">custom links</label>
              <div className="space-y-2">
                {formData.customLinks.map((link, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => updateCustomLink(index, "label", e.target.value)}
                      placeholder="link name..."
                      className="flex-1 border border-black p-2 font-mono text-sm focus:outline-none"
                      data-testid={`input-link-label-${index}`}
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateCustomLink(index, "url", e.target.value)}
                      placeholder="https://..."
                      className="flex-1 border border-black p-2 font-mono text-sm focus:outline-none"
                      data-testid={`input-link-url-${index}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeCustomLink(index)}
                      className="border border-black px-3 py-2 font-mono text-sm hover:bg-red-500 hover:text-white hover:border-red-500"
                      data-testid={`button-remove-link-${index}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCustomLink}
                  className="border border-black px-3 py-2 font-mono text-xs lowercase hover:bg-black hover:text-white"
                  data-testid="button-add-link"
                >
                  + add link
                </button>
              </div>
              <p className="font-mono text-[10px] text-gray-500 mt-1">add links to pdfs, videos, or external documents</p>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createProject.isPending || updateProject.isPending}
                className="bg-black text-white px-4 py-2 font-mono text-sm lowercase hover:bg-gray-800 disabled:opacity-50"
                data-testid="button-submit-project"
              >
                {editingId ? "update" : "add project"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="border border-black px-4 py-2 font-mono text-sm lowercase hover:bg-black hover:text-white"
                  data-testid="button-cancel-edit"
                >
                  cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="border border-black p-6 w-full bg-white mb-8">
          <div className="font-mono text-xs uppercase mb-4 bg-black text-white inline-block px-2 py-1">
            existing projects ({projects.length})
          </div>

          {isLoading ? (
            <p className="font-mono text-xs lowercase">loading...</p>
          ) : projects.length === 0 ? (
            <p className="font-mono text-xs lowercase text-gray-500">no projects yet.</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project, index) => {
                const images = (project.images as ProjectImage[]) || [];
                const isVisible = project.visible !== false;
                return (
                  <div
                    key={project.id}
                    className={`border border-black p-4 ${!isVisible ? 'opacity-50 bg-gray-100' : ''}`}
                    data-testid={`project-item-${project.id}`}
                  >
                    <div className="flex gap-4 items-start">
                      {images.length > 0 && (
                        <img
                          src={images[0].url}
                          alt={project.title}
                          className="w-20 h-20 object-cover border border-black flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 font-mono text-xs lowercase">
                        <p className="font-bold mb-1">
                          {project.title}
                          {!isVisible && <span className="ml-2 text-gray-400">(hidden)</span>}
                        </p>
                        {project.date && <p className="text-gray-500">{project.date}</p>}
                        {images.length > 1 && <p className="text-gray-400 mt-1">{images.length} images</p>}
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <button
                            onClick={() => moveEntry(index, "up")}
                            disabled={index === 0 || reorderProjects.isPending}
                            className="border border-black px-2 py-1 hover:bg-black hover:text-white disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveEntry(index, "down")}
                            disabled={index === projects.length - 1 || reorderProjects.isPending}
                            className="border border-black px-2 py-1 hover:bg-black hover:text-white disabled:opacity-30"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => toggleVisibility.mutate({ id: project.id, visible: !isVisible })}
                            disabled={toggleVisibility.isPending}
                            className={`border px-2 py-1 ${isVisible ? 'border-gray-500 text-gray-500 hover:bg-gray-500' : 'border-green-600 text-green-600 hover:bg-green-600'} hover:text-white disabled:opacity-50`}
                          >
                            {isVisible ? 'hide' : 'show'}
                          </button>
                          <button
                            onClick={() => startEdit(project)}
                            className="border border-black px-2 py-1 hover:bg-black hover:text-white"
                            data-testid={`button-edit-${project.id}`}
                          >
                            edit
                          </button>
                          <button
                            onClick={() => deleteProject.mutate(project.id)}
                            disabled={deleteProject.isPending}
                            className="border border-red-600 text-red-600 px-2 py-1 hover:bg-red-600 hover:text-white disabled:opacity-50"
                            data-testid={`button-delete-${project.id}`}
                          >
                            delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <a href="/admin" className="font-mono text-xs lowercase underline hover:no-underline" data-testid="link-back-admin">
          back to main admin
        </a>
      </main>
    </div>
  );
}
