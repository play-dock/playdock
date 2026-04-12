import { Link } from "@tanstack/react-router";
import { Download } from "lucide-react";

interface AppCardProps {
  id: string;
  name: string;
  category: string;
  iconURL: string;
  downloads: number;
}

export function AppCard({ id, name, category, iconURL, downloads }: AppCardProps) {
  return (
    <Link
      to="/app/$appId"
      params={{ appId: id }}
      className="flex items-center gap-3 rounded-xl bg-card p-3 transition-colors active:bg-accent"
    >
      <img
        src={iconURL || "/placeholder.svg"}
        alt={name}
        className="h-14 w-14 rounded-xl bg-muted object-cover"
      />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-card-foreground">{name}</h3>
        <p className="text-xs text-muted-foreground">{category}</p>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Download className="h-3 w-3" />
          <span>{downloads.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}
