// Simple localStorage-based data store for PlayDock

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  password: string;
  role: "user" | "admin";
}

export interface AppReview {
  userId: string;
  userName: string;
  stars: number;
  comment: string;
  date: number;
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
  createdByName: string;
  createdByPhone: string;
  createdAt: number;
  // Play Store style fields
  whatsNew: string;
  permissions: string[];
  license: string;
  privacyPolicyURL: string;
  contentRating: string;
  requiresAndroid: string;
  lastUpdated: number;
  installs: string;
  containsAds: boolean;
  inAppPurchases: boolean;
  dataSafety: {
    dataShared: string;
    dataCollected: string;
    securityPractices: string;
  };
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
    role: users.length === 0 ? "admin" : "user",
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

export function getUserById(id: string): UserProfile | null {
  const users = getUsers();
  return users.find((u) => u.id === id) || null;
}

export function getAllUsers(): UserProfile[] {
  return getUsers();
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

export function addApp(
  app: Omit<AppItem, "id" | "createdAt" | "status" | "downloads" | "rating" | "lastUpdated">
): AppItem {
  const apps = getApps();
  const now = Date.now();
  const newApp: AppItem = {
    ...app,
    id: crypto.randomUUID(),
    status: "pending",
    downloads: 0,
    rating: 0,
    createdAt: now,
    lastUpdated: now,
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

// Reviews
export function getReviews(appId: string): AppReview[] {
  if (!isBrowser) return [];
  try {
    const all = JSON.parse(localStorage.getItem("playdock_reviews") || "{}");
    return all[appId] || [];
  } catch {
    return [];
  }
}

export function addReview(appId: string, userId: string, userName: string, stars: number, comment: string) {
  if (!isBrowser) return;
  const key = "playdock_reviews";
  let all: Record<string, AppReview[]> = {};
  try { all = JSON.parse(localStorage.getItem(key) || "{}"); } catch {}
  if (!all[appId]) all[appId] = [];
  // Remove existing review by this user
  all[appId] = all[appId].filter(r => r.userId !== userId);
  all[appId].push({ userId, userName, stars, comment, date: Date.now() });
  localStorage.setItem(key, JSON.stringify(all));

  // Update rating on app
  const avg = all[appId].reduce((s, r) => s + r.stars, 0) / all[appId].length;
  const apps = getApps();
  const app = apps.find(a => a.id === appId);
  if (app) {
    app.rating = Math.round(avg * 10) / 10;
    saveApps(apps);
  }
}

export function rateApp(id: string, userId: string, stars: number) {
  if (!isBrowser) return;
  const key = "playdock_ratings";
  let ratings: Record<string, Record<string, number>> = {};
  try {
    ratings = JSON.parse(localStorage.getItem(key) || "{}");
  } catch {}
  if (!ratings[id]) ratings[id] = {};
  ratings[id][userId] = stars;
  localStorage.setItem(key, JSON.stringify(ratings));

  const userRatings = Object.values(ratings[id]);
  const avg = userRatings.reduce((s, r) => s + r, 0) / userRatings.length;

  const apps = getApps();
  const app = apps.find((a) => a.id === id);
  if (app) {
    app.rating = Math.round(avg * 10) / 10;
    saveApps(apps);
  }
}

export function getUserRating(appId: string, userId: string): number {
  if (!isBrowser) return 0;
  try {
    const ratings = JSON.parse(localStorage.getItem("playdock_ratings") || "{}");
    return ratings[appId]?.[userId] || 0;
  } catch {
    return 0;
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
