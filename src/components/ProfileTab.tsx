import { Sprout, Phone, ChevronRight, LogOut } from "lucide-react";

const PROFILE = {
  name: "Ravi Kumar",
  phone: "+91 98765 43210",
  language: "Tamil",
  farm: {
    crop: "Tomato",
    soilType: "Red loamy",
    size: "2.5 acres",
    location: "Coimbatore, TN",
  },
};

const MENU_ITEMS = [
  { label: "Edit farm details", icon: Sprout },
  { label: "Change language", icon: Phone },
  { label: "Help & support", icon: Phone },
];

export function ProfileTab() {
  return (
    <div className="space-y-5">
      {/* Avatar section */}
      <div className="nothing-card p-5 flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
          style={{ background: "hsl(var(--farm-green) / 0.15)", border: "1px solid hsl(var(--farm-green) / 0.3)" }}
        >
          <span style={{ color: "hsl(var(--farm-green))" }}>
            {PROFILE.name.charAt(0)}
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-lg">{PROFILE.name}</h3>
          <p className="text-xs text-foreground-muted font-mono">{PROFILE.phone}</p>
          <div
            className="text-[10px] font-mono px-2 py-0.5 rounded-md mt-1 inline-block"
            style={{ background: "hsl(var(--farm-green) / 0.1)", color: "hsl(var(--farm-green))" }}
          >
            FARMER
          </div>
        </div>
      </div>

      {/* Farm details */}
      <div className="nothing-card card-farm p-5">
        <h4 className="text-xs font-mono uppercase tracking-wider text-foreground-muted mb-3">My Farm</h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Crop", value: PROFILE.farm.crop },
            { label: "Soil type", value: PROFILE.farm.soilType },
            { label: "Farm size", value: PROFILE.farm.size },
            { label: "Location", value: PROFILE.farm.location },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[10px] text-foreground-muted mb-0.5">{item.label}</p>
              <p className="text-sm font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="nothing-card overflow-hidden">
        {MENU_ITEMS.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={i}
              className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-elevated"
              style={{
                borderBottom: i < MENU_ITEMS.length - 1 ? "1px solid hsl(var(--surface-border))" : "none",
              }}
            >
              <Icon size={16} className="text-foreground-muted" />
              <span className="text-sm text-foreground flex-1">{item.label}</span>
              <ChevronRight size={14} className="text-foreground-dim" />
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <button
        className="w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
        style={{
          background: "hsl(0 72% 55% / 0.1)",
          color: "hsl(var(--destructive))",
          border: "1px solid hsl(0 72% 55% / 0.2)",
        }}
      >
        <LogOut size={15} />
        Log out
      </button>
    </div>
  );
}
