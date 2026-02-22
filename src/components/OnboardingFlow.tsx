import { useState } from "react";
import { Check, ChevronRight, MapPin, Globe } from "lucide-react";
import { useLanguage, SUPPORTED_LANGUAGES } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface OnboardingFlowProps {
  onComplete: () => void;
}

const CROPS = ["Tomato", "Onion", "Brinjal", "Chilli", "Paddy", "Sugarcane", "Cotton", "Maize", "Groundnut", "Turmeric"];
const SOILS = ["Red loamy", "Black cotton", "Sandy", "Alluvial", "Laterite", "Clay"];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  // Farm details state
  const [crop, setCrop] = useState("");
  const [soil, setSoil] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [location, setLocation] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);

  const filtered = SUPPORTED_LANGUAGES.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.native.toLowerCase().includes(search.toLowerCase())
  );

  const getGPS = () => {
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        setGettingLocation(false);
      },
      () => {
        setLocation("Coimbatore, TN");
        setGettingLocation(false);
      },
      { timeout: 5000 }
    );
  };

  const handleFinish = () => {
    // Save farm details to localStorage (in production, save to Supabase)
    const farmData = { crop, soil, farmSize, location };
    localStorage.setItem("agro_farm_profile", JSON.stringify(farmData));
    localStorage.setItem("agro_onboarded", "true");
    onComplete();
  };

  const steps = [
    {
      icon: "🗣️",
      title: "Choose Language",
      subtitle: "Select your preferred language",
    },
    {
      icon: "🏡",
      title: "Farm Details",
      subtitle: "Tell us about your farm",
    },
    {
      icon: "✅",
      title: "All set!",
      subtitle: "Start farming smarter",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8" style={{ background: "hsl(var(--background))" }}>
      <div className="w-full max-w-sm space-y-6">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all"
                style={{
                  background: i <= step ? "hsl(var(--farm-green) / 0.2)" : "hsl(var(--surface-border))",
                  border: `1px solid ${i <= step ? "hsl(var(--farm-green) / 0.4)" : "hsl(var(--surface-border))"}`,
                }}
              >
                {i < step ? <Check size={12} style={{ color: "hsl(var(--farm-green))" }} /> : <span>{s.icon}</span>}
              </div>
              {i < steps.length - 1 && (
                <div className="w-8 h-0.5 rounded-full" style={{ background: i < step ? "hsl(var(--farm-green))" : "hsl(var(--surface-border))" }} />
              )}
            </div>
          ))}
        </div>

        {/* Step header */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">{steps[step].title}</h2>
          <p className="text-sm text-foreground-muted mt-1">{steps[step].subtitle}</p>
        </div>

        {/* Step 0: Language */}
        {step === 0 && (
          <div className="space-y-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search language..."
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "hsl(var(--surface-elevated))", border: "1px solid hsl(var(--surface-border))", color: "hsl(var(--foreground))" }}
            />
            <div className="max-h-64 overflow-y-auto space-y-1">
              {filtered.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                  style={{
                    background: language === lang.code ? "hsl(var(--farm-green) / 0.1)" : "transparent",
                    border: `1px solid ${language === lang.code ? "hsl(var(--farm-green) / 0.3)" : "transparent"}`,
                  }}
                >
                  <Globe size={14} style={{ color: language === lang.code ? "hsl(var(--farm-green))" : "hsl(var(--foreground-muted))" }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{lang.native}</p>
                    <p className="text-xs text-foreground-muted">{lang.name}</p>
                  </div>
                  {language === lang.code && <Check size={14} style={{ color: "hsl(var(--farm-green))" }} />}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
              style={{ background: "hsl(var(--farm-green))", color: "hsl(var(--primary-foreground))" }}
            >
              Continue <ChevronRight size={15} />
            </button>
          </div>
        )}

        {/* Step 1: Farm details */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-foreground-muted block mb-2">Crop</label>
              <div className="flex flex-wrap gap-2">
                {CROPS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCrop(c)}
                    className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                    style={{
                      background: crop === c ? "hsl(var(--farm-green) / 0.2)" : "hsl(var(--surface-elevated))",
                      border: `1px solid ${crop === c ? "hsl(var(--farm-green) / 0.4)" : "hsl(var(--surface-border))"}`,
                      color: crop === c ? "hsl(var(--farm-green))" : "hsl(var(--foreground))",
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
                    onClick={() => setSoil(s)}
                    className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                    style={{
                      background: soil === s ? "hsl(var(--farm-green) / 0.2)" : "hsl(var(--surface-elevated))",
                      border: `1px solid ${soil === s ? "hsl(var(--farm-green) / 0.4)" : "hsl(var(--surface-border))"}`,
                      color: soil === s ? "hsl(var(--farm-green))" : "hsl(var(--foreground))",
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
                value={farmSize}
                onChange={(e) => setFarmSize(e.target.value)}
                placeholder="e.g. 2.5"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "hsl(var(--surface-elevated))", border: "1px solid hsl(var(--surface-border))", color: "hsl(var(--foreground))" }}
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-foreground-muted block mb-2">Location</label>
              <div className="flex gap-2">
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Coimbatore, TN"
                  className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "hsl(var(--surface-elevated))", border: "1px solid hsl(var(--surface-border))", color: "hsl(var(--foreground))" }}
                />
                <button
                  onClick={getGPS}
                  disabled={gettingLocation}
                  className="px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  style={{ background: "hsl(var(--market-blue) / 0.15)", color: "hsl(var(--market-blue))", border: "1px solid hsl(var(--market-blue) / 0.3)" }}
                >
                  <MapPin size={12} />
                  {gettingLocation ? "..." : "GPS"}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(0)}
                className="flex-1 py-4 rounded-xl font-semibold text-sm"
                style={{ background: "hsl(var(--surface-elevated))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--surface-border))" }}
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!crop || !soil}
                className="flex-1 py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: "hsl(var(--farm-green))", color: "hsl(var(--primary-foreground))" }}
              >
                Continue <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Complete */}
        {step === 2 && (
          <div className="space-y-5 text-center">
            <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl" style={{ background: "hsl(var(--farm-green) / 0.15)", border: "1px solid hsl(var(--farm-green) / 0.3)" }}>
              🎉
            </div>
            <div>
              <p className="text-foreground text-sm">Your farm profile is ready!</p>
              <div className="nothing-card p-4 mt-3 text-left space-y-2">
                {[
                  { label: "Crop", value: crop },
                  { label: "Soil", value: soil },
                  { label: "Size", value: farmSize ? `${farmSize} acres` : "Not set" },
                  { label: "Location", value: location || "Not set" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-xs text-foreground-muted">{item.label}</span>
                    <span className="text-xs font-semibold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={handleFinish}
              className="w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
              style={{ background: "hsl(var(--farm-green))", color: "hsl(var(--primary-foreground))" }}
            >
              🌱 Start farming smarter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
