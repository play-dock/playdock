import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getAllApps, approveApp, deleteApp, type AppItem } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Check, Trash2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const [apps, setApps] = useState<AppItem[]>([]);

  useEffect(() => {
    if (isAdmin) setApps(getAllApps());
  }, [isAdmin]);

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-20 text-center">
        <p className="text-muted-foreground">Access denied</p>
        <Link to="/" className="text-sm text-primary">Go home</Link>
      </div>
    );
  }

  const handleApprove = (id: string) => {
    approveApp(id);
    setApps(getAllApps());
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this app?")) return;
    deleteApp(id);
    setApps(getAllApps());
  };

  return (
    <div>
      <Header title="Admin Panel" />
      <div className="px-4 py-4">
        <Link to="/profile" className="mb-4 flex items-center gap-1 text-sm text-primary">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        {apps.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted-foreground">No apps</p>
        ) : (
          <div className="space-y-2">
            {apps.map((app) => (
              <div key={app.id} className="flex items-center justify-between rounded-xl bg-card p-3">
                <div>
                  <p className="text-sm font-semibold text-card-foreground">{app.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {app.category} · <span className={app.status === "approved" ? "text-chart-2" : "text-chart-5"}>{app.status}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  {app.status !== "approved" && (
                    <button onClick={() => handleApprove(app.id)} className="rounded-lg bg-accent p-2 text-accent-foreground">
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(app.id)} className="rounded-lg bg-destructive/10 p-2 text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
