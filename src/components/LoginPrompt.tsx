import { useState } from "react";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LoginPromptProps {
  message?: string;
}

export function LoginPrompt({ message = "Sign in to continue" }: LoginPromptProps) {
  const { login, register, error } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      register(name, phone, password);
    } else {
      login(phone, password);
    }
  };

  return (
    <div className="px-4 py-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
          <User className="h-6 w-6 text-accent-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        {isSignUp && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        )}
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone Number"
          required
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />

        {error && <p className="text-xs text-destructive">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
        >
          {isSignUp ? "Sign Up" : "Sign In"}
        </button>

        <button
          type="button"
          onClick={() => { setIsSignUp(!isSignUp); }}
          className="w-full text-center text-sm text-primary"
        >
          {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
        </button>
      </form>
    </div>
  );
}

export function LogoutButton() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <button
      onClick={logout}
      className="flex w-full items-center gap-3 rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  );
}
