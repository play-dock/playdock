import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getAppsByCategory, type AppItem } from "@/lib/store";
import { Header } from "@/components/Header";
import { AppCard } from "@/components/AppCard";

const CATEGORIES = ["Apps", "Games", "Tools", "Education"] as const;

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const [selected, setSelected] = useState<string>("Apps");
  const [apps, setApps] = useState<AppItem[]>([]);

  useEffect(() => {
    setApps(getAppsByCategory(selected));
  }, [selected]);

  return (
    <div>
      <Header title="Categories" />
      <div className="flex gap-2 overflow-x-auto px-4 py-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelected(cat)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selected === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <main className="space-y-2 px-4 pb-4">
        {apps.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted-foreground">No apps in this category</p>
        ) : (
          apps.map((app) => <AppCard key={app.id} {...app} />)
        )}
      </main>
    </div>
  );
}
