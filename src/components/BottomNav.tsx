import { Link } from "@tanstack/react-router";
import { Home, Grid3X3, Upload, User } from "lucide-react";

const tabs = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/categories", icon: Grid3X3, label: "Categories" },
  { to: "/upload", icon: Upload, label: "Upload" },
  { to: "/profile", icon: User, label: "Profile" },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {tabs.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            activeOptions={{ exact: tab.to === "/" }}
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground transition-colors"
            activeProps={{ className: "flex flex-col items-center gap-0.5 px-3 py-1 text-primary transition-colors" }}
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
