import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { LoginPrompt, LogoutButton } from "@/components/LoginPrompt";
import { Shield, User } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div>
        <Header title="Profile" />
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <Header title="Profile" />
        <LoginPrompt />
      </div>
    );
  }

  return (
    <div>
      <Header title="Profile" />
      <div className="space-y-4 px-4 py-4">
        <div className="flex items-center gap-4 rounded-xl bg-card p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-card-foreground">{profile?.name}</h2>
            <p className="text-sm text-muted-foreground">{profile?.phone || user.phoneNumber || "No phone"}</p>
            <span className="mt-1 inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
              {profile?.role || "user"}
            </span>
          </div>
        </div>

        {isAdmin && (
          <Link
            to="/admin"
            className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary"
          >
            <Shield className="h-5 w-5" />
            Admin Dashboard
          </Link>
        )}

        <LogoutButton />
      </div>
    </div>
  );
}
