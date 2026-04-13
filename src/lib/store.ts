// Simple localStorage-based data store for PlayDock

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  password: string;
  role: "user" | "admin";
}

export interface AppItem {
  id: string;
  name: string;
  description: string;
  category: string;
  iconURL: string;
  screenshots: string[];
  fileURL: string;
  fileSize: string;
  version: string;
  status: "pending" | "approved";
  downloads: number;
  rating: number;
  createdBy: string;
  createdAt: number;
}

const isBrowser = typeof window !== "undefined";

function getUsers(): UserProfile[] {
  if (!isBrowser) return [];
  try {
    return JSON.parse(localStorage.getItem("playdock_users") || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: UserProfile[]) {
  if (!isBrowser) return;
  localStorage.setItem("playdock_users", JSON.stringify(users));
}

function getApps(): AppItem[] {
  if (!isBrowser) return [];
  try {
    return JSON.parse(localStorage.getItem("playdock_apps") || "[]");
  } catch {
    return [];
  }
}

function saveApps(apps: AppItem[]) {
  if (!isBrowser) return;
  localStorage.setItem("playdock_apps", JSON.stringify(apps));
}

// Auth
export function signUp(name: string, phone: string, password: string): UserProfile {
  const users = getUsers();
  if (users.find((u) => u.phone === phone)) {
    throw new Error("Phone number already registered");
  }
  const user: UserProfile = {
    id: crypto.randomUUID(),
    name,
    phone,
    password,
    role: users.length === 0 ? "admin" : "user", // first user is admin
  };
  users.push(user);
  saveUsers(users);
  if (isBrowser) localStorage.setItem("playdock_current_user", user.id);
  return user;
}

export function signIn(phone: string, password: string): UserProfile {
  const users = getUsers();
  const user = users.find((u) => u.phone === phone && u.password === password);
  if (!user) throw new Error("Invalid phone or password");
  if (isBrowser) localStorage.setItem("playdock_current_user", user.id);
  return user;
}

export function signOut() {
  if (isBrowser) localStorage.removeItem("playdock_current_user");
}

export function getCurrentUser(): UserProfile | null {
  if (!isBrowser) return null;
  const id = localStorage.getItem("playdock_current_user");
  if (!id) return null;
  const users = getUsers();
  return users.find((u) => u.id === id) || null;
}

// Apps
export function getAllApps(): AppItem[] {
  return getApps();
}

export function getApprovedApps(): AppItem[] {
  return getApps().filter((a) => a.status === "approved");
}

export function getAppsByCategory(category: string): AppItem[] {
  return getApps().filter((a) => a.status === "approved" && a.category === category);
}

export function getAppById(id: string): AppItem | null {
  return getApps().find((a) => a.id === id) || null;
}

export function addApp(app: Omit<AppItem, "id" | "createdAt" | "status" | "downloads" | "rating">): AppItem {
  const apps = getApps();
  const newApp: AppItem = {
    ...app,
    id: crypto.randomUUID(),
    status: "pending",
    downloads: 0,
    rating: 0,
    createdAt: Date.now(),
  };
  apps.push(newApp);
  saveApps(apps);
  return newApp;
}

export function approveApp(id: string) {
  const apps = getApps();
  const app = apps.find((a) => a.id === id);
  if (app) {
    app.status = "approved";
    saveApps(apps);
  }
}

export function deleteApp(id: string) {
  const apps = getApps().filter((a) => a.id !== id);
  saveApps(apps);
}

export function incrementDownloads(id: string) {
  const apps = getApps();
  const app = apps.find((a) => a.id === id);
  if (app) {
    app.downloads++;
    saveApps(apps);
  }
}

export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
