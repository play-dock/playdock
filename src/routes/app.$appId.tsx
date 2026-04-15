import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { getAppById, incrementDownloads, rateApp, getUserRating, getReviews, addReview, type AppItem, type AppReview } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import {
  Download, ArrowLeft, Star, ChevronRight, ChevronDown, ChevronUp,
  Info, Shield, User, Phone, Lock, Eye, Share2, MoreVert,
  CheckCircle2, AlertTriangle, Globe, Calendar, Package, Smartphone
} from "lucide-react";

export const Route = createFileRoute("/app/$appId")({
  component: AppDetailPage,
});

function AppDetailPage() {
  const { appId } = Route.useParams();
  const { user } = useAuth();
  const [app, setApp] = useState<AppItem | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviews, setReviews] = useState<AppReview[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showAllPerms, setShowAllPerms] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const screenshotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const a = getAppById(appId);
    setApp(a);
    setReviews(getReviews(appId));
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

  const handleSubmitReview = () => {
    if (!user || userRating === 0) return;
    addReview(appId, user.id, user.name, userRating, reviewText.trim());
    setReviews(getReviews(appId));
    setReviewText("");
    setApp(getAppById(appId));
  };

  if (!app) {
    return (
      <div>
        <div className="sticky top-0 z-10 flex items-center gap-3 bg-background/95 px-4 py-3 backdrop-blur-sm">
          <Link to="/" className="rounded-full p-1 text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
          <span className="text-sm font-medium text-foreground">App Details</span>
        </div>
        <div className="px-4 py-20 text-center">
          <p className="text-muted-foreground">App not found</p>
          <Link to="/" className="mt-2 inline-block text-sm text-primary">Go home</Link>
        </div>
      </div>
    );
  }

  const formatDownloads = (n: number) => {
    if (n >= 1000000000) return `${(n / 1000000000).toFixed(0)}B`;
    if (n >= 1000000) return `${(n / 1000000).toFixed(0)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const ratingBars = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.stars === star).length;
    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { star, count, pct };
  });

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const descriptionShort = app.description?.length > 200 ? app.description.slice(0, 200) + "..." : app.description;
  const displayPerms = showAllPerms ? (app.permissions || []) : (app.permissions || []).slice(0, 3);

  return (
    <div className="bg-background pb-24">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="rounded-full p-1 text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-full p-2 text-foreground active:bg-accent"><Share2 className="h-5 w-5" /></button>
          <button className="rounded-full p-2 text-foreground active:bg-accent"><MoreVert className="h-5 w-5" /></button>
        </div>
      </div>

      {/* App header */}
      <div className="flex items-start gap-4 px-4 pb-4">
        <img src={app.iconURL || "/placeholder.svg"} alt={app.name}
          className="h-[72px] w-[72px] rounded-2xl bg-muted object-cover shadow-sm" />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold leading-tight text-foreground">{app.name}</h1>
          <p className="mt-0.5 text-sm font-medium text-primary">{app.createdByName || app.category}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {app.containsAds && <span>Contains ads</span>}
            {app.inAppPurchases && <span>· In-app purchases</span>}
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
          <p className="mt-0.5 text-[10px] text-muted-foreground">{reviews.length} reviews</p>
        </div>
        <div className="h-6 w-px bg-border" />
        <div className="flex flex-col items-center">
          <p className="text-sm font-semibold text-foreground">{app.installs || formatDownloads(app.downloads) + "+"}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Downloads</p>
        </div>
        <div className="h-6 w-px bg-border" />
        <div className="flex flex-col items-center">
          <p className="text-sm font-semibold text-foreground">{app.contentRating || "Everyone"}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Rated for</p>
        </div>
        <div className="h-6 w-px bg-border" />
        <div className="flex flex-col items-center">
          <p className="text-sm font-semibold text-foreground">{app.fileSize || "—"}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Size</p>
        </div>
      </div>

      {/* Install button */}
      <div className="px-4 py-4">
        <button onClick={handleDownload} disabled={!app.fileURL}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-center text-sm font-semibold text-primary-foreground shadow-sm transition-colors active:bg-primary/90 disabled:opacity-50">
          <Download className="h-4 w-4" />
          {app.fileURL ? "Install" : "Not available"}
        </button>
      </div>

      {/* Screenshots */}
      {app.screenshots && app.screenshots.length > 0 && (
        <div className="mb-2">
          <div ref={screenshotsRef} className="flex gap-2 overflow-x-auto px-4 pb-4 scrollbar-none" style={{ scrollSnapType: "x mandatory" }}>
            {app.screenshots.map((src, i) => (
              <img key={i} src={src} alt={`${app.name} screenshot ${i + 1}`}
                className="h-[280px] w-[140px] shrink-0 rounded-xl bg-muted object-cover shadow-sm"
                style={{ scrollSnapAlign: "start" }} />
            ))}
          </div>
        </div>
      )}

      {/* About this app */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">About this app</h2>
          <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
        </div>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {showFullDesc ? app.description : descriptionShort}
        </p>
        {app.description?.length > 200 && (
          <button onClick={() => setShowFullDesc(!showFullDesc)} className="mt-1 text-sm font-medium text-primary">
            {showFullDesc ? "Show less" : "Read more"}
          </button>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{app.category}</span>
          {app.license && <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{app.license}</span>}
        </div>
      </div>

      {/* What's New */}
      {app.whatsNew && (
        <div className="px-4 py-3">
          <h2 className="text-base font-semibold text-foreground">What's new</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{app.whatsNew}</p>
          <p className="mt-1 text-xs text-muted-foreground">Updated on {formatDate(app.lastUpdated || app.createdAt)}</p>
        </div>
      )}

      {/* Data safety */}
      <div className="mx-4 mt-2 rounded-xl border border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Data safety</h2>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Safety starts with understanding how developers collect and share your data.
        </p>
        {app.dataSafety && (
          <div className="mt-3 space-y-3 rounded-lg border border-border p-3">
            <div className="flex items-start gap-2.5">
              <Share2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-foreground">Data shared</p>
                <p className="text-[11px] text-muted-foreground">{app.dataSafety.dataShared}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Eye className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-foreground">Data collected</p>
                <p className="text-[11px] text-muted-foreground">{app.dataSafety.dataCollected}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-foreground">Security practices</p>
                <p className="text-[11px] text-muted-foreground">{app.dataSafety.securityPractices}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ratings & Reviews */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Ratings & reviews</h2>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Rating summary */}
        <div className="mt-3 flex gap-6">
          <div className="flex flex-col items-center">
            <p className="text-5xl font-light text-foreground">{app.rating > 0 ? app.rating.toFixed(1) : "—"}</p>
            <div className="mt-1 flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-3 w-3 ${s <= Math.round(app.rating) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              ))}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{reviews.length} reviews</p>
          </div>
          <div className="flex-1 space-y-1">
            {ratingBars.map(({ star, pct }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="w-3 text-right text-xs text-muted-foreground">{star}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Write review */}
        {user ? (
          <div className="mt-4 rounded-xl border border-border p-3">
            <p className="text-xs font-medium text-foreground">Rate this app</p>
            <div className="mt-2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 transition-transform active:scale-110">
                  <Star className={`h-7 w-7 ${star <= (hoverRating || userRating) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
            {userRating > 0 && (
              <div className="mt-2">
                <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write your review (optional)..." rows={2}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                <button onClick={handleSubmitReview}
                  className="mt-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                  Submit Review
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">Sign in to rate and review this app</p>
        )}

        {/* Reviews list */}
        {reviews.length > 0 && (
          <div className="mt-4 space-y-3">
            {displayedReviews.map((review, i) => (
              <div key={i} className="rounded-xl border border-border p-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{review.userName}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(review.date)}</p>
                  </div>
                </div>
                <div className="mt-1.5 flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-3 w-3 ${s <= review.stars ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                  ))}
                </div>
                {review.comment && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{review.comment}</p>}
              </div>
            ))}
            {reviews.length > 3 && (
              <button onClick={() => setShowAllReviews(!showAllReviews)}
                className="flex items-center gap-1 text-sm font-medium text-primary">
                {showAllReviews ? "Show less" : `See all reviews (${reviews.length})`}
                {showAllReviews ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            )}
          </div>
        )}
      </div>

      {/* App Permissions */}
      {app.permissions && app.permissions.length > 0 && (
        <div className="mx-4 mt-2 rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">App permissions</h2>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-3 space-y-2">
            {displayPerms.map((perm, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-xs text-muted-foreground">{perm}</span>
              </div>
            ))}
          </div>
          {app.permissions.length > 3 && (
            <button onClick={() => setShowAllPerms(!showAllPerms)}
              className="mt-2 text-xs font-medium text-primary">
              {showAllPerms ? "Show less" : `See all ${app.permissions.length} permissions`}
            </button>
          )}
        </div>
      )}

      {/* App info */}
      <div className="mx-4 mt-3 rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">App info</h2>
        <div className="mt-3 space-y-3">
          <InfoRow icon={<Package className="h-4 w-4" />} label="Version" value={app.version || "1.0"} />
          <InfoRow icon={<Smartphone className="h-4 w-4" />} label="Requires Android" value={app.requiresAndroid || "Varies"} />
          <InfoRow icon={<Download className="h-4 w-4" />} label="Downloads" value={app.installs || formatDownloads(app.downloads) + "+"} />
          <InfoRow icon={<Calendar className="h-4 w-4" />} label="Released" value={formatDate(app.createdAt)} />
          <InfoRow icon={<Calendar className="h-4 w-4" />} label="Last updated" value={formatDate(app.lastUpdated || app.createdAt)} />
          <InfoRow icon={<Shield className="h-4 w-4" />} label="Content rating" value={app.contentRating || "Everyone"} />
          <InfoRow icon={<Info className="h-4 w-4" />} label="License" value={app.license || "Free"} />
          {app.privacyPolicyURL && (
            <div className="flex items-center gap-2.5">
              <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">Privacy policy</p>
                <a href={app.privacyPolicyURL} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary underline">{app.privacyPolicyURL.slice(0, 40)}...</a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Developer info */}
      <div className="mx-4 mt-3 rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">Developer contact</h2>
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <User className="h-4 w-4 shrink-0" />
            <span>{app.createdByName || "Unknown"}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <Phone className="h-4 w-4 shrink-0" />
            <span>{app.createdByPhone || "—"}</span>
          </div>
          {app.privacyPolicyURL && (
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <Globe className="h-4 w-4 shrink-0" />
              <a href={app.privacyPolicyURL} target="_blank" rel="noopener noreferrer" className="text-primary underline">Privacy policy</a>
            </div>
          )}
        </div>
      </div>

      {/* Similar apps placeholder */}
      <div className="px-4 py-4">
        <h2 className="text-base font-semibold text-foreground">Similar apps</h2>
        <p className="mt-2 text-xs text-muted-foreground">More apps like {app.name} coming soon</p>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-xs font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
