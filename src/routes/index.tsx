import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Header } from "@/components/Header";
import { AppCard } from "@/components/AppCard";

interface AppItem {
  id: string;
  name: string;
  description: string;
  category: string;
  iconURL: string;
  fileURL: string;
  downloads: number;
}

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApps() {
      try {
        const q = query(
          collection(db, "apps"),
          where("status", "==", "approved"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setApps(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppItem)));
      } catch (err) {
        console.error("Error fetching apps:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, []);

  const filtered = apps.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Header showSearch onSearchChange={setSearch} />
      <main className="space-y-4 px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted-foreground">
            {search ? "No apps match your search" : "No apps available yet"}
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((app) => (
              <AppCard key={app.id} {...app} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
