import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { addApp, fileToDataURL } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { LoginPrompt } from "@/components/LoginPrompt";
import { Upload, ImagePlus, X, Plus, Minus } from "lucide-react";

const CATEGORIES = ["Apps", "Games", "Tools", "Education", "Entertainment", "Social", "Finance", "Health"];
const CONTENT_RATINGS = ["Everyone", "Everyone 10+", "Teen", "Mature 17+"];
const LICENSE_TYPES = ["Free", "Paid", "Freemium", "Open Source"];
const COMMON_PERMISSIONS = ["Camera", "Microphone", "Contacts", "Storage", "Location", "Phone", "Internet", "Bluetooth", "Calendar", "SMS"];

export const Route = createFileRoute("/upload")({
  component: UploadPage,
});

function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [whatsNew, setWhatsNew] = useState("");
  const [category, setCategory] = useState("Apps");
  const [fileURL, setFileURL] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [license, setLicense] = useState("Free");
  const [contentRating, setContentRating] = useState("Everyone");
  const [requiresAndroid, setRequiresAndroid] = useState("5.0 and up");
  const [privacyPolicyURL, setPrivacyPolicyURL] = useState("");
  const [containsAds, setContainsAds] = useState(false);
  const [inAppPurchases, setInAppPurchases] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [dataShared, setDataShared] = useState("");
  const [dataCollected, setDataCollected] = useState("");
  const [securityPractices, setSecurityPractices] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState("");
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);

  if (!user) return <><Header title="Upload" /><LoginPrompt message="Sign in to upload apps" /></>;

  const handleIcon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const preview = await fileToDataURL(file);
      setIconPreview(preview);
    }
  };

  const handleScreenshots = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...screenshotFiles, ...files].slice(0, 8);
    setScreenshotFiles(newFiles);
    const previews = await Promise.all(newFiles.map(fileToDataURL));
    setScreenshotPreviews(previews);
  };

  const removeScreenshot = (index: number) => {
    setScreenshotFiles((f) => f.filter((_, i) => i !== index));
    setScreenshotPreviews((p) => p.filter((_, i) => i !== index));
  };

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    try {
      let iconURL = "";
      if (iconFile) iconURL = await fileToDataURL(iconFile);
      const screenshots = screenshotFiles.length > 0 ? await Promise.all(screenshotFiles.map(fileToDataURL)) : [];

      addApp({
        name: name.trim(),
        description: description.trim(),
        category,
        iconURL,
        screenshots,
        fileURL: fileURL.trim(),
        fileSize: fileSize || "varies",
        version: version || "1.0.0",
        createdBy: user.id,
        createdByName: user.name,
        createdByPhone: user.phone,
        whatsNew: whatsNew.trim(),
        permissions: selectedPermissions,
        license,
        privacyPolicyURL: privacyPolicyURL.trim(),
        contentRating,
        requiresAndroid,
        installs: "0+",
        containsAds,
        inAppPurchases,
        dataSafety: {
          dataShared: dataShared.trim() || "No data shared with third parties",
          dataCollected: dataCollected.trim() || "No data collected",
          securityPractices: securityPractices.trim() || "Data is encrypted in transit",
        },
      });

      setSuccess(true);
      setStep(1);
      setName(""); setDescription(""); setWhatsNew("");
      setIconFile(null); setIconPreview("");
      setScreenshotFiles([]); setScreenshotPreviews([]);
      setFileURL(""); setFileSize(""); setVersion("1.0.0");
      setSelectedPermissions([]); setPrivacyPolicyURL("");
      setDataShared(""); setDataCollected(""); setSecurityPractices("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Header title="Publish App" />

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 px-4 py-3">
        {[1, 2, 3].map((s) => (
          <button key={s} onClick={() => setStep(s)}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              step === s ? "bg-primary text-primary-foreground" : step > s ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
            }`}>{s}</button>
        ))}
      </div>
      <div className="mb-3 text-center text-xs text-muted-foreground">
        {step === 1 && "Basic Info"}
        {step === 2 && "Media & Content"}
        {step === 3 && "Permissions & Safety"}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-8">
        {success && (
          <div className="rounded-lg bg-accent p-3 text-center text-sm text-accent-foreground">
            ✅ App submitted! Waiting for admin approval.
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <>
            <InputField label="App Name *" value={name} onChange={setName} required />
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
                placeholder="Describe your app features, what it does..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">What's New</label>
              <textarea value={whatsNew} onChange={(e) => setWhatsNew(e.target.value)} rows={3}
                placeholder="• Bug fixes&#10;• New features..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Version" value={version} onChange={setVersion} placeholder="1.0.0" />
              <InputField label="Size" value={fileSize} onChange={setFileSize} placeholder="12 MB" />
            </div>
            <SelectField label="Category" value={category} onChange={setCategory} options={CATEGORIES} />
            <SelectField label="License" value={license} onChange={setLicense} options={LICENSE_TYPES} />
            <SelectField label="Content Rating" value={contentRating} onChange={setContentRating} options={CONTENT_RATINGS} />
            <InputField label="Requires Android" value={requiresAndroid} onChange={setRequiresAndroid} placeholder="5.0 and up" />
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={containsAds} onChange={(e) => setContainsAds(e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-primary" />
                Contains Ads
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={inAppPurchases} onChange={(e) => setInAppPurchases(e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-primary" />
                In-app Purchases
              </label>
            </div>
            <button type="button" onClick={() => setStep(2)}
              className="flex w-full items-center justify-center rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground">
              Next: Media & Content →
            </button>
          </>
        )}

        {/* Step 2: Media */}
        {step === 2 && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">App Icon</label>
              {iconPreview && <img src={iconPreview} alt="Icon" className="mb-2 h-16 w-16 rounded-xl object-cover" />}
              <input type="file" accept="image/*" onChange={handleIcon}
                className="w-full text-sm text-muted-foreground file:mr-2 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:text-primary-foreground" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Screenshots (up to 8)</label>
              {screenshotPreviews.length > 0 && (
                <div className="mb-2 flex gap-2 overflow-x-auto pb-2">
                  {screenshotPreviews.map((src, i) => (
                    <div key={i} className="relative shrink-0">
                      <img src={src} alt={`Screenshot ${i + 1}`} className="h-28 w-16 rounded-lg object-cover" />
                      <button type="button" onClick={() => removeScreenshot(i)}
                        className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {screenshotPreviews.length < 8 && (
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-input p-3 text-sm text-muted-foreground">
                  <ImagePlus className="h-4 w-4" /><span>Add screenshots</span>
                  <input type="file" accept="image/*" multiple onChange={handleScreenshots} className="hidden" />
                </label>
              )}
            </div>
            <InputField label="Download URL (APK link)" value={fileURL} onChange={setFileURL} placeholder="https://..." />
            <InputField label="Privacy Policy URL" value={privacyPolicyURL} onChange={setPrivacyPolicyURL} placeholder="https://..." />
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(1)}
                className="flex flex-1 items-center justify-center rounded-lg border border-border py-3 text-sm font-semibold text-foreground">← Back</button>
              <button type="button" onClick={() => setStep(3)}
                className="flex flex-1 items-center justify-center rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground">Next →</button>
            </div>
          </>
        )}

        {/* Step 3: Permissions & Data Safety */}
        {step === 3 && (
          <>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">App Permissions</label>
              <div className="grid grid-cols-2 gap-2">
                {COMMON_PERMISSIONS.map((perm) => (
                  <button key={perm} type="button" onClick={() => togglePermission(perm)}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      selectedPermissions.includes(perm)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground"
                    }`}>{perm}</button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border p-3">
              <h3 className="text-sm font-semibold text-foreground">Data Safety Declaration</h3>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Data shared with third parties</label>
                  <input value={dataShared} onChange={(e) => setDataShared(e.target.value)}
                    placeholder="No data shared with third parties"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Data collected</label>
                  <input value={dataCollected} onChange={(e) => setDataCollected(e.target.value)}
                    placeholder="Personal info, App activity"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Security practices</label>
                  <input value={securityPractices} onChange={(e) => setSecurityPractices(e.target.value)}
                    placeholder="Data is encrypted in transit"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(2)}
                className="flex flex-1 items-center justify-center rounded-lg border border-border py-3 text-sm font-semibold text-foreground">← Back</button>
              <button type="submit" disabled={submitting || !name.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                <Upload className="h-4 w-4" />
                {submitting ? "Publishing..." : "Publish App"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
