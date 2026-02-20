import { useState, useRef } from "react";
import { Camera, Zap, CheckCircle2, Clock } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import leafScan from "@/assets/leaf-scan.png";

const DISEASES = [
  {
    name: "Early Blight",
    severity: 0.62,
    organic: ["Neem oil spray 3%", "Copper oxychloride"],
    chemical: ["Mancozeb 75 WP @ 2.5g/L", "Chlorothalonil 75 WP"],
  },
  {
    name: "Leaf Miner",
    severity: 0.35,
    organic: ["Sticky yellow traps", "Spinosad spray"],
    chemical: ["Abamectin 1.8 EC @ 0.5ml/L"],
  },
];

type ScanState = "idle" | "scanning" | "result";

export function ScanTab() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [resultSheetOpen, setResultSheetOpen] = useState(false);
  const [disease] = useState(DISEASES[0]);
  const [remindSet, setRemindSet] = useState(false);
  const scanLineRef = useRef<HTMLDivElement>(null);

  const handleCapture = () => {
    setScanState("scanning");
    setTimeout(() => {
      setScanState("result");
      setResultSheetOpen(true);
    }, 2500);
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">Scan Leaf</h2>
        <p className="text-xs text-foreground-muted font-mono">On-device AI diagnosis</p>
      </div>

      {/* Camera viewfinder */}
      <div
        className="relative w-full aspect-square max-w-xs rounded-3xl overflow-hidden"
        style={{
          background: "hsl(0 0% 3%)",
          border: "1px solid hsl(var(--surface-border))",
          boxShadow: "0 0 40px hsl(var(--farm-green) / 0.1)",
        }}
      >
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

        {/* Leaf overlay */}
        <img
          src={leafScan}
          alt="leaf placement guide"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />

        {/* Scan line */}
        {scanState === "scanning" && (
          <div
            ref={scanLineRef}
            className="scan-animation absolute left-0 right-0 h-0.5"
            style={{ background: "hsl(var(--farm-green))", boxShadow: "0 0 8px hsl(var(--farm-green))" }}
          />
        )}

        {/* Center guide text */}
        {scanState === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs font-mono text-center px-6" style={{ color: "hsl(var(--farm-green) / 0.7)" }}>
              Place leaf within frame
            </p>
          </div>
        )}

        {scanState === "scanning" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Zap size={28} className="glyph-blink" style={{ color: "hsl(var(--farm-green))" }} />
            <p className="text-xs font-mono" style={{ color: "hsl(var(--farm-green))" }}>
              Analyzing...
            </p>
          </div>
        )}

        {scanState === "result" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <CheckCircle2 size={36} style={{ color: "hsl(var(--farm-green))" }} />
            <p className="text-xs font-mono" style={{ color: "hsl(var(--farm-green))" }}>
              Scan complete
            </p>
          </div>
        )}
      </div>

      {/* Shutter button */}
      <button
        onClick={scanState === "idle" ? handleCapture : () => { setScanState("idle"); }}
        disabled={scanState === "scanning"}
        className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-40 pulse-green"
        style={{
          background: scanState === "result" ? "hsl(var(--surface-elevated))" : "hsl(var(--farm-green))",
          boxShadow: scanState === "scanning" ? "none" : "0 0 24px hsl(var(--farm-green) / 0.5)",
        }}
      >
        {scanState === "result" ? (
          <Camera size={28} style={{ color: "hsl(var(--foreground-muted))" }} />
        ) : (
          <Camera size={28} style={{ color: "hsl(var(--primary-foreground))" }} />
        )}
      </button>

      <p className="text-xs text-foreground-muted font-mono">
        {scanState === "idle" && "Tap to capture"}
        {scanState === "scanning" && "Running on-device model..."}
        {scanState === "result" && "Tap to scan again"}
      </p>

      {/* Result bottom sheet */}
      <BottomSheet
        open={resultSheetOpen}
        onClose={() => setResultSheetOpen(false)}
        title="Diagnosis Result"
        accentColor="amber"
      >
        <div className="space-y-4">
          {/* Disease name */}
          <div>
            <p className="text-xs font-mono text-foreground-muted mb-1">Detected</p>
            <h3 className="text-2xl font-semibold text-foreground">{disease.name}</h3>
          </div>

          {/* Severity bar */}
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-foreground-muted font-mono">Severity</span>
              <span className="font-mono font-bold" style={{ color: "hsl(var(--alert-amber))" }}>
                {Math.round(disease.severity * 100)}%
              </span>
            </div>
            <div className="severity-bar">
              <div
                className="severity-fill"
                style={{
                  "--severity": `${disease.severity * 100}%`,
                  background:
                    disease.severity > 0.7
                      ? "hsl(0 72% 55%)"
                      : disease.severity > 0.4
                      ? "hsl(var(--alert-amber))"
                      : "hsl(var(--farm-green))",
                } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Treatments */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="p-3 rounded-xl"
              style={{ background: "hsl(var(--farm-green) / 0.08)", border: "1px solid hsl(var(--farm-green) / 0.2)" }}
            >
              <p className="text-[9px] font-mono uppercase tracking-wider mb-2" style={{ color: "hsl(var(--farm-green))" }}>
                🌿 Organic
              </p>
              {disease.organic.map((t, i) => (
                <p key={i} className="text-xs text-foreground leading-snug mb-1">• {t}</p>
              ))}
            </div>
            <div
              className="p-3 rounded-xl"
              style={{ background: "hsl(var(--market-blue) / 0.08)", border: "1px solid hsl(var(--market-blue) / 0.2)" }}
            >
              <p className="text-[9px] font-mono uppercase tracking-wider mb-2" style={{ color: "hsl(var(--market-blue))" }}>
                🧪 Chemical
              </p>
              {disease.chemical.map((t, i) => (
                <p key={i} className="text-xs text-foreground leading-snug mb-1">• {t}</p>
              ))}
            </div>
          </div>

          {/* Remind me */}
          <button
            onClick={() => setRemindSet(true)}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background: remindSet ? "hsl(var(--surface-elevated))" : "hsl(var(--alert-amber))",
              color: remindSet ? "hsl(var(--foreground))" : "hsl(var(--background))",
              border: remindSet ? "1px solid hsl(var(--alert-amber) / 0.4)" : "none",
            }}
          >
            {remindSet ? (
              <>
                <CheckCircle2 size={15} style={{ color: "hsl(var(--alert-amber))" }} />
                Reminder set!
              </>
            ) : (
              <>
                <Clock size={15} />
                Remind me to spray
              </>
            )}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
