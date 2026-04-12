import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Header } from "@/components/Header";
import { Download, ArrowLeft } from "lucide-react";

interface AppDetail {
  name: string;
  description: string;
  category: string;
  iconURL: string;
  fileURL: string;
  downloads: number;
  status: string;
}

export const Route = createFileRoute("/app/$appId")({
  component: AppDetailPage,
});

function AppDetailPage() {
  const { appId } = Route.useParams();
  const [app, setApp] = useState<AppDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const snap = await getDoc(doc(db, "apps", appId));
        if (snap.exists()) setApp(snap.data() as AppDetail);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [appId]);

  const handleDownload = async () => {
    if (!app?.fileURL) return;
    await updateDoc(doc(db, "apps", appId), { downloads: increment(1) });
    setApp((prev) => prev ? { ...prev, downloads: prev.downloads + 1 } : prev);
    window.open(app.fileURL, "_blank");
  };

  if (loading) {
    return (
      <div>
        <Header title="App Details" />
        <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      </div>
    );
  }

  if (!app) {
    return (
      <div>
        <Header title="App Details" />
        <div className="px-4 py-20 text-center">
          <p className="text-muted-foreground">App not found</p>
          <Link to="/" className="mt-2 inline-block text-sm text-primary">Go home</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="" />
      <div className="px-4 py-4">
        <Link to="/" className="mb-4 flex items-center gap-1 text-sm text-primary">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="flex items-start gap-4">
          <img src={app.iconURL || "/placeholder.svg"} alt={app.name} className="h-20 w-20 rounded-2xl bg-muted object-cover" />
          <div>
            <h1 className="text-lg font-bold text-foreground">{app.name}</h1>
            <p className="text-sm text-muted-foreground">{app.category}</p>
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <Download className="h-3.5 w-3.5" />
              <span>{app.downloads.toLocaleString()} downloads</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={!app.fileURL}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {app.fileURL ? "Download" : "No file available"}
        </button>

        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-foreground">About this app</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{app.description || "No description provided."}</p>
        </div>
      </div>
    </div>
  );
}
