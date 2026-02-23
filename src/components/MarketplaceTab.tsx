import { useState, useCallback } from "react";
import { TrendingUp, TrendingDown, Plus, MapPin, Wifi, WifiOff, Bell, BellOff, Trash2, X, TrendingUp as MarketTrendIcon } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { useMarketCache, PriceAlert, MarketListing } from "@/hooks/useMarketCache";
import { useAuth } from "@/contexts/AuthContext";

// Market growth data (today's situation)
const MARKET_GROWTH = [
  { crop: "Tomato", today: 28, yesterday: 25, district: "Coimbatore", status: "rising" },
  { crop: "Onion", today: 18, yesterday: 19, district: "Salem", status: "falling" },
  { crop: "Brinjal", today: 22, yesterday: 21, district: "Erode", status: "rising" },
  { crop: "Chilli", today: 85, yesterday: 78, district: "Guntur", status: "rising" },
  { crop: "Paddy", today: 22, yesterday: 22, district: "Thanjavur", status: "stable" },
];

function UPIPayButton({ listing }: { listing: MarketListing }) {
  const [showWarning, setShowWarning] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowWarning(true)}
        className="flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
        style={{ background: "hsl(var(--farm-green) / 0.15)", color: "hsl(var(--farm-green))", border: "1px solid hsl(var(--farm-green) / 0.3)" }}
      >
        <span>₹</span> Pay via UPI
      </button>
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "hsl(0 0% 0% / 0.7)" }}>
          <div className="max-w-sm w-full p-5 rounded-2xl space-y-3" style={{ background: "hsl(var(--surface))", border: "1px solid hsl(var(--surface-border))" }}>
            <p className="text-sm font-semibold text-foreground">⚠️ Payment Not Available</p>
            <p className="text-xs text-foreground-muted">UPI payments require verified seller accounts. This feature is coming soon with verified merchant IDs to protect both buyers and sellers.</p>
            <button
              onClick={() => setShowWarning(false)}
              className="w-full py-2.5 rounded-xl text-xs font-semibold"
              style={{ background: "hsl(var(--surface-elevated))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--surface-border))" }}
            >
              OK, got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function PriceBandCard({ listing }: { listing: MarketListing }) {
  const bandWidth = ((listing.price - listing.fairMin) / (listing.fairMax - listing.fairMin)) * 100;
  const isUp = listing.trend > 0;

  return (
    <div className="nothing-card card-market p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-foreground-muted font-mono">{listing.farmer}</p>
          <h4 className="font-semibold text-foreground">{listing.crop}</h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin size={10} className="text-foreground-muted" />
            <span className="text-[10px] text-foreground-muted">{listing.location}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-mono font-bold text-foreground">₹{listing.price}</p>
          <p className="text-[10px] text-foreground-muted">per kg · {listing.qty}</p>
          <div className={`flex items-center gap-0.5 justify-end text-[10px] font-mono mt-0.5 ${isUp ? "trend-up" : "trend-down"}`}>
            {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(listing.trend)}%
          </div>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-[9px] font-mono text-foreground-muted mb-1">
          <span>₹{listing.fairMin} Fair band</span>
          <span>₹{listing.fairMax}</span>
        </div>
        <div className="relative h-1.5 rounded-full" style={{ background: "hsl(var(--surface-border))" }}>
          <div className="absolute h-full rounded-full" style={{ left: "0%", width: "100%", background: "hsl(var(--market-blue) / 0.2)" }} />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2"
            style={{
              left: `calc(${Math.min(Math.max(bandWidth, 0), 100)}% - 6px)`,
              background: "hsl(var(--market-blue))",
              borderColor: "hsl(var(--background))",
              boxShadow: "var(--shadow-blue)",
            }}
          />
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          className="flex-1 py-2 rounded-xl text-xs font-semibold"
          style={{ background: "hsl(var(--market-blue) / 0.15)", color: "hsl(var(--market-blue))", border: "1px solid hsl(var(--market-blue) / 0.25)" }}
        >
          💬 Chat
        </button>
        <button
          className="flex-1 py-2 rounded-xl text-xs font-semibold"
          style={{ background: "hsl(var(--surface-elevated))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--surface-border))" }}
        >
          📞 Call
        </button>
        <UPIPayButton listing={listing} />
      </div>
    </div>
  );
}

function MarketGrowthSection() {
  return (
    <div className="nothing-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <MarketTrendIcon size={14} style={{ color: "hsl(var(--market-blue))" }} />
        <h3 className="text-sm font-semibold text-foreground">Today's Market Situation</h3>
        <span className="ml-auto text-[9px] font-mono text-foreground-muted">LIVE</span>
        <span className="w-1.5 h-1.5 rounded-full glyph-dot" style={{ background: "hsl(var(--farm-green))" }} />
      </div>
      <div className="space-y-2">
        {MARKET_GROWTH.map((m) => {
          const change = m.today - m.yesterday;
          const pct = m.yesterday > 0 ? ((change / m.yesterday) * 100).toFixed(1) : "0";
          return (
            <div key={m.crop} className="flex items-center gap-3">
              <div className="w-20 flex-shrink-0">
                <p className="text-xs font-semibold text-foreground">{m.crop}</p>
                <p className="text-[9px] text-foreground-muted font-mono">{m.district}</p>
              </div>
              <div className="flex-1 relative h-1.5 rounded-full" style={{ background: "hsl(var(--surface-border))" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min((m.today / 100) * 100, 100)}%`,
                    background: m.status === "rising" ? "hsl(var(--farm-green))" : m.status === "falling" ? "hsl(0 72% 55%)" : "hsl(var(--foreground-muted))",
                  }}
                />
              </div>
              <div className="text-right w-20">
                <p className="text-xs font-mono font-bold text-foreground">₹{m.today}/kg</p>
                <p
                  className="text-[9px] font-mono"
                  style={{ color: change > 0 ? "hsl(var(--farm-green))" : change < 0 ? "hsl(0 72% 55%)" : "hsl(var(--foreground-muted))" }}
                >
                  {change > 0 ? "+" : ""}{pct}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PriceAlertSheet({
  open, onClose, alerts, onSave, onRemove
}: {
  open: boolean;
  onClose: () => void;
  alerts: PriceAlert[];
  onSave: (a: PriceAlert) => void;
  onRemove: (id: string) => void;
}) {
  const [crop, setCrop] = useState("");
  const [region, setRegion] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [direction, setDirection] = useState<"above" | "below">("above");

  const handleAdd = () => {
    if (!crop || !targetPrice) return;
    onSave({
      id: Date.now().toString(),
      crop,
      region: region || "All",
      targetPrice: Number(targetPrice),
      direction,
      enabled: true,
    });
    setCrop(""); setRegion(""); setTargetPrice("");
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Price Alerts" accentColor="amber">
      <div className="space-y-4">
        <p className="text-xs text-foreground-muted">Get notified when crop prices cross your target.</p>

        {/* Existing alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "hsl(var(--surface-elevated))", border: "1px solid hsl(var(--surface-border))" }}>
                <Bell size={13} style={{ color: a.enabled ? "hsl(var(--alert-amber))" : "hsl(var(--foreground-muted))" }} />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">{a.crop} {a.direction === "above" ? "↑" : "↓"} ₹{a.targetPrice}/kg</p>
                  <p className="text-[9px] text-foreground-muted font-mono">{a.region}</p>
                </div>
                <button onClick={() => onRemove(a.id)}>
                  <Trash2 size={12} className="text-foreground-dim" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new alert */}
        <div className="space-y-3 p-4 rounded-xl" style={{ background: "hsl(var(--surface-elevated))", border: "1px solid hsl(var(--surface-border))" }}>
          <p className="text-[10px] font-mono uppercase tracking-wider text-foreground-muted">New alert</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-mono text-foreground-muted uppercase block mb-1">Crop</label>
              <input value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="Tomato" className="w-full px-3 py-2.5 rounded-lg text-xs outline-none" style={{ background: "hsl(var(--surface-border))", color: "hsl(var(--foreground))" }} />
            </div>
            <div>
              <label className="text-[9px] font-mono text-foreground-muted uppercase block mb-1">Region</label>
              <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Coimbatore" className="w-full px-3 py-2.5 rounded-lg text-xs outline-none" style={{ background: "hsl(var(--surface-border))", color: "hsl(var(--foreground))" }} />
            </div>
          </div>
          <div className="flex gap-2">
            {(["above", "below"] as const).map((d) => (
              <button key={d} onClick={() => setDirection(d)} className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all" style={{ background: direction === d ? "hsl(var(--alert-amber) / 0.2)" : "hsl(var(--surface-border))", color: direction === d ? "hsl(var(--alert-amber))" : "hsl(var(--foreground-muted))", border: direction === d ? "1px solid hsl(var(--alert-amber) / 0.4)" : "1px solid transparent" }}>
                {d === "above" ? "Price rises above" : "Price falls below"}
              </button>
            ))}
          </div>
          <div>
            <label className="text-[9px] font-mono text-foreground-muted uppercase block mb-1">Target ₹/kg</label>
            <input type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} placeholder="30" className="w-full px-3 py-2.5 rounded-lg text-xs outline-none" style={{ background: "hsl(var(--surface-border))", color: "hsl(var(--foreground))" }} />
          </div>
          <button onClick={handleAdd} className="w-full py-3 rounded-xl text-sm font-semibold" style={{ background: "hsl(var(--alert-amber))", color: "hsl(var(--background))" }}>
            + Add alert
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

export function MarketplaceTab() {
  const [listSheetOpen, setListSheetOpen] = useState(false);
  const [alertSheetOpen, setAlertSheetOpen] = useState(false);
  const [crop, setCrop] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [farmer, setFarmer] = useState("");
  const [location, setLocation] = useState("");

  const { listings, priceAlerts, isOffline, addListing, savePriceAlert, removePriceAlert } = useMarketCache();
  const { user } = useAuth();

  const handlePost = useCallback(() => {
    if (!crop || !qty || !price) return;
    addListing({
      farmer: farmer || user?.email?.split("@")[0] || "You",
      crop,
      qty: `${qty} kg`,
      price: Number(price),
      location: location || "Your location",
    });
    setCrop(""); setQty(""); setPrice(""); setFarmer(""); setLocation("");
    setListSheetOpen(false);
  }, [crop, qty, price, farmer, location, addListing, user]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">Marketplace</h2>
            {isOffline ? (
              <WifiOff size={14} style={{ color: "hsl(var(--alert-amber))" }} />
            ) : (
              <Wifi size={14} style={{ color: "hsl(var(--farm-green))" }} />
            )}
          </div>
          <p className="text-xs text-foreground-muted font-mono">
            {isOffline ? "Offline — showing cached data" : "Live mandi rates"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAlertSheetOpen(true)}
            className="p-2.5 rounded-xl relative"
            style={{ background: "hsl(var(--alert-amber) / 0.1)", border: "1px solid hsl(var(--alert-amber) / 0.2)" }}
          >
            <Bell size={15} style={{ color: "hsl(var(--alert-amber))" }} />
            {priceAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: "hsl(var(--alert-amber))", color: "hsl(var(--background))" }}>
                {priceAlerts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setListSheetOpen(true)}
            className="fab flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold"
            style={{ background: "hsl(var(--market-blue))", color: "hsl(var(--primary-foreground))" }}
          >
            <Plus size={16} />
            List produce
          </button>
        </div>
      </div>

      {/* Market growth section */}
      <MarketGrowthSection />

      {/* Listings */}
      <div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-foreground-muted mb-2">Active listings ({listings.length})</p>
        <div className="space-y-3">
          {listings.map((l) => (
            <PriceBandCard key={l.id} listing={l} />
          ))}
        </div>
      </div>

      {/* List produce sheet */}
      <BottomSheet open={listSheetOpen} onClose={() => setListSheetOpen(false)} title="List your produce" accentColor="blue">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-foreground-muted uppercase tracking-wider mb-2 block">Your name</label>
              <input value={farmer} onChange={(e) => setFarmer(e.target.value)} placeholder="Ravi Kumar" className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-foreground-muted outline-none" style={{ background: "hsl(var(--surface-border))", border: "1px solid hsl(var(--surface-border))" }} />
            </div>
            <div>
              <label className="text-xs font-mono text-foreground-muted uppercase tracking-wider mb-2 block">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Coimbatore" className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-foreground-muted outline-none" style={{ background: "hsl(var(--surface-border))", border: "1px solid hsl(var(--surface-border))" }} />
            </div>
          </div>
          <div>
            <label className="text-xs font-mono text-foreground-muted uppercase tracking-wider mb-2 block">Crop name</label>
            <input value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="e.g. Tomato, Onion..." className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-foreground-muted outline-none" style={{ background: "hsl(var(--surface-border))", border: "1px solid hsl(var(--surface-border))" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-foreground-muted uppercase tracking-wider mb-2 block">Quantity (kg)</label>
              <input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="500" type="number" className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-foreground-muted outline-none" style={{ background: "hsl(var(--surface-border))", border: "1px solid hsl(var(--surface-border))" }} />
            </div>
            <div>
              <label className="text-xs font-mono text-foreground-muted uppercase tracking-wider mb-2 block">Expected ₹/kg</label>
              <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="28" type="number" className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-foreground-muted outline-none" style={{ background: "hsl(var(--surface-border))", border: "1px solid hsl(var(--surface-border))" }} />
            </div>
          </div>
          {crop && (
            <div className="p-3 rounded-xl" style={{ background: "hsl(var(--market-blue) / 0.08)", border: "1px solid hsl(var(--market-blue) / 0.2)" }}>
              <p className="text-xs text-foreground-muted mb-1">Suggested fair price range</p>
              <p className="text-lg font-mono font-bold" style={{ color: "hsl(var(--market-blue))" }}>₹22 – ₹30 / kg</p>
              <p className="text-[10px] text-foreground-muted">Based on nearby mandi rates</p>
            </div>
          )}
          <button onClick={handlePost} className="w-full py-3.5 rounded-2xl font-semibold text-sm" style={{ background: "hsl(var(--market-blue))", color: "hsl(var(--primary-foreground))" }}>
            Post listing
          </button>
        </div>
      </BottomSheet>

      {/* Price alert sheet */}
      <PriceAlertSheet
        open={alertSheetOpen}
        onClose={() => setAlertSheetOpen(false)}
        alerts={priceAlerts}
        onSave={savePriceAlert}
        onRemove={removePriceAlert}
      />
    </div>
  );
}
