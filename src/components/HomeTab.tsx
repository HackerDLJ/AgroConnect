import { AdvisoryCard } from "@/components/AdvisoryCard";
import { CloudRain, Thermometer, Wind, LayoutDashboard, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWeather } from "@/hooks/useWeather";

const ADVISORY_DATA = {
  cropName: "Tomato",
  cropStage: "Flowering",
  weekStart: "Week of Feb 17",
  actions: [
    { icon: "💧", text: "Water twice daily — 30 mins each session", type: "water" as const },
    { icon: "⚡", text: "Apply potassium sulfate 2g/L foliar spray", type: "fertilizer" as const },
    { icon: "⚠️", text: "Heat stress risk Thu–Fri. Shade net recommended.", type: "alert" as const },
  ],
};

export function HomeTab({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const weather = useWeather();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Farmer";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "காலை வணக்கம் (Good morning)" :
    hour < 17 ? "மதிய வணக்கம் (Good afternoon)" :
    "மாலை வணக்கம் (Good evening)";

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono text-foreground-muted">{greeting}</p>
          <h1 className="text-2xl font-bold text-foreground mt-0.5">{displayName}</h1>
        </div>
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono"
          style={{
            background: "hsl(var(--surface-elevated))",
            color: "hsl(var(--foreground-muted))",
            border: "1px solid hsl(var(--surface-border))",
          }}
        >
          <LayoutDashboard size={12} />
          Admin
        </button>
      </div>

      {/* Real-time Weather strip */}
      <div
        className="nothing-card flex items-center gap-0 p-0 overflow-hidden"
        style={{ border: "1px solid hsl(var(--market-blue) / 0.2)" }}
      >
        {weather.isLoading ? (
          <div className="flex-1 flex items-center justify-center py-4">
            <span className="text-[10px] font-mono text-foreground-muted">Loading weather...</span>
          </div>
        ) : (
          [
            {
              icon: CloudRain,
              label: "Rain",
              value: weather.rain > 0 ? `${weather.rain}mm` : "Dry",
              color: "var(--market-blue)",
              warn: weather.rain > 10,
            },
            {
              icon: Thermometer,
              label: "Temp",
              value: `${weather.temperature}°C`,
              color: weather.temperature > 35 ? "var(--alert-amber)" : "var(--farm-green)",
              warn: weather.temperature > 35,
            },
            {
              icon: Wind,
              label: "Wind",
              value: `${weather.windspeed} km/h`,
              color: "var(--farm-green)",
              warn: false,
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center py-3 gap-1"
                style={{ borderRight: i < 2 ? "1px solid hsl(var(--surface-border))" : "none" }}
              >
                <Icon size={16} style={{ color: `hsl(${item.color})` }} />
                <p className="text-[10px] text-foreground-muted font-mono">{item.label}</p>
                <p
                  className="text-xs font-semibold"
                  style={{ color: item.warn ? "hsl(var(--alert-amber))" : "hsl(var(--foreground))" }}
                >
                  {item.value}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Weather alert */}
      {weather.alert && (
        <div
          className="nothing-card p-3 flex items-center gap-3"
          style={{ background: "hsl(var(--alert-amber) / 0.06)", borderColor: "hsl(var(--alert-amber) / 0.25)" }}
        >
          <AlertTriangle size={14} style={{ color: "hsl(var(--alert-amber))", flexShrink: 0 }} />
          <p className="text-xs text-foreground-muted flex-1">{weather.alert}</p>
          <span className="glyph-dot-amber flex-shrink-0" />
        </div>
      )}

      {/* Advisory card */}
      <AdvisoryCard {...ADVISORY_DATA} />

      {/* Quick action cards */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate("scan")}
          className="nothing-card card-farm p-4 text-left cursor-pointer flex flex-col gap-3"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "hsl(var(--farm-green) / 0.15)" }}>
            🔬
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Scan Leaf</h3>
            <p className="text-[10px] text-foreground-muted">AI pest diagnosis</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate("market")}
          className="nothing-card card-market p-4 text-left cursor-pointer flex flex-col gap-3"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "hsl(var(--market-blue) / 0.15)" }}>
            🛒
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Marketplace</h3>
            <p className="text-[10px] text-foreground-muted">Sell your produce</p>
          </div>
        </button>
      </div>

      {/* Helpdesk quick access */}
      <button
        onClick={() => onNavigate("support")}
        className="nothing-card w-full p-4 flex items-center gap-3 text-left"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "hsl(var(--alert-amber) / 0.15)" }}>
          💬
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-sm">Help & Support</h3>
          <p className="text-[10px] text-foreground-muted">Chat with our helpdesk</p>
        </div>
        <span className="glyph-dot" />
      </button>

      {/* Scheme highlight */}
      <div className="nothing-card card-alert p-4 flex items-center gap-3">
        <span className="text-2xl">📋</span>
        <div className="flex-1">
          <p className="text-xs font-mono text-foreground-muted">New scheme</p>
          <p className="text-sm font-semibold text-foreground">PM-KISAN: ₹2000 due Feb 15</p>
        </div>
        <div className="glyph-dot-amber" />
      </div>
    </div>
  );
}
