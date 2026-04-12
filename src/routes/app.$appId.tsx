import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getAppById, incrementDownloads, type AppItem } from "@/lib/store";
import { Header } from "@/components/Header";
import { Download, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/app/$appId")({
  component: AppDetailPage,
});

function AppDetailPage() {
  const { appId } = Route.useParams();
  const [app, setApp] = useState<AppItem | null>(null);

  useEffect(() => {
    setApp(getAppById(appId));
  }, [appId]);

  const handleDownload = () => {
    if (!app?.fileURL) return;
    incrementDownloads(appId);
    setApp((prev) => prev ? { ...prev, downloads: prev.downloads + 1 } : prev);
    window.open(app.fileURL, "_blank");
  };

  if (!app) {
    return (
      <div>
        <Header title="App Details" />
        <div className="px-4 py-20 text-center">
          <p className="text-muted-foreground">App not found</p>
          <Link to="/" className="mt-2 inline-block text-sm text-primary">Go home</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="" />
      <div className="px-4 py-4">
        <Link to="/" className="mb-4 flex items-center gap-1 text-sm text-primary">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="flex items-start gap-4">
          <img src={app.iconURL || "/placeholder.svg"} alt={app.name} className="h-20 w-20 rounded-2xl bg-muted object-cover" />
          <div>
            <h1 className="text-lg font-bold text-foreground">{app.name}</h1>
            <p className="text-sm text-muted-foreground">{app.category}</p>
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <Download className="h-3.5 w-3.5" />
              <span>{app.downloads.toLocaleString()} downloads</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={!app.fileURL}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {app.fileURL ? "Download" : "No file available"}
        </button>

        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-foreground">About this app</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{app.description || "No description provided."}</p>
        </div>
      </div>
    </div>
  );
}
