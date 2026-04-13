import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { getAppById, incrementDownloads, type AppItem } from "@/lib/store";
import { Header } from "@/components/Header";
import { Download, ArrowLeft, Star, ChevronRight, Info, Shield } from "lucide-react";

export const Route = createFileRoute("/app/$appId")({
  component: AppDetailPage,
});

function AppDetailPage() {
  const { appId } = Route.useParams();
  const [app, setApp] = useState<AppItem | null>(null);
  const screenshotsRef = useRef<HTMLDivElement>(null);

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

  const formatDownloads = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <div className="bg-background pb-24">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-background/95 px-4 py-3 backdrop-blur-sm">
        <Link to="/" className="rounded-full p-1 text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      {/* App header - Play Store style */}
      <div className="flex items-start gap-4 px-4 pb-4">
        <img
          src={app.iconURL || "/placeholder.svg"}
          alt={app.name}
          className="h-[72px] w-[72px] rounded-2xl bg-muted object-cover shadow-sm"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold leading-tight text-foreground">{app.name}</h1>
          <p className="mt-0.5 text-sm font-medium text-primary">{app.category}</p>
        </div>
      </div>

      {/* Stats row - Play Store style */}
      <div className="mx-4 flex items-center justify-around border-y border-border py-3">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-0.5 text-sm font-semibold text-foreground">
            {app.rating > 0 ? app.rating.toFixed(1) : "—"}
            <Star className="h-3 w-3 fill-foreground text-foreground" />
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Rating</p>
        </div>
        <div className="h-6 w-px bg-border" />
        <div className="flex flex-col items-center">
          <p className="text-sm font-semibold text-foreground">{formatDownloads(app.downloads)}+</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Downloads</p>
        </div>
        <div className="h-6 w-px bg-border" />
        <div className="flex flex-col items-center">
          <p className="text-sm font-semibold text-foreground">{app.fileSize || "—"}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Size</p>
        </div>
        <div className="h-6 w-px bg-border" />
        <div className="flex flex-col items-center">
          <p className="text-sm font-semibold text-foreground">{app.version || "1.0"}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Version</p>
        </div>
      </div>

      {/* Install button */}
      <div className="px-4 py-4">
        <button
          onClick={handleDownload}
          disabled={!app.fileURL}
          className="w-full rounded-lg bg-primary py-3 text-center text-sm font-semibold text-primary-foreground shadow-sm transition-colors active:bg-primary/90 disabled:opacity-50"
        >
          {app.fileURL ? "Install" : "Not available"}
        </button>
      </div>

      {/* Screenshots */}
      {app.screenshots && app.screenshots.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between px-4 pb-3">
            <h2 className="text-base font-semibold text-foreground">Screenshots</h2>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <div
            ref={screenshotsRef}
            className="flex gap-2 overflow-x-auto px-4 pb-4 scrollbar-none"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {app.screenshots.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${app.name} screenshot ${i + 1}`}
                className="h-[280px] w-[140px] shrink-0 rounded-xl bg-muted object-cover shadow-sm"
                style={{ scrollSnapAlign: "start" }}
              />
            ))}
          </div>
        </div>
      )}

      {/* About section */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">About this app</h2>
          <Info className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {app.description || "No description provided."}
        </p>

        {/* Category tag */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            {app.category}
          </span>
        </div>
      </div>

      {/* Data safety */}
      <div className="mx-4 mt-4 rounded-xl border border-border p-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Data safety</h2>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Safety starts with understanding how developers collect and share your data.
        </p>
      </div>
    </div>
  );
}
