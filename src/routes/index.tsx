import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getApprovedApps, type AppItem } from "@/lib/store";
import { Header } from "@/components/Header";
import { AppCard } from "@/components/AppCard";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setApps(getApprovedApps());
  }, []);

  const filtered = apps.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Header showSearch onSearchChange={setSearch} />
      <main className="space-y-4 px-4 py-4">
        {filtered.length === 0 ? (
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
