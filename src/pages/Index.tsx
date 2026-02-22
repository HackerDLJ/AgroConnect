import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { HomeTab } from "@/components/HomeTab";
import { MarketplaceTab } from "@/components/MarketplaceTab";
import { AlertsTab } from "@/components/AlertsTab";
import { ScanTab } from "@/components/ScanTab";
import { ProfileTab } from "@/components/ProfileTab";
import { HelpdeskChat } from "@/components/HelpdeskChat";
import { OnboardingFlow } from "@/components/OnboardingFlow";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem("agro_onboarded");
  });
  const notificationCount = 2;

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "hsl(var(--background))" }}>
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
          <span className="text-foreground-muted">
            {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })}
          </span>
          <span className="font-bold tracking-widest" style={{ color: "hsl(var(--farm-green))" }}>
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
          {activeTab === "support" && <HelpdeskChat />}
        </div>

        {/* Bottom navigation */}
        <BottomNav active={activeTab} onNavigate={setActiveTab} notificationCount={notificationCount} />
      </div>
    </div>
  );
};

export default Index;
