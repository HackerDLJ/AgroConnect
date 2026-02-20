import { useState } from "react";
import { TrendingUp, TrendingDown, Plus, MapPin } from "lucide-react";
import { BottomSheet } from "./BottomSheet";

const LISTINGS = [
  { id: 1, farmer: "Ravi Kumar", crop: "Tomato", qty: "500 kg", price: 28, fairMin: 24, fairMax: 32, location: "Coimbatore", trend: 12 },
  { id: 2, farmer: "Meena Devi", crop: "Onion", qty: "1200 kg", price: 18, fairMin: 16, fairMax: 22, location: "Salem", trend: -5 },
  { id: 3, farmer: "Arjun S", crop: "Brinjal", qty: "300 kg", price: 22, fairMin: 19, fairMax: 26, location: "Erode", trend: 8 },
];

function PriceBandCard({ listing }: { listing: (typeof LISTINGS)[0] }) {
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
          <p className="text-[10px] text-foreground-muted">per kg</p>
          <div
            className={`flex items-center gap-0.5 justify-end text-[10px] font-mono mt-0.5 ${
              isUp ? "trend-up" : "trend-down"
            }`}
          >
            {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(listing.trend)}%
          </div>
        </div>
      </div>

      {/* Fair price band */}
      <div className="mb-2">
        <div className="flex justify-between text-[9px] font-mono text-foreground-muted mb-1">
          <span>₹{listing.fairMin} Fair band</span>
          <span>₹{listing.fairMax}</span>
        </div>
        <div className="relative h-1.5 rounded-full" style={{ background: "hsl(var(--surface-border))" }}>
          <div
            className="absolute h-full rounded-full"
            style={{
              left: "0%",
              width: "100%",
              background: "hsl(var(--market-blue) / 0.2)",
            }}
          />
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
          className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{
            background: "hsl(var(--market-blue) / 0.15)",
            color: "hsl(var(--market-blue))",
            border: "1px solid hsl(var(--market-blue) / 0.25)",
          }}
        >
          💬 Chat
        </button>
        <button
          className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{
            background: "hsl(var(--market-blue))",
            color: "hsl(var(--primary-foreground))",
          }}
        >
          📞 Call
        </button>
      </div>
    </div>
  );
}

export function MarketplaceTab() {
  const [listSheetOpen, setListSheetOpen] = useState(false);
  const [crop, setCrop] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Marketplace</h2>
          <p className="text-xs text-foreground-muted font-mono">Live mandi rates</p>
        </div>
        <button
          onClick={() => setListSheetOpen(true)}
          className="fab flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold"
          style={{ background: "hsl(var(--market-blue))", color: "hsl(var(--primary-foreground))" }}
        >
          <Plus size={16} />
          List produce
        </button>
      </div>

      {/* Listings */}
      <div className="space-y-3">
        {LISTINGS.map((l) => (
          <PriceBandCard key={l.id} listing={l} />
        ))}
      </div>

      {/* List produce sheet */}
      <BottomSheet
        open={listSheetOpen}
        onClose={() => setListSheetOpen(false)}
        title="List your produce"
        accentColor="blue"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono text-foreground-muted uppercase tracking-wider mb-2 block">
              Crop name
            </label>
            <input
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              placeholder="e.g. Tomato, Onion..."
              className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-foreground-muted outline-none"
              style={{ background: "hsl(var(--surface-border))", border: "1px solid hsl(var(--surface-border))" }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-foreground-muted uppercase tracking-wider mb-2 block">
                Quantity (kg)
              </label>
              <input
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="500"
                type="number"
                className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-foreground-muted outline-none"
                style={{ background: "hsl(var(--surface-border))", border: "1px solid hsl(var(--surface-border))" }}
              />
            </div>
            <div>
              <label className="text-xs font-mono text-foreground-muted uppercase tracking-wider mb-2 block">
                Expected ₹/kg
              </label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="28"
                type="number"
                className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-foreground-muted outline-none"
                style={{ background: "hsl(var(--surface-border))", border: "1px solid hsl(var(--surface-border))" }}
              />
            </div>
          </div>

          {/* Fair price suggestion */}
          {crop && (
            <div
              className="p-3 rounded-xl"
              style={{ background: "hsl(var(--market-blue) / 0.08)", border: "1px solid hsl(var(--market-blue) / 0.2)" }}
            >
              <p className="text-xs text-foreground-muted mb-1">Suggested fair price range</p>
              <p className="text-lg font-mono font-bold" style={{ color: "hsl(var(--market-blue))" }}>
                ₹22 – ₹30 / kg
              </p>
              <p className="text-[10px] text-foreground-muted">Based on nearby mandi rates</p>
            </div>
          )}

          <button
            className="w-full py-3.5 rounded-2xl font-semibold text-sm"
            style={{ background: "hsl(var(--market-blue))", color: "hsl(var(--primary-foreground))" }}
            onClick={() => setListSheetOpen(false)}
          >
            Post listing
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
