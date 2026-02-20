import { useState, useEffect, useCallback } from "react";

export interface MarketListing {
  id: number;
  farmer: string;
  crop: string;
  qty: string;
  price: number;
  fairMin: number;
  fairMax: number;
  location: string;
  trend: number;
  updatedAt: number;
}

export interface PriceAlert {
  id: string;
  crop: string;
  region: string;
  targetPrice: number;
  direction: "above" | "below";
  enabled: boolean;
}

const CACHE_KEY = "agro_market_listings";
const ALERTS_KEY = "agro_price_alerts";

// Simulated live listings (in a real app, fetched from API)
const LIVE_LISTINGS: MarketListing[] = [
  { id: 1, farmer: "Ravi Kumar", crop: "Tomato", qty: "500 kg", price: 28, fairMin: 24, fairMax: 32, location: "Coimbatore", trend: 12, updatedAt: Date.now() },
  { id: 2, farmer: "Meena Devi", crop: "Onion", qty: "1200 kg", price: 18, fairMin: 16, fairMax: 22, location: "Salem", trend: -5, updatedAt: Date.now() },
  { id: 3, farmer: "Arjun S", crop: "Brinjal", qty: "300 kg", price: 22, fairMin: 19, fairMax: 26, location: "Erode", trend: 8, updatedAt: Date.now() },
  { id: 4, farmer: "Priya M", crop: "Chilli", qty: "200 kg", price: 85, fairMin: 78, fairMax: 95, location: "Guntur", trend: 15, updatedAt: Date.now() },
  { id: 5, farmer: "Suresh P", crop: "Paddy", qty: "2000 kg", price: 22, fairMin: 20, fairMax: 25, location: "Thanjavur", trend: 2, updatedAt: Date.now() },
];

export function useMarketCache() {
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Load from cache on mount
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        setListings(JSON.parse(cached));
      } catch { /* ignore parse errors */ }
    }

    const savedAlerts = localStorage.getItem(ALERTS_KEY);
    if (savedAlerts) {
      try {
        setPriceAlerts(JSON.parse(savedAlerts));
      } catch { /* ignore */ }
    }

    // Fetch fresh data
    fetchListings();

    const handleOnline = () => {
      setIsOffline(false);
      fetchListings(); // sync when back online
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const fetchListings = async () => {
    try {
      // Simulate API call - in production replace with real endpoint
      await new Promise((r) => setTimeout(r, 300));
      const fresh = LIVE_LISTINGS.map((l) => ({ ...l, updatedAt: Date.now() }));

      // Conflict resolution: merge local additions with server data
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const local: MarketListing[] = JSON.parse(cached);
        // Keep local entries that don't exist on server (user-posted listings)
        const localOnly = local.filter((l) => l.id > 1000); // local IDs start at 1001
        const merged = [...fresh, ...localOnly];
        setListings(merged);
        localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
      } else {
        setListings(fresh);
        localStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
      }
    } catch {
      // Offline: use cached data silently
    }
  };

  const addListing = useCallback((listing: Omit<MarketListing, "id" | "updatedAt" | "trend" | "fairMin" | "fairMax">) => {
    const newListing: MarketListing = {
      ...listing,
      id: 1001 + Math.floor(Math.random() * 9000),
      trend: Math.floor(Math.random() * 20) - 5,
      fairMin: listing.price - 4,
      fairMax: listing.price + 6,
      updatedAt: Date.now(),
    };
    setListings((prev) => {
      const updated = [newListing, ...prev];
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      return updated;
    });
    return newListing;
  }, []);

  const savePriceAlert = useCallback((alert: PriceAlert) => {
    setPriceAlerts((prev) => {
      const filtered = prev.filter((a) => a.id !== alert.id);
      const updated = [...filtered, alert];
      localStorage.setItem(ALERTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removePriceAlert = useCallback((id: string) => {
    setPriceAlerts((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      localStorage.setItem(ALERTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { listings, priceAlerts, isOffline, addListing, savePriceAlert, removePriceAlert };
}
