import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getAllApps, getAllUsers, approveApp, deleteApp, type AppItem, type UserProfile } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Check, Trash2, ArrowLeft, Users, Package, Phone, User } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const [apps, setApps] = useState<AppItem[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tab, setTab] = useState<"apps" | "users">("apps");

  useEffect(() => {
    if (isAdmin) {
      setApps(getAllApps());
      setUsers(getAllUsers());
    }
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

  const pendingApps = apps.filter((a) => a.status === "pending");
  const approvedApps = apps.filter((a) => a.status === "approved");

  return (
    <div>
      <Header title="Admin Panel" />
      <div className="px-4 py-4">
        <Link to="/profile" className="mb-4 flex items-center gap-1 text-sm text-primary">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        {/* Stats */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-card p-3 text-center">
            <p className="text-lg font-bold text-primary">{users.length}</p>
            <p className="text-[11px] text-muted-foreground">Users</p>
          </div>
          <div className="rounded-xl bg-card p-3 text-center">
            <p className="text-lg font-bold text-primary">{apps.length}</p>
            <p className="text-[11px] text-muted-foreground">Total Apps</p>
          </div>
          <div className="rounded-xl bg-card p-3 text-center">
            <p className="text-lg font-bold text-chart-5">{pendingApps.length}</p>
            <p className="text-[11px] text-muted-foreground">Pending</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setTab("apps")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === "apps" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}
          >
            <Package className="h-4 w-4" /> Apps ({apps.length})
          </button>
          <button
            onClick={() => setTab("users")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === "users" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}
          >
            <Users className="h-4 w-4" /> Users ({users.length})
          </button>
        </div>

        {tab === "apps" && (
          <>
            {apps.length === 0 ? (
              <p className="py-20 text-center text-sm text-muted-foreground">No apps submitted yet</p>
            ) : (
              <div className="space-y-2">
                {apps.map((app) => (
                  <div key={app.id} className="rounded-xl bg-card p-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={app.iconURL || "/placeholder.svg"}
                        alt={app.name}
                        className="h-12 w-12 rounded-xl bg-muted object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-card-foreground">{app.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {app.category} · v{app.version || "1.0"} · {app.fileSize || "—"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          <span className={app.status === "approved" ? "text-chart-2 font-medium" : "text-chart-5 font-medium"}>
                            {app.status === "approved" ? "✅ Approved" : "⏳ Pending"}
                          </span>
                          {" · "}{app.downloads} downloads
                        </p>
                        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{app.createdByName || "Unknown"}</span>
                          <span className="mx-0.5">·</span>
                          <Phone className="h-3 w-3" />
                          <span>{app.createdByPhone || "—"}</span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {new Date(app.createdAt).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1.5">
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
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "users" && (
          <>
            {users.length === 0 ? (
              <p className="py-20 text-center text-sm text-muted-foreground">No users registered</p>
            ) : (
              <div className="space-y-2">
                {users.map((u) => {
                  const userApps = apps.filter((a) => a.createdBy === u.id);
                  return (
                    <div key={u.id} className="rounded-xl bg-card p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-card-foreground">{u.name}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{u.phone}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"}`}>
                              {u.role}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {userApps.length} app{userApps.length !== 1 ? "s" : ""} published
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
