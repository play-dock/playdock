import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getApprovedApps, type AppItem } from "@/lib/store";
import { seedDemoData } from "@/lib/seed";
import { Header } from "@/components/Header";
import { AppCard } from "@/components/AppCard";
import { Star, TrendingUp, Sparkles, Gamepad2, BookOpen, Wrench } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const CATEGORY_ICONS: Record<string, typeof Star> = {
  Apps: Sparkles,
  Games: Gamepad2,
  Education: BookOpen,
  Tools: Wrench,
};

function HomePage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    seedDemoData();
    setApps(getApprovedApps());
  }, []);

  const filtered = apps.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const topApps = [...apps].sort((a, b) => b.downloads - a.downloads).slice(0, 5);
  const topRated = [...apps].sort((a, b) => b.rating - a.rating).slice(0, 5);
  const categories = [...new Set(apps.map((a) => a.category))];

  const isSearching = search.length > 0;

  return (
    <div className="bg-background">
      <Header showSearch onSearchChange={setSearch} />

      {isSearching ? (
        <main className="space-y-2 px-4 py-4">
          {filtered.length === 0 ? (
            <p className="py-20 text-center text-sm text-muted-foreground">
              No apps match your search
            </p>
          ) : (
            filtered.map((app) => <AppCard key={app.id} {...app} />)
          )}
        </main>
      ) : (
        <main className="pb-4">
          {/* Categories chips */}
          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat] || Sparkles;
                return (
                  <Link
                    key={cat}
                    to="/categories"
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors active:bg-accent"
                  >
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    {cat}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Top Downloads */}
          {topApps.length > 0 && (
            <section className="mt-1">
              <div className="flex items-center gap-2 px-4 pb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">Top Downloads</h2>
              </div>
              <div className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-none">
                {topApps.map((app) => (
                  <FeaturedCard key={app.id} app={app} />
                ))}
              </div>
            </section>
          )}

          {/* Top Rated */}
          {topRated.length > 0 && (
            <section className="mt-2">
              <div className="flex items-center gap-2 px-4 pb-2">
                <Star className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">Top Rated</h2>
              </div>
              <div className="space-y-1 px-4">
                {topRated.map((app, i) => (
                  <RankedAppCard key={app.id} app={app} rank={i + 1} />
                ))}
              </div>
            </section>
          )}

          {/* All Apps */}
          {apps.length > 0 && (
            <section className="mt-4">
              <h2 className="px-4 pb-2 text-sm font-bold text-foreground">All Apps</h2>
              <div className="space-y-1 px-4">
                {apps.map((app) => (
                  <AppCard key={app.id} {...app} />
                ))}
              </div>
            </section>
          )}

          {apps.length === 0 && (
            <p className="py-20 text-center text-sm text-muted-foreground">
              No apps available yet
            </p>
          )}
        </main>
      )}
    </div>
  );
}

function FeaturedCard({ app }: { app: AppItem }) {
  const formatDownloads = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };

  return (
    <Link
      to="/app/$appId"
      params={{ appId: app.id }}
      className="flex w-[120px] shrink-0 flex-col items-center gap-2 rounded-xl bg-card p-3 transition-colors active:bg-accent"
    >
      <img
        src={app.iconURL || "/placeholder.svg"}
        alt={app.name}
        className="h-16 w-16 rounded-2xl bg-muted object-cover shadow-sm"
      />
      <div className="w-full text-center">
        <p className="truncate text-xs font-semibold text-card-foreground">{app.name}</p>
        <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
          <Star className="h-2.5 w-2.5 fill-primary text-primary" />
          <span>{app.rating > 0 ? app.rating.toFixed(1) : "—"}</span>
          <span>·</span>
          <span>{formatDownloads(app.downloads)}</span>
        </div>
      </div>
    </Link>
  );
}

function RankedAppCard({ app, rank }: { app: AppItem; rank: number }) {
  return (
    <Link
      to="/app/$appId"
      params={{ appId: app.id }}
      className="flex items-center gap-3 rounded-xl bg-card p-3 transition-colors active:bg-accent"
    >
      <span className="w-5 text-center text-sm font-bold text-muted-foreground">{rank}</span>
      <img
        src={app.iconURL || "/placeholder.svg"}
        alt={app.name}
        className="h-12 w-12 rounded-xl bg-muted object-cover"
      />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-card-foreground">{app.name}</h3>
        <p className="text-xs text-muted-foreground">{app.category}</p>
      </div>
      <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
        <Star className="h-3 w-3 fill-primary text-primary" />
        <span className="font-medium">{app.rating > 0 ? app.rating.toFixed(1) : "—"}</span>
      </div>
    </Link>
  );
}
