import { useState } from "react";
import { CheckCircle2, Clock, Share2, BookmarkPlus, ArrowLeft, History } from "lucide-react";
import { BottomSheet } from "@/components/BottomSheet";
import type { DiagnosisResult } from "@/components/ScanTab";
import { toast } from "@/hooks/use-toast";

interface Props {
  result: DiagnosisResult;
  onNewScan: () => void;
  onHistory: () => void;
}

export function ScanResult({ result, onNewScan, onHistory }: Props) {
  const [detailOpen, setDetailOpen] = useState(true);
  const [remindSet, setRemindSet] = useState(false);

  const severityLabel = result.severity > 0.7 ? "High" : result.severity > 0.4 ? "Medium" : "Low";
  const severityColor =
    result.severity > 0.7
      ? "hsl(0 72% 55%)"
      : result.severity > 0.4
      ? "hsl(var(--alert-amber))"
      : "hsl(var(--farm-green))";

  const handleShare = async () => {
    const text = `🌿 Plant Scan Result\nPlant: ${result.plant_species}\nDisease: ${result.disease_name}\nConfidence: ${Math.round(result.confidence * 100)}%\nSeverity: ${severityLabel}\n\nTreatments:\n${result.treatments.map((t) => `• ${t}`).join("\n")}\n\n— AgroConnect`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "AgroConnect Scan", text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard" });
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Top bar */}
      <div className="w-full flex items-center justify-between">
        <button onClick={onNewScan} className="flex items-center gap-1 text-xs font-mono" style={{ color: "hsl(var(--farm-green))" }}>
          <ArrowLeft size={14} /> New scan
        </button>
        <button onClick={onHistory} className="flex items-center gap-1 text-xs font-mono" style={{ color: "hsl(var(--foreground-muted))" }}>
          <History size={14} /> History
        </button>
      </div>

      {/* Image preview */}
      <div
        className="w-full aspect-[4/3] max-w-xs rounded-2xl overflow-hidden"
        style={{ border: "1px solid hsl(var(--surface-border))" }}
      >
        <img src={result.image_url} alt="Scanned leaf" className="w-full h-full object-cover" />
      </div>

      {/* Quick summary cards */}
      <div className="w-full grid grid-cols-2 gap-3">
        <div className="nothing-card card-farm p-3 rounded-xl">
          <p className="text-[9px] font-mono uppercase tracking-wider mb-1" style={{ color: "hsl(var(--farm-green))" }}>
            🌱 Plant
          </p>
          <p className="text-sm font-semibold text-foreground">{result.plant_species}</p>
        </div>
        <div className="nothing-card card-alert p-3 rounded-xl">
          <p className="text-[9px] font-mono uppercase tracking-wider mb-1" style={{ color: "hsl(var(--alert-amber))" }}>
            🔬 Disease
          </p>
          <p className="text-sm font-semibold text-foreground">{result.disease_name}</p>
          <p className="text-[10px] font-mono mt-0.5" style={{ color: "hsl(var(--alert-amber))" }}>
            {Math.round(result.confidence * 100)}% confidence
          </p>
        </div>
      </div>

      {/* Severity meter */}
      <div className="w-full nothing-card p-4 rounded-xl">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-foreground-muted font-mono">Severity</span>
          <span className="font-mono font-bold" style={{ color: severityColor }}>
            {severityLabel} ({Math.round(result.severity * 100)}%)
          </span>
        </div>
        <div className="severity-bar">
          <div
            className="severity-fill"
            style={{ "--severity": `${result.severity * 100}%`, background: severityColor } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="w-full flex gap-2">
        <button
          onClick={handleShare}
          className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-mono transition-all"
          style={{ background: "hsl(var(--surface-elevated))", border: "1px solid hsl(var(--surface-border))", color: "hsl(var(--foreground))" }}
        >
          <Share2 size={14} /> Share
        </button>
        <button
          onClick={() => toast({ title: "Saved!", description: "Scan saved to your history." })}
          className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-mono transition-all"
          style={{ background: "hsl(var(--surface-elevated))", border: "1px solid hsl(var(--surface-border))", color: "hsl(var(--foreground))" }}
        >
          <BookmarkPlus size={14} /> Saved ✓
        </button>
        <button
          onClick={() => setRemindSet(true)}
          className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-mono transition-all"
          style={{
            background: remindSet ? "hsl(var(--surface-elevated))" : "hsl(var(--alert-amber))",
            color: remindSet ? "hsl(var(--foreground))" : "hsl(var(--background))",
            border: remindSet ? "1px solid hsl(var(--alert-amber) / 0.4)" : "none",
          }}
        >
          {remindSet ? <><CheckCircle2 size={14} style={{ color: "hsl(var(--alert-amber))" }} /> Set!</> : <><Clock size={14} /> Remind</>}
        </button>
      </div>

      {/* View details */}
      <button
        onClick={() => setDetailOpen(true)}
        className="text-xs font-mono underline"
        style={{ color: "hsl(var(--farm-green) / 0.7)" }}
      >
        View treatment details ↓
      </button>

      {/* Detail bottom sheet */}
      <BottomSheet open={detailOpen} onClose={() => setDetailOpen(false)} title="Treatment & Prevention" accentColor="green">
        <div className="space-y-4">
          {/* Treatments */}
          <div
            className="p-3 rounded-xl"
            style={{ background: "hsl(var(--farm-green) / 0.08)", border: "1px solid hsl(var(--farm-green) / 0.2)" }}
          >
            <p className="text-[9px] font-mono uppercase tracking-wider mb-2" style={{ color: "hsl(var(--farm-green))" }}>
              💊 Treatment
            </p>
            {result.treatments.map((t, i) => (
              <p key={i} className="text-xs text-foreground leading-snug mb-1">
                {i + 1}. {t}
              </p>
            ))}
          </div>

          {/* Prevention */}
          <div
            className="p-3 rounded-xl"
            style={{ background: "hsl(var(--market-blue) / 0.08)", border: "1px solid hsl(var(--market-blue) / 0.2)" }}
          >
            <p className="text-[9px] font-mono uppercase tracking-wider mb-2" style={{ color: "hsl(var(--market-blue))" }}>
              🛡️ Prevention
            </p>
            {result.prevention_steps.map((s, i) => (
              <p key={i} className="text-xs text-foreground leading-snug mb-1">
                {i + 1}. {s}
              </p>
            ))}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
