import { Search } from "lucide-react";

interface HeaderProps {
  onSearchChange?: (query: string) => void;
  showSearch?: boolean;
  title?: string;
}

export function Header({ onSearchChange, showSearch = false, title = "PlayDock" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
        <h1 className="text-lg font-bold text-primary">{title}</h1>
        {showSearch && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search apps..."
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full rounded-full border border-input bg-background py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}
      </div>
    </header>
  );
}
