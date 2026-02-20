import { Sprout, Phone, ChevronRight, LogOut, Globe, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, SUPPORTED_LANGUAGES } from "@/contexts/LanguageContext";
import { useState } from "react";
import { BottomSheet } from "./BottomSheet";

export function ProfileTab() {
  const { user, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [langSheetOpen, setLangSheetOpen] = useState(false);
  const [search, setSearch] = useState("");

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Farmer";
  const initials = displayName.charAt(0).toUpperCase();
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const filtered = SUPPORTED_LANGUAGES.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.native.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Avatar section */}
      <div className="nothing-card p-5 flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
          style={{ background: "hsl(var(--farm-green) / 0.15)", border: "1px solid hsl(var(--farm-green) / 0.3)" }}
        >
          <span style={{ color: "hsl(var(--farm-green))" }}>{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-lg truncate">{displayName}</h3>
          <p className="text-xs text-foreground-muted font-mono truncate">{user?.email || user?.phone || "—"}</p>
          <div className="text-[10px] font-mono px-2 py-0.5 rounded-md mt-1 inline-block" style={{ background: "hsl(var(--farm-green) / 0.1)", color: "hsl(var(--farm-green))" }}>
            FARMER
          </div>
        </div>
      </div>

      {/* Farm details */}
      <div className="nothing-card card-farm p-5">
        <h4 className="text-xs font-mono uppercase tracking-wider text-foreground-muted mb-3">My Farm</h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Crop", value: "Tomato" },
            { label: "Soil type", value: "Red loamy" },
            { label: "Farm size", value: "2.5 acres" },
            { label: "Location", value: "Coimbatore, TN" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[10px] text-foreground-muted mb-0.5">{item.label}</p>
              <p className="text-sm font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Language selector */}
      <button
        onClick={() => setLangSheetOpen(true)}
        className="nothing-card w-full p-4 flex items-center gap-3 text-left"
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--market-blue) / 0.1)" }}>
          <Globe size={16} style={{ color: "hsl(var(--market-blue))" }} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Language</p>
          <p className="text-xs text-foreground-muted">{currentLang.native} ({currentLang.name})</p>
        </div>
        <ChevronRight size={14} className="text-foreground-dim" />
      </button>

      {/* Menu */}
      <div className="nothing-card overflow-hidden">
        {[
          { label: "Edit farm details", icon: Sprout },
          { label: "Help & support", icon: Phone },
        ].map((item, i, arr) => {
          const Icon = item.icon;
          return (
            <button
              key={i}
              className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-elevated"
              style={{ borderBottom: i < arr.length - 1 ? "1px solid hsl(var(--surface-border))" : "none" }}
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
        onClick={signOut}
        className="w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
        style={{ background: "hsl(0 72% 55% / 0.1)", color: "hsl(var(--destructive))", border: "1px solid hsl(0 72% 55% / 0.2)" }}
      >
        <LogOut size={15} />
        Log out
      </button>

      {/* Language selector bottom sheet */}
      <BottomSheet open={langSheetOpen} onClose={() => setLangSheetOpen(false)} title="Choose Language" accentColor="blue">
        <div className="space-y-3">
          <p className="text-xs text-foreground-muted">Select your preferred language. Content will be auto-translated.</p>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search language..."
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: "hsl(var(--surface-border))", color: "hsl(var(--foreground))" }}
          />
          <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
            {filtered.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setLangSheetOpen(false); setSearch(""); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                style={{
                  background: language === lang.code ? "hsl(var(--market-blue) / 0.1)" : "transparent",
                  border: `1px solid ${language === lang.code ? "hsl(var(--market-blue) / 0.3)" : "transparent"}`,
                }}
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{lang.native}</p>
                  <p className="text-xs text-foreground-muted">{lang.name}</p>
                </div>
                {language === lang.code && <Check size={14} style={{ color: "hsl(var(--market-blue))" }} />}
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
