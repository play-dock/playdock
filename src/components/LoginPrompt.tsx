import { Phone, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LoginPromptProps {
  message?: string;
}

export function LoginPrompt({ message = "Sign in to continue" }: LoginPromptProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
        <Phone className="h-7 w-7 text-accent-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
      <p className="text-xs text-muted-foreground">
        Phone OTP login requires Firebase config. Update <code className="rounded bg-muted px-1 py-0.5">src/lib/firebase.ts</code> with your project credentials.
      </p>
    </div>
  );
}

export function LogoutButton() {
  const { user } = useAuth();
  if (!user) return null;
  
  const handleLogout = async () => {
    const { signOut } = await import("firebase/auth");
    const { auth } = await import("@/lib/firebase");
    await signOut(auth);
  };

  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center gap-3 rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  );
}
