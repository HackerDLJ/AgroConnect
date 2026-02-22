import { useState } from "react";
import {
  Users, TrendingUp, DollarSign, BarChart2, Download,
  Home, ShoppingBasket, Leaf, Settings, Bell, ChevronDown,
  ArrowUpRight, ArrowDownRight, Activity, Map,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";

// ── Mock data ──────────────────────────────────────────────
const INCOME_DATA = [
  { month: "Sep", income: 18200, yield: 2100 },
  { month: "Oct", income: 21400, yield: 2540 },
  { month: "Nov", income: 19800, yield: 2200 },
  { month: "Dec", income: 25600, yield: 3100 },
  { month: "Jan", income: 23900, yield: 2780 },
  { month: "Feb", income: 28300, yield: 3400 },
];

const ADVISORY_ADOPTION = [
  { week: "W1", adopted: 68 },
  { week: "W2", adopted: 74 },
  { week: "W3", adopted: 71 },
  { week: "W4", adopted: 82 },
  { week: "W5", adopted: 79 },
  { week: "W6", adopted: 88 },
];

const RECENT_FARMERS = [
  { name: "Ravi Kumar", crop: "Tomato", location: "Coimbatore", income: "₹28,300", status: "active" },
  { name: "Meena Devi", crop: "Onion", location: "Salem", income: "₹19,200", status: "active" },
  { name: "Arjun S", crop: "Brinjal", location: "Erode", income: "₹14,500", status: "advisory" },
  { name: "Priya M", crop: "Chilli", location: "Madurai", income: "₹22,100", status: "active" },
  { name: "Suresh P", crop: "Paddy", location: "Thanjavur", income: "₹31,000", status: "active" },
];

// ── Stat card ──────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: "green" | "amber" | "blue" | "white";
}

const colorMap = {
  green: { bg: "hsl(var(--farm-green) / 0.1)", border: "hsl(var(--farm-green) / 0.2)", accent: "hsl(var(--farm-green))" },
  amber: { bg: "hsl(var(--alert-amber) / 0.1)", border: "hsl(var(--alert-amber) / 0.2)", accent: "hsl(var(--alert-amber))" },
  blue: { bg: "hsl(var(--market-blue) / 0.1)", border: "hsl(var(--market-blue) / 0.2)", accent: "hsl(var(--market-blue))" },
  white: { bg: "hsl(0 0% 100% / 0.04)", border: "hsl(0 0% 100% / 0.1)", accent: "hsl(var(--foreground))" },
};

function StatCard({ label, value, change, icon, color }: StatCardProps) {
  const c = colorMap[color];
  const isUp = change >= 0;
  return (
    <div
      className="nothing-card p-5 flex flex-col gap-3"
      style={{ background: c.bg, borderColor: c.border }}
    >
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: c.bg }}>
          <span style={{ color: c.accent }}>{icon}</span>
        </div>
        <span
          className={`text-xs font-mono flex items-center gap-0.5`}
          style={{ color: isUp ? "hsl(var(--farm-green))" : "hsl(0 72% 55%)" }}
        >
          {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(change)}%
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-foreground-muted mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Custom tooltip ─────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-xl text-xs"
        style={{
          background: "hsl(var(--surface-elevated))",
          border: "1px solid hsl(var(--surface-border))",
          fontFamily: "Space Mono, monospace",
        }}
      >
        <p className="text-foreground-muted mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-foreground font-bold">
            {p.name}: {typeof p.value === "number" && p.name.includes("income") ? `₹${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ── Sidebar ────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "farmers", label: "Farmers", icon: Users },
  { id: "advisory", label: "Advisory", icon: Leaf },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBasket },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "settings", label: "Settings", icon: Settings },
];

function Sidebar({ active, onNav }: { active: string; onNav: (id: string) => void }) {
  const navigate = useNavigate();
  return (
    <aside
      className="hidden md:flex flex-col w-56 min-h-screen sticky top-0"
      style={{ background: "hsl(var(--surface))", borderRight: "1px solid hsl(var(--surface-border))" }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b" style={{ borderColor: "hsl(var(--surface-border))" }}>
        <div className="flex items-center gap-2">
          <span className="text-lg" style={{ color: "hsl(var(--farm-green))" }}>🌿</span>
          <div>
            <p className="text-xs font-mono font-bold tracking-widest text-foreground">AGROCONNECT</p>
            <p className="text-[9px] font-mono text-foreground-muted">ADMIN PANEL</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm"
              style={{
                color: isActive ? "hsl(var(--farm-green))" : "hsl(var(--foreground-muted))",
                background: isActive ? "hsl(var(--farm-green) / 0.1)" : "transparent",
              }}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 1.5} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Back to app */}
      <div className="p-4 border-t" style={{ borderColor: "hsl(var(--surface-border))" }}>
        <button
          onClick={() => navigate("/")}
          className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all"
          style={{
            background: "hsl(var(--surface-elevated))",
            color: "hsl(var(--foreground-muted))",
            border: "1px solid hsl(var(--surface-border))",
          }}
        >
          ← Back to Farmer App
        </button>
      </div>
    </aside>
  );
}

// ── Main Admin Page ────────────────────────────────────────
const Admin = () => {
  const [activeNav, setActiveNav] = useState("dashboard");
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Admin";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex" style={{ background: "hsl(var(--background))" }}>
      <Sidebar active={activeNav} onNav={setActiveNav} />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-6 py-4"
          style={{
            background: "hsl(var(--background) / 0.9)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid hsl(var(--surface-border))",
          }}
        >
          <div>
            <h1 className="text-lg font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-xs font-mono text-foreground-muted">Feb 2026 — Tamil Nadu Region</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const headers = ["Farmer", "Crop", "Location", "Income", "Status"];
                const rows = RECENT_FARMERS.map((f) => [f.name, f.crop, f.location, f.income, f.status]);
                const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `agroconnect-report-${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
              style={{
                background: "hsl(var(--farm-green) / 0.1)",
                color: "hsl(var(--farm-green))",
                border: "1px solid hsl(var(--farm-green) / 0.2)",
              }}
            >
              <Download size={13} />
              Export CSV
            </button>
            <div className="relative">
              <Bell size={18} className="text-foreground-muted" />
              <span
                className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center"
                style={{ background: "hsl(var(--alert-amber))", color: "hsl(var(--background))" }}
              >
                3
              </span>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: "hsl(var(--surface-elevated))", border: "1px solid hsl(var(--surface-border))" }}
            >
              <div
                className="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center"
                style={{ background: "hsl(var(--farm-green) / 0.2)", color: "hsl(var(--farm-green))" }}
              >
                {initials}
              </div>
              <span className="text-xs text-foreground hidden sm:block truncate max-w-24">{displayName}</span>
              <ChevronDown size={12} className="text-foreground-muted" />
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Active farmers" value="3,842" change={12} icon={<Users size={18} />} color="green" />
            <StatCard label="Advisory adoption" value="82%" change={7} icon={<Activity size={18} />} color="blue" />
            <StatCard label="Avg income uplift" value="₹8,200" change={18} icon={<DollarSign size={18} />} color="amber" />
            <StatCard label="Total transactions" value="1,204" change={-3} icon={<ShoppingBasket size={18} />} color="white" />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Income & yield trends */}
            <div className="nothing-card p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-semibold text-foreground">Income & Yield Trends</h3>
                  <p className="text-xs text-foreground-muted font-mono">Last 6 months</p>
                </div>
                <TrendingUp size={16} style={{ color: "hsl(var(--farm-green))" }} />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={INCOME_DATA}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142 60% 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142 60% 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14%)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "hsl(0 0% 50%)", fontSize: 10, fontFamily: "Space Mono" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "hsl(0 0% 50%)", fontSize: 10, fontFamily: "Space Mono" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="hsl(142 60% 50%)"
                    strokeWidth={2}
                    fill="url(#incomeGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Advisory adoption */}
            <div className="nothing-card p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-semibold text-foreground">Advisory Adoption Rate</h3>
                  <p className="text-xs text-foreground-muted font-mono">% farmers following AI plans</p>
                </div>
                <Activity size={16} style={{ color: "hsl(var(--market-blue))" }} />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ADVISORY_ADOPTION}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14%)" />
                  <XAxis
                    dataKey="week"
                    tick={{ fill: "hsl(0 0% 50%)", fontSize: 10, fontFamily: "Space Mono" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "hsl(0 0% 50%)", fontSize: 10, fontFamily: "Space Mono" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="adopted"
                    fill="hsl(210 90% 58%)"
                    radius={[4, 4, 0, 0]}
                    opacity={0.85}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Farmer table */}
          <div className="nothing-card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "hsl(var(--surface-border))" }}>
              <div>
                <h3 className="font-semibold text-foreground">Recent Farmers</h3>
                <p className="text-xs text-foreground-muted font-mono">Sorted by activity</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-foreground-muted">Role:</span>
                <select
                  onChange={(e) => {
                    // Filter logic is visual-only with mock data
                    const val = e.target.value;
                    console.log(`Filter by role: ${val}`);
                  }}
                  className="text-xs font-mono rounded-lg px-2 py-1 outline-none"
                  style={{
                    background: "hsl(var(--surface-elevated))",
                    color: "hsl(var(--foreground-muted))",
                    border: "1px solid hsl(var(--surface-border))",
                  }}
                >
                  <option>All Roles</option>
                  <option>Admin</option>
                  <option>Field Agent</option>
                  <option>Viewer</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid hsl(var(--surface-border))" }}>
                    {["Farmer", "Crop", "Location", "Income (Feb)", "Status"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-[10px] font-mono uppercase tracking-wider"
                        style={{ color: "hsl(var(--foreground-muted))" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RECENT_FARMERS.map((farmer, i) => (
                    <tr
                      key={i}
                      className="transition-colors hover:bg-surface-elevated cursor-pointer"
                      style={{ borderBottom: i < RECENT_FARMERS.length - 1 ? "1px solid hsl(var(--surface-border))" : "none" }}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center"
                            style={{
                              background: "hsl(var(--farm-green) / 0.1)",
                              color: "hsl(var(--farm-green))",
                            }}
                          >
                            {farmer.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-foreground">{farmer.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-foreground">{farmer.crop}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <Map size={10} className="text-foreground-muted" />
                          <span className="text-sm text-foreground-muted">{farmer.location}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-sm font-semibold text-foreground">{farmer.income}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md"
                          style={
                            farmer.status === "active"
                              ? { background: "hsl(var(--farm-green) / 0.1)", color: "hsl(var(--farm-green))" }
                              : { background: "hsl(var(--market-blue) / 0.1)", color: "hsl(var(--market-blue))" }
                          }
                        >
                          {farmer.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Schemes broadcast", value: "14", sub: "This month", color: "amber" as const },
              { label: "Disease scans", value: "892", sub: "On-device AI runs", color: "green" as const },
              { label: "Marketplace listings", value: "237", sub: "Active listings", color: "blue" as const },
            ].map((item) => (
              <div
                key={item.label}
                className="nothing-card p-5"
                style={{
                  background: colorMap[item.color].bg,
                  borderColor: colorMap[item.color].border,
                }}
              >
                <p className="text-3xl font-bold text-foreground">{item.value}</p>
                <p className="text-sm font-semibold text-foreground mt-1">{item.label}</p>
                <p className="text-xs text-foreground-muted">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
