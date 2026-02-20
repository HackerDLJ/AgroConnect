import { useState, useRef, useCallback } from "react";
import { ChevronRight, Droplets, Zap, AlertTriangle, Volume2, VolumeX, Calendar } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { useWeather } from "@/hooks/useWeather";

interface AdvisoryCardProps {
  cropStage: string;
  cropName: string;
  weekStart: string;
  actions: { icon: string; text: string; type: "water" | "fertilizer" | "alert" }[];
}

const stageColors = {
  "Germination": "hsl(var(--farm-green))",
  "Vegetative": "hsl(var(--farm-green))",
  "Flowering": "hsl(var(--alert-amber))",
  "Fruiting": "hsl(var(--alert-amber))",
  "Harvest": "hsl(var(--market-blue))",
};

const actionIcons = {
  water: Droplets,
  fertilizer: Zap,
  alert: AlertTriangle,
};

const actionColors = {
  water: "hsl(var(--market-blue))",
  fertilizer: "hsl(var(--farm-green))",
  alert: "hsl(var(--alert-amber))",
};

const WEEKLY_SCHEDULE = [
  { day: "Mon–Tue", task: "Apply NPK 19:19:19 at 50g/plant. Water at 6 AM, 6 PM." },
  { day: "Wed", task: "Scout for stem borer. Spray neem oil if infestation > 5%." },
  { day: "Thu–Fri", task: "Skip irrigation — rain forecast. Check drainage." },
  { day: "Sat–Sun", task: "Apply urea top-dressing. Record leaf color index." },
];

const TAMIL_ADVISORY = `இந்த வாரம் தக்காளி பயிர் மலர்ச்சி நிலையில் உள்ளது. 
திங்கள் மற்றும் செவ்வாய் கிழமைகளில் NPK உரம் 50 கிராம் ஒவ்வொரு செடிக்கும் இடவும். 
காலை 6 மணிக்கும் மாலை 6 மணிக்கும் நீர் பாய்ச்சவும். 
வியாழன் மற்றும் வெள்ளிக்கிழமைகளில் மழை வாய்ப்பு இருப்பதால் நீர் பாய்ச்சுவதை தவிர்க்கவும்.
வெப்ப அழுத்த அபாயம் உள்ளதால் நிழல் வலை பயன்படுத்தவும்.`;

export function AdvisoryCard({ cropStage, cropName, weekStart, actions }: AdvisoryCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const weather = useWeather();

  const stageColor = stageColors[cropStage as keyof typeof stageColors] || "hsl(var(--farm-green))";

  const playTamil = useCallback(() => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(TAMIL_ADVISORY);
    utterance.lang = "ta-IN";
    utterance.rate = 0.85;
    utterance.pitch = 1;

    // Try to find a Tamil voice
    const voices = window.speechSynthesis.getVoices();
    const tamilVoice = voices.find((v) => v.lang.startsWith("ta") || v.name.toLowerCase().includes("tamil"));
    if (tamilVoice) utterance.voice = tamilVoice;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  }, [isPlaying]);

  return (
    <>
      <div
        className="nothing-card card-farm p-5 cursor-pointer select-none"
        onClick={() => setSheetOpen(true)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="glyph-dot" />
              <span className="text-xs font-mono text-foreground-muted uppercase tracking-wider">AI Advisory</span>
            </div>
            <h2 className="text-xl font-semibold text-foreground">{cropName}</h2>
          </div>
          <div className="text-right">
            <div
              className="text-xs font-mono px-2 py-1 rounded-lg"
              style={{ background: `${stageColor}20`, color: stageColor, border: `1px solid ${stageColor}40` }}
            >
              {cropStage}
            </div>
            <p className="text-[10px] text-foreground-muted mt-1 font-mono">{weekStart}</p>
          </div>
        </div>

        {/* Weather alert banner (if any) */}
        {!weather.isLoading && weather.alert && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 text-xs"
            style={{ background: "hsl(var(--alert-amber) / 0.1)", border: "1px solid hsl(var(--alert-amber) / 0.25)" }}
          >
            <AlertTriangle size={12} style={{ color: "hsl(var(--alert-amber))", flexShrink: 0 }} />
            <span className="text-foreground-muted leading-snug">{weather.alert}</span>
          </div>
        )}

        {/* Stage progress bar */}
        <div className="relative h-1 w-full rounded-full mb-4" style={{ background: "hsl(var(--surface-border))" }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: cropStage === "Germination" ? "15%" : cropStage === "Vegetative" ? "45%" : cropStage === "Flowering" ? "65%" : cropStage === "Fruiting" ? "82%" : "100%",
              background: stageColor,
              boxShadow: `0 0 8px ${stageColor}60`,
            }}
          />
        </div>

        {/* Action bullets */}
        <div className="space-y-2.5 mb-4">
          {actions.map((action, i) => {
            const Icon = actionIcons[action.type];
            const color = actionColors[action.type];
            return (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                >
                  <Icon size={13} style={{ color }} />
                </div>
                <span className="text-sm text-foreground leading-snug">{action.text}</span>
              </div>
            );
          })}
        </div>

        {/* Tap to expand */}
        <div className="flex items-center gap-2 pt-3 border-t border-surface-border">
          <span className="text-xs text-foreground-muted flex-1">Tap to expand full plan</span>
          <ChevronRight size={14} className="text-foreground-muted" />
        </div>
      </div>

      {/* Bottom Sheet */}
      <BottomSheet open={sheetOpen} onClose={() => { setSheetOpen(false); window.speechSynthesis.cancel(); setIsPlaying(false); }} title={`${cropName} — Weekly Plan`} accentColor="green">
        <div className="space-y-4">
          {/* Real-time weather strip */}
          {!weather.isLoading && (
            <div
              className="grid grid-cols-3 gap-0 rounded-xl overflow-hidden"
              style={{ border: "1px solid hsl(var(--market-blue) / 0.2)" }}
            >
              {[
                { label: "Temp", value: `${weather.temperature}°C`, warn: weather.temperature > 35 },
                { label: "Rain", value: `${weather.rain}mm`, warn: weather.rain > 10 },
                { label: "Wind", value: `${weather.windspeed} km/h`, warn: false },
              ].map((w, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center py-2.5"
                  style={{ borderRight: i < 2 ? "1px solid hsl(var(--surface-border))" : "none" }}
                >
                  <p className="text-[9px] font-mono text-foreground-muted">{w.label}</p>
                  <p
                    className="text-sm font-mono font-bold mt-0.5"
                    style={{ color: w.warn ? "hsl(var(--alert-amber))" : "hsl(var(--foreground))" }}
                  >
                    {w.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Voice play button */}
          <button
            onClick={playTamil}
            className="flex items-center gap-3 w-full p-3 rounded-xl text-left transition-all"
            style={{
              background: isPlaying ? "hsl(var(--farm-green) / 0.15)" : "hsl(var(--farm-green) / 0.08)",
              border: `1px solid hsl(var(--farm-green) / ${isPlaying ? "0.4" : "0.2"})`,
            }}
          >
            {isPlaying ? (
              <VolumeX size={16} style={{ color: "hsl(var(--farm-green))" }} />
            ) : (
              <Volume2 size={16} style={{ color: "hsl(var(--farm-green))" }} />
            )}
            <span className="text-sm text-foreground flex-1">
              {isPlaying ? "Playing in Tamil..." : "Listen in Tamil"}
            </span>
            <span className="text-[10px] font-mono text-foreground-muted">
              {isPlaying ? "■ STOP" : "▶ PLAY"}
            </span>
          </button>

          {/* Weather alert in sheet */}
          {weather.alert && (
            <div className="p-3 rounded-xl flex gap-3 items-start" style={{ background: "hsl(var(--alert-amber) / 0.08)", border: "1px solid hsl(var(--alert-amber) / 0.2)" }}>
              <AlertTriangle size={14} style={{ color: "hsl(var(--alert-amber))", marginTop: 2 }} />
              <p className="text-sm text-foreground">{weather.alert}</p>
            </div>
          )}

          {/* Detailed schedule */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-foreground-muted mb-3">This week's schedule</h4>
            <div className="space-y-3">
              {WEEKLY_SCHEDULE.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="text-[10px] font-mono w-16 flex-shrink-0 py-0.5" style={{ color: "hsl(var(--farm-green))" }}>
                    {item.day}
                  </div>
                  <p className="text-sm text-foreground leading-snug">{item.task}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
            style={{ background: "hsl(var(--farm-green))", color: "hsl(var(--primary-foreground))" }}
          >
            <Calendar size={15} />
            Save to my calendar
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
