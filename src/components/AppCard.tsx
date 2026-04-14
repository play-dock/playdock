import { Link } from "@tanstack/react-router";
import { Download, Star } from "lucide-react";

interface AppCardProps {
  id: string;
  name: string;
  category: string;
  iconURL: string;
  downloads: number;
  rating?: number;
  fileSize?: string;
}

export function AppCard({ id, name, category, iconURL, downloads, rating, fileSize }: AppCardProps) {
  const formatDownloads = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };

  return (
    <Link
      to="/app/$appId"
      params={{ appId: id }}
      className="flex items-center gap-3 rounded-xl bg-card p-3 transition-colors active:bg-accent"
    >
      <img
        src={iconURL || "/placeholder.svg"}
        alt={name}
        className="h-14 w-14 rounded-xl bg-muted object-cover shadow-sm"
      />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-card-foreground">{name}</h3>
        <p className="text-xs text-muted-foreground">{category}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-primary text-primary" />
            <span>{rating && rating > 0 ? rating.toFixed(1) : "—"}</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-0.5">
            <Download className="h-3 w-3" />
            <span>{formatDownloads(downloads)}</span>
          </div>
          {fileSize && (
            <>
              <span>·</span>
              <span>{fileSize}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
