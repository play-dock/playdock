import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Header } from "@/components/Header";
import { AppCard } from "@/components/AppCard";

const CATEGORIES = ["Apps", "Games", "Tools", "Education"] as const;

interface AppItem {
  id: string;
  name: string;
  category: string;
  iconURL: string;
  downloads: number;
}

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const [selected, setSelected] = useState<string>("Apps");
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const q = query(
          collection(db, "apps"),
          where("status", "==", "approved"),
          where("category", "==", selected)
        );
        const snap = await getDocs(q);
        setApps(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppItem)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
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
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : apps.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted-foreground">No apps in this category</p>
        ) : (
          apps.map((app) => <AppCard key={app.id} {...app} />)
        )}
      </main>
    </div>
  );
}
