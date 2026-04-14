import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { getAppById, incrementDownloads, rateApp, getUserRating, type AppItem } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Download, ArrowLeft, Star, ChevronRight, Info, Shield, User, Phone } from "lucide-react";

export const Route = createFileRoute("/app/$appId")({
  component: AppDetailPage,
});

function AppDetailPage() {
  const { appId } = Route.useParams();
  const { user } = useAuth();
  const [app, setApp] = useState<AppItem | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const screenshotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const a = getAppById(appId);
    setApp(a);
    if (user) {
      setUserRating(getUserRating(appId, user.id));
    }
  }, [appId, user]);

  const handleDownload = () => {
    if (!app?.fileURL) return;
    incrementDownloads(appId);
    setApp((prev) => prev ? { ...prev, downloads: prev.downloads + 1 } : prev);
    window.open(app.fileURL, "_blank");
  };

  const handleRate = (stars: number) => {
    if (!user) return;
    rateApp(appId, user.id, stars);
    setUserRating(stars);
    setApp(getAppById(appId));
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

      {/* App header */}
      <div className="flex items-start gap-4 px-4 pb-4">
        <img
          src={app.iconURL || "/placeholder.svg"}
          alt={app.name}
          className="h-[72px] w-[72px] rounded-2xl bg-muted object-cover shadow-sm"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold leading-tight text-foreground">{app.name}</h1>
          <p className="mt-0.5 text-sm font-medium text-primary">{app.category}</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{app.createdByName || "Unknown Developer"}</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
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
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-center text-sm font-semibold text-primary-foreground shadow-sm transition-colors active:bg-primary/90 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
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

      {/* Rate this app */}
      <div className="mx-4 mt-2 rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">Rate this app</h2>
        {user ? (
          <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 transition-transform active:scale-110"
              >
                <Star
                  className={`h-7 w-7 ${
                    star <= (hoverRating || userRating)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
            {userRating > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                You rated {userRating}/5
              </span>
            )}
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">Sign in to rate this app</p>
        )}
      </div>

      {/* About section */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">About this app</h2>
          <Info className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {app.description || "No description provided."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            {app.category}
          </span>
        </div>
      </div>

      {/* Developer info */}
      <div className="mx-4 mt-4 rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">Developer</h2>
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span>{app.createdByName || "Unknown"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            <span>{app.createdByPhone || "—"}</span>
          </div>
        </div>
      </div>

      {/* Data safety */}
      <div className="mx-4 mt-3 rounded-xl border border-border p-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Data safety</h2>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Safety starts with understanding how developers collect and share your data.
        </p>
      </div>
    </div>
  );
}
