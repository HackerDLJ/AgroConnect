import { Sprout, Phone, ChevronRight, LogOut, Globe, Check, Save, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, SUPPORTED_LANGUAGES } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { BottomSheet } from "./BottomSheet";

const CROPS = ["Tomato", "Onion", "Brinjal", "Chilli", "Paddy", "Sugarcane", "Cotton", "Maize", "Groundnut", "Turmeric"];
const SOILS = ["Red loamy", "Black cotton", "Sandy", "Alluvial", "Laterite", "Clay"];

interface FarmProfile {
  crop: string;
  soil: string;
  farmSize: string;
  location: string;
}

function useFarmProfile() {
  const [profile, setProfile] = useState<FarmProfile>(() => {
    const saved = localStorage.getItem("agro_farm_profile");
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return { crop: "Tomato", soil: "Red loamy", farmSize: "2.5", location: "Coimbatore, TN" };
  });

  const save = (p: FarmProfile) => {
    setProfile(p);
    localStorage.setItem("agro_farm_profile", JSON.stringify(p));
  };

  return { profile, save };
}

export function ProfileTab() {
  const { user, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [langSheetOpen, setLangSheetOpen] = useState(false);
  const [farmSheetOpen, setFarmSheetOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { profile, save: saveFarm } = useFarmProfile();

  // Editable farm state
  const [editCrop, setEditCrop] = useState(profile.crop);
  const [editSoil, setEditSoil] = useState(profile.soil);
  const [editSize, setEditSize] = useState(profile.farmSize);
  const [editLocation, setEditLocation] = useState(profile.location);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (farmSheetOpen) {
      setEditCrop(profile.crop);
      setEditSoil(profile.soil);
      setEditSize(profile.farmSize);
      setEditLocation(profile.location);
      setSaved(false);
    }
  }, [farmSheetOpen, profile]);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Farmer";
  const initials = displayName.charAt(0).toUpperCase();
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const filtered = SUPPORTED_LANGUAGES.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.native.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveFarm = () => {
    saveFarm({ crop: editCrop, soil: editSoil, farmSize: editSize, location: editLocation });
    setSaved(true);
    setTimeout(() => setFarmSheetOpen(false), 800);
  };

  const getGPS = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setEditLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`),
      () => {},
      { timeout: 5000 }
    );
  };

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
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-foreground-muted">My Farm</h4>
          <button
            onClick={() => setFarmSheetOpen(true)}
            className="text-[10px] font-mono px-2 py-1 rounded-lg"
            style={{ background: "hsl(var(--farm-green) / 0.1)", color: "hsl(var(--farm-green))", border: "1px solid hsl(var(--farm-green) / 0.2)" }}
          >
            ✏️ Edit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Crop", value: profile.crop },
            { label: "Soil type", value: profile.soil },
            { label: "Farm size", value: profile.farmSize ? `${profile.farmSize} acres` : "—" },
            { label: "Location", value: profile.location || "—" },
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
          { label: "Edit farm details", icon: Sprout, action: () => setFarmSheetOpen(true) },
          { label: "Help & support", icon: Phone, action: () => {} },
        ].map((item, i, arr) => {
          const Icon = item.icon;
          return (
            <button
              key={i}
              onClick={item.action}
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

      {/* Reset onboarding */}
      <button
        onClick={() => { localStorage.removeItem("agro_onboarded"); window.location.reload(); }}
        className="w-full py-3 rounded-2xl text-xs font-mono text-foreground-muted"
        style={{ background: "hsl(var(--surface-elevated))", border: "1px solid hsl(var(--surface-border))" }}
      >
        Re-run onboarding setup
      </button>

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

      {/* Farm edit bottom sheet */}
      <BottomSheet open={farmSheetOpen} onClose={() => setFarmSheetOpen(false)} title="Edit Farm Details" accentColor="green">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-foreground-muted block mb-2">Crop</label>
            <div className="flex flex-wrap gap-2">
              {CROPS.map((c) => (
                <button
                  key={c}
                  onClick={() => setEditCrop(c)}
                  className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: editCrop === c ? "hsl(var(--farm-green) / 0.2)" : "hsl(var(--surface-elevated))",
                    border: `1px solid ${editCrop === c ? "hsl(var(--farm-green) / 0.4)" : "hsl(var(--surface-border))"}`,
                    color: editCrop === c ? "hsl(var(--farm-green))" : "hsl(var(--foreground))",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-foreground-muted block mb-2">Soil type</label>
            <div className="flex flex-wrap gap-2">
              {SOILS.map((s) => (
                <button
                  key={s}
                  onClick={() => setEditSoil(s)}
                  className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: editSoil === s ? "hsl(var(--farm-green) / 0.2)" : "hsl(var(--surface-elevated))",
                    border: `1px solid ${editSoil === s ? "hsl(var(--farm-green) / 0.4)" : "hsl(var(--surface-border))"}`,
                    color: editSoil === s ? "hsl(var(--farm-green))" : "hsl(var(--foreground))",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-foreground-muted block mb-2">Farm size (acres)</label>
            <input
              type="number"
              value={editSize}
              onChange={(e) => setEditSize(e.target.value)}
              placeholder="e.g. 2.5"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "hsl(var(--surface-border))", color: "hsl(var(--foreground))" }}
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-foreground-muted block mb-2">Location</label>
            <div className="flex gap-2">
              <input
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="Coimbatore, TN"
                className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "hsl(var(--surface-border))", color: "hsl(var(--foreground))" }}
              />
              <button
                onClick={getGPS}
                className="px-3 py-3 rounded-xl text-xs font-semibold flex items-center gap-1"
                style={{ background: "hsl(var(--market-blue) / 0.15)", color: "hsl(var(--market-blue))", border: "1px solid hsl(var(--market-blue) / 0.3)" }}
              >
                <MapPin size={12} /> GPS
              </button>
            </div>
          </div>

          <button
            onClick={handleSaveFarm}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
            style={{
              background: saved ? "hsl(var(--surface-elevated))" : "hsl(var(--farm-green))",
              color: saved ? "hsl(var(--farm-green))" : "hsl(var(--primary-foreground))",
              border: saved ? "1px solid hsl(var(--farm-green) / 0.3)" : "none",
            }}
          >
            {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save changes</>}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
