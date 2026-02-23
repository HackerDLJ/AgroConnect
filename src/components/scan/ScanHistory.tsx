import { useEffect, useState } from "react";
import { ArrowLeft, Download, Share2, Trash2, Loader2, Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface ScanRecord {
  id: string;
  image_url: string;
  plant_species: string | null;
  disease_name: string | null;
  severity: number | null;
  confidence: number | null;
  treatments: string[] | null;
  prevention_steps: string[] | null;
  created_at: string;
}

interface Props {
  onBack: () => void;
}

export function ScanHistory({ onBack }: Props) {
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data, error } = await supabase
        .from("scan_images")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) setScans(data as unknown as ScanRecord[]);
      setLoading(false);
    };
    load();
  }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("scan_images").delete().eq("id", id);
    if (!error) {
      setScans((prev) => prev.filter((s) => s.id !== id));
      toast({ title: "Scan deleted" });
    }
  };

  const handleShare = async (scan: ScanRecord) => {
    const text = `🌿 ${scan.plant_species} — ${scan.disease_name}\nSeverity: ${Math.round((scan.severity ?? 0) * 100)}%\nConfidence: ${Math.round((scan.confidence ?? 0) * 100)}%\n\n— AgroConnect`;
    if (navigator.share) {
      try { await navigator.share({ title: "AgroConnect Scan", text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard" });
    }
  };

  const handleExportPDF = () => {
    // Generate a printable HTML and trigger print dialog (works as PDF save)
    const content = `
      <html><head><title>AgroConnect Scan History</title>
      <style>
        body{font-family:system-ui;padding:24px;color:#222}
        h1{color:#22c55e;margin-bottom:4px}
        .sub{color:#888;font-size:12px;margin-bottom:24px}
        .scan{display:flex;gap:16px;border-bottom:1px solid #eee;padding:12px 0;page-break-inside:avoid}
        .thumb{width:80px;height:80px;object-fit:cover;border-radius:8px}
        .info{flex:1}
        .label{font-size:11px;color:#888;text-transform:uppercase}
        .val{font-size:14px;font-weight:600;margin-bottom:4px}
        .stats{background:#f0fdf4;padding:16px;border-radius:8px;margin-bottom:24px}
      </style></head><body>
      <h1>🌿 AgroConnect</h1>
      <p class="sub">Scan History Report — ${new Date().toLocaleDateString()}</p>
      <div class="stats">
        <strong>Summary:</strong> ${scans.length} total scans
        ${scans.length > 0 ? ` • Most common: ${getMostCommon(scans)}` : ""}
      </div>
      ${scans.map((s) => `
        <div class="scan">
          <img src="${s.image_url}" class="thumb" crossorigin="anonymous"/>
          <div class="info">
            <div class="label">Plant</div><div class="val">${s.plant_species || "Unknown"}</div>
            <div class="label">Disease</div><div class="val">${s.disease_name || "N/A"}</div>
            <div class="label">Severity</div><div class="val">${Math.round((s.severity ?? 0) * 100)}%</div>
            <div class="label">Date</div><div class="val">${new Date(s.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      `).join("")}
      </body></html>
    `;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(content);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  };

  const severityColor = (s: number) =>
    s > 0.7 ? "hsl(0 72% 55%)" : s > 0.4 ? "hsl(var(--alert-amber))" : "hsl(var(--farm-green))";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-xs font-mono" style={{ color: "hsl(var(--farm-green))" }}>
          <ArrowLeft size={14} /> Back
        </button>
        <h2 className="text-lg font-semibold text-foreground">Scan History</h2>
        <button
          onClick={handleExportPDF}
          disabled={scans.length === 0}
          className="flex items-center gap-1 text-xs font-mono disabled:opacity-40"
          style={{ color: "hsl(var(--market-blue))" }}
        >
          <Download size={14} /> PDF
        </button>
      </div>

      {/* Stats bar */}
      {scans.length > 0 && (
        <div
          className="nothing-card p-3 rounded-xl flex items-center justify-between text-xs font-mono"
        >
          <span className="text-foreground-muted">{scans.length} scans</span>
          <span style={{ color: "hsl(var(--farm-green))" }}>Most common: {getMostCommon(scans)}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin" style={{ color: "hsl(var(--farm-green))" }} />
        </div>
      ) : scans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Leaf size={40} style={{ color: "hsl(var(--foreground-dim))" }} />
          <p className="text-sm text-foreground-muted font-mono">No scans yet</p>
          <button
            onClick={onBack}
            className="text-xs font-mono px-4 py-2 rounded-xl"
            style={{ background: "hsl(var(--farm-green))", color: "hsl(var(--primary-foreground))" }}
          >
            Scan your first leaf
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {scans.map((scan) => (
            <div
              key={scan.id}
              className="nothing-card rounded-xl p-3 flex gap-3 items-start"
            >
              <img
                src={scan.image_url}
                alt={scan.plant_species || "scan"}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                style={{ border: "1px solid hsl(var(--surface-border))" }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{scan.plant_species || "Unknown"}</p>
                <p className="text-xs text-foreground-muted truncate">{scan.disease_name || "N/A"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="severity-bar flex-1" style={{ height: "3px" }}>
                    <div
                      className="severity-fill"
                      style={{
                        "--severity": `${(scan.severity ?? 0) * 100}%`,
                        background: severityColor(scan.severity ?? 0),
                      } as React.CSSProperties}
                    />
                  </div>
                  <span className="text-[10px] font-mono" style={{ color: severityColor(scan.severity ?? 0) }}>
                    {Math.round((scan.severity ?? 0) * 100)}%
                  </span>
                </div>
                <p className="text-[10px] text-foreground-dim font-mono mt-1">
                  {new Date(scan.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => handleShare(scan)} className="p-1.5 rounded-lg" style={{ background: "hsl(var(--surface-elevated))" }}>
                  <Share2 size={12} className="text-foreground-muted" />
                </button>
                <button onClick={() => handleDelete(scan.id)} className="p-1.5 rounded-lg" style={{ background: "hsl(var(--surface-elevated))" }}>
                  <Trash2 size={12} style={{ color: "hsl(0 72% 55%)" }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getMostCommon(scans: { disease_name: string | null }[]): string {
  const counts: Record<string, number> = {};
  for (const s of scans) {
    const d = s.disease_name || "Unknown";
    counts[d] = (counts[d] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
}
