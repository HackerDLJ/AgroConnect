import { useState } from "react";
import { Upload, Leaf, Loader2 } from "lucide-react";
import { ScanResult } from "./scan/ScanResult";
import { ScanHistory } from "./scan/ScanHistory";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface DiagnosisResult {
  id: string;
  image_url: string;
  plant_species: string;
  disease_name: string;
  confidence: number;
  severity: number;
  treatments: string[];
  prevention_steps: string[];
}

type View = "upload" | "result" | "history";

export function ScanTab() {
  const { user } = useAuth();
  const [view, setView] = useState<View>("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 1024;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          const ratio = Math.min(MAX / w, MAX / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.8);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select a JPG or PNG image.", variant: "destructive" });
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to scan leaves.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const ext = "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("scan-images")
        .upload(path, compressed, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("scan-images").getPublicUrl(path);
      const imageUrl = urlData.publicUrl;

      const { data, error } = await supabase.functions.invoke("diagnose-plant", {
        body: { imageUrl },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data as DiagnosisResult);
      setView("result");
    } catch (err: any) {
      console.error("Scan error:", err);
      toast({ title: "Scan failed", description: err.message || "Could not analyze image.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (view === "history") {
    return <ScanHistory onBack={() => setView("upload")} />;
  }

  if (view === "result" && result) {
    return (
      <ScanResult
        result={result}
        onNewScan={() => { setView("upload"); setPreview(null); setResult(null); }}
        onHistory={() => setView("history")}
      />
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">Scan Leaf</h2>
        <p className="text-xs text-foreground-muted font-mono">AI-powered plant disease diagnosis</p>
      </div>

      {/* Upload area */}
      <label
        className="relative w-full aspect-square max-w-xs rounded-3xl overflow-hidden cursor-pointer flex flex-col items-center justify-center gap-3 transition-all"
        style={{
          background: preview ? "transparent" : "hsl(0 0% 3%)",
          border: "1px solid hsl(var(--surface-border))",
          boxShadow: "0 0 40px hsl(var(--farm-green) / 0.1)",
        }}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading}
        />

        {preview ? (
          <img src={preview} alt="Selected leaf" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <>
            {/* Corner brackets */}
            {[
              "top-3 left-3 border-t border-l",
              "top-3 right-3 border-t border-r",
              "bottom-3 left-3 border-b border-l",
              "bottom-3 right-3 border-b border-r",
            ].map((pos, i) => (
              <div
                key={i}
                className={`absolute w-6 h-6 ${pos}`}
                style={{ borderColor: "hsl(var(--farm-green))", borderWidth: "2px" }}
              />
            ))}
            <Leaf size={40} style={{ color: "hsl(var(--farm-green) / 0.5)" }} />
            <p className="text-xs font-mono text-center px-6" style={{ color: "hsl(var(--farm-green) / 0.7)" }}>
              Tap to select leaf photo
            </p>
            <p className="text-[10px] font-mono" style={{ color: "hsl(var(--foreground-dim))" }}>
              JPG / PNG • Under 10MB
            </p>
          </>
        )}

        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 backdrop-blur-sm">
            <Loader2 size={32} className="animate-spin" style={{ color: "hsl(var(--farm-green))" }} />
            <p className="text-xs font-mono" style={{ color: "hsl(var(--farm-green))" }}>
              Analyzing leaf...
            </p>
          </div>
        )}
      </label>

      {/* Upload button */}
      <button
        onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
        disabled={uploading}
        className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-40 pulse-green"
        style={{
          background: "hsl(var(--farm-green))",
          boxShadow: "0 0 24px hsl(var(--farm-green) / 0.5)",
        }}
      >
        {uploading ? (
          <Loader2 size={28} className="animate-spin" style={{ color: "hsl(var(--primary-foreground))" }} />
        ) : (
          <Upload size={28} style={{ color: "hsl(var(--primary-foreground))" }} />
        )}
      </button>

      <p className="text-xs text-foreground-muted font-mono">
        {uploading ? "Running AI diagnosis..." : "Upload a leaf photo to diagnose"}
      </p>

      {/* History link */}
      <button
        onClick={() => setView("history")}
        className="text-xs font-mono underline transition-colors"
        style={{ color: "hsl(var(--farm-green) / 0.7)" }}
      >
        View scan history →
      </button>
    </div>
  );
}
