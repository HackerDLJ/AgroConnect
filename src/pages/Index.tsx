import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { AdvisoryCard } from "@/components/AdvisoryCard";
import { MarketplaceTab } from "@/components/MarketplaceTab";
import { AlertsTab } from "@/components/AlertsTab";
import { ScanTab } from "@/components/ScanTab";
import { ProfileTab } from "@/components/ProfileTab";
import { CloudRain, Thermometer, Wind, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

function HomeTab({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono text-foreground-muted">வணக்கம் (Good morning)</p>
          <h1 className="text-2xl font-bold text-foreground mt-0.5">Ravi Kumar</h1>
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

      {/* Weather strip */}
      <div
        className="nothing-card flex items-center gap-0 p-0 overflow-hidden"
        style={{ border: "1px solid hsl(var(--market-blue) / 0.2)" }}
      >
        {[
          { icon: CloudRain, label: "Rain", value: "Likely Thu", color: "var(--market-blue)" },
          { icon: Thermometer, label: "Temp", value: "34°C", color: "var(--alert-amber)" },
          { icon: Wind, label: "Wind", value: "12 km/h", color: "var(--farm-green)" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center py-3 gap-1"
              style={{
                borderRight: i < 2 ? "1px solid hsl(var(--surface-border))" : "none",
              }}
            >
              <Icon size={16} style={{ color: `hsl(${item.color})` }} />
              <p className="text-[10px] text-foreground-muted font-mono">{item.label}</p>
              <p className="text-xs font-semibold text-foreground">{item.value}</p>
            </div>
          );
        })}
      </div>

      {/* Advisory card */}
      <AdvisoryCard {...ADVISORY_DATA} />

      {/* Quick action cards */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate("scan")}
          className="nothing-card card-farm p-4 text-left cursor-pointer flex flex-col gap-3"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: "hsl(var(--farm-green) / 0.15)" }}
          >
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
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: "hsl(var(--market-blue) / 0.15)" }}
          >
            🛒
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Marketplace</h3>
            <p className="text-[10px] text-foreground-muted">Sell your produce</p>
          </div>
        </button>
      </div>

      {/* Scheme highlight */}
      <div
        className="nothing-card card-alert p-4 flex items-center gap-3"
      >
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

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const notificationCount = 2;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "hsl(var(--background))" }}
    >
      {/* Mobile-style container */}
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        {/* Status bar */}
        <div
          className="flex items-center justify-between px-5 py-3 text-[10px] font-mono sticky top-0 z-40"
          style={{
            background: "hsl(var(--background) / 0.9)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid hsl(var(--surface-border))",
          }}
        >
          <span className="text-foreground-muted">9:41</span>
          <span
            className="font-bold tracking-widest"
            style={{ color: "hsl(var(--farm-green))" }}
          >
            AGROCONNECT
          </span>
          <span className="text-foreground-muted">▊▊▊</span>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto px-4 pt-5 pb-28">
          {activeTab === "home" && <HomeTab onNavigate={setActiveTab} />}
          {activeTab === "scan" && <ScanTab />}
          {activeTab === "market" && <MarketplaceTab />}
          {activeTab === "alerts" && <AlertsTab />}
          {activeTab === "profile" && <ProfileTab />}
        </div>

        {/* Bottom navigation */}
        <BottomNav
          active={activeTab}
          onNavigate={setActiveTab}
          notificationCount={notificationCount}
        />
      </div>
    </div>
  );
};

export default Index;
