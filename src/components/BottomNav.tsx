import { Home, Scan, ShoppingBasket, Bell, User } from "lucide-react";

interface BottomNavProps {
  active: string;
  onNavigate: (tab: string) => void;
  notificationCount?: number;
}

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "scan", label: "Scan", icon: Scan },
  { id: "market", label: "Market", icon: ShoppingBasket },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "profile", label: "Profile", icon: User },
];

export function BottomNav({ active, onNavigate, notificationCount = 0 }: BottomNavProps) {
  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-3 pb-safe max-w-md mx-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className="relative flex flex-col items-center gap-1 min-w-[56px] min-h-[56px] justify-center rounded-2xl transition-all duration-200"
            style={{
              color: isActive ? `hsl(var(--farm-green))` : `hsl(var(--foreground-muted))`,
            }}
          >
            <div
              className={`p-2 rounded-xl transition-all duration-200 ${
                isActive ? "bg-farm/10" : ""
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
            </div>
            {tab.id === "alerts" && notificationCount > 0 && (
              <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-amber-alert text-background text-[9px] font-bold flex items-center justify-center glyph-blink">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
            <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            {isActive && (
              <span
                className="absolute bottom-0 w-1 h-1 rounded-full"
                style={{ background: `hsl(var(--farm-green))` }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
