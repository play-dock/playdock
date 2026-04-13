import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { addApp, fileToDataURL } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { LoginPrompt } from "@/components/LoginPrompt";
import { Upload, ImagePlus, X } from "lucide-react";

const CATEGORIES = ["Apps", "Games", "Tools", "Education"];

export const Route = createFileRoute("/upload")({
  component: UploadPage,
});

function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Apps");
  const [fileURL, setFileURL] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState("");
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!user) return <><Header title="Upload" /><LoginPrompt message="Sign in to upload apps" /></>;

  const handleIcon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const preview = await fileToDataURL(file);
      setIconPreview(preview);
    }
  };

  const handleScreenshots = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...screenshotFiles, ...files].slice(0, 5);
    setScreenshotFiles(newFiles);
    const previews = await Promise.all(newFiles.map(fileToDataURL));
    setScreenshotPreviews(previews);
  };

  const removeScreenshot = (index: number) => {
    setScreenshotFiles((f) => f.filter((_, i) => i !== index));
    setScreenshotPreviews((p) => p.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    try {
      let iconURL = "";
      if (iconFile) {
        iconURL = await fileToDataURL(iconFile);
      }
      const screenshots = screenshotFiles.length > 0
        ? await Promise.all(screenshotFiles.map(fileToDataURL))
        : [];

      addApp({
        name: name.trim(),
        description: description.trim(),
        category,
        iconURL,
        screenshots,
        fileURL: fileURL.trim(),
        fileSize: fileSize || "varies",
        version: version || "1.0.0",
        createdBy: user.id,
        createdByName: user.name,
        createdByPhone: user.phone,
      });

      setSuccess(true);
      setName("");
      setDescription("");
      setIconFile(null);
      setIconPreview("");
      setScreenshotFiles([]);
      setScreenshotPreviews([]);
      setFileURL("");
      setFileSize("");
      setVersion("1.0.0");

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Header title="Upload App" />
      <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4">
        {success && (
          <div className="rounded-lg bg-accent p-3 text-center text-sm text-accent-foreground">
            ✅ App submitted! Waiting for admin approval.
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">App Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
            placeholder="Describe your app features, what it does..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Version</label>
            <input value={version} onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0.0"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Size</label>
            <input value={fileSize} onChange={(e) => setFileSize(e.target.value)}
              placeholder="12 MB"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">App Icon</label>
          {iconPreview && (
            <div className="mb-2">
              <img src={iconPreview} alt="Icon preview" className="h-16 w-16 rounded-xl object-cover" />
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleIcon}
            className="w-full text-sm text-muted-foreground file:mr-2 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:text-primary-foreground" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Screenshots (up to 5)</label>
          {screenshotPreviews.length > 0 && (
            <div className="mb-2 flex gap-2 overflow-x-auto pb-2">
              {screenshotPreviews.map((src, i) => (
                <div key={i} className="relative shrink-0">
                  <img src={src} alt={`Screenshot ${i + 1}`} className="h-28 w-16 rounded-lg object-cover" />
                  <button type="button" onClick={() => removeScreenshot(i)}
                    className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {screenshotPreviews.length < 5 && (
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-input p-3 text-sm text-muted-foreground">
              <ImagePlus className="h-4 w-4" />
              <span>Add screenshots</span>
              <input type="file" accept="image/*" multiple onChange={handleScreenshots} className="hidden" />
            </label>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Download URL (APK link)</label>
          <input value={fileURL} onChange={(e) => setFileURL(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <button type="submit" disabled={submitting || !name.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          <Upload className="h-4 w-4" />
          {submitting ? "Uploading..." : "Submit App"}
        </button>
      </form>
    </div>
  );
}
