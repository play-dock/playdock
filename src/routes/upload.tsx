import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { addApp, fileToDataURL } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { LoginPrompt } from "@/components/LoginPrompt";
import { Upload } from "lucide-react";

const CATEGORIES = ["Apps", "Games", "Tools", "Education"];

export const Route = createFileRoute("/upload")({
  component: UploadPage,
});

function UploadPage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Apps");
  const [fileURL, setFileURL] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!user) return <><Header title="Upload" /><LoginPrompt message="Sign in to upload apps" /></>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      let iconURL = "";
      if (iconFile) {
        iconURL = await fileToDataURL(iconFile);
      }

      addApp({
        name: name.trim(),
        description: description.trim(),
        category,
        iconURL,
        fileURL,
        createdBy: user.id,
      });

      setSuccess(true);
      setName("");
      setDescription("");
      setIconFile(null);
      setFileURL("");
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
          <label className="mb-1 block text-sm font-medium text-foreground">App Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">App Icon</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setIconFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-muted-foreground file:mr-2 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:text-primary-foreground"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Download URL (APK link or website)</label>
          <input
            value={fileURL}
            onChange={(e) => setFileURL(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {submitting ? "Uploading..." : "Submit App"}
        </button>
      </form>
    </div>
  );
}
