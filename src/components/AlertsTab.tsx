import { useState } from "react";
import { CloudRain, TrendingUp, FileText, X, Bell } from "lucide-react";

const NOTIFICATIONS = [
  {
    id: 1,
    type: "weather",
    title: "Heavy rain forecast",
    body: "Expected 80mm rainfall Thursday. Check field drainage immediately.",
    time: "2h ago",
    read: false,
    icon: CloudRain,
    color: "var(--market-blue)",
  },
  {
    id: 2,
    type: "price",
    title: "Tomato price surge",
    body: "Tomato prices rose 18% in Salem mandi. Good time to list produce.",
    time: "5h ago",
    read: false,
    icon: TrendingUp,
    color: "var(--farm-green)",
  },
  {
    id: 3,
    type: "scheme",
    title: "PM-KISAN next installment",
    body: "₹2000 transfer scheduled for eligible farmers on 15th Feb.",
    time: "1d ago",
    read: true,
    icon: FileText,
    color: "var(--alert-amber)",
  },
  {
    id: 4,
    type: "weather",
    title: "Drought advisory",
    body: "Coimbatore district: moisture deficit in next 10 days. Consider drip irrigation.",
    time: "2d ago",
    read: true,
    icon: CloudRain,
    color: "var(--alert-amber)",
  },
];

export function AlertsTab() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const dismiss = (id: number) => {
    setNotifications((n) => n.filter((x) => x.id !== id));
  };

  const markRead = (id: number) => {
    setNotifications((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)));
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Alerts</h2>
          {unread > 0 && (
            <p className="text-xs font-mono" style={{ color: "hsl(var(--alert-amber))" }}>
              {unread} unread
            </p>
          )}
        </div>
        <div className="relative">
          <Bell size={22} className="text-foreground-muted" />
          {unread > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center pulse-amber"
              style={{ background: "hsl(var(--alert-amber))", color: "hsl(var(--background))" }}
            >
              {unread}
            </span>
          )}
        </div>
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-16 text-foreground-muted">
          <Bell size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">All caught up!</p>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((notif) => {
          const Icon = notif.icon;
          const accentColor = `hsl(${notif.color})`;
          return (
            <div
              key={notif.id}
              onClick={() => markRead(notif.id)}
              className="nothing-card p-4 cursor-pointer fade-in relative group"
              style={{
                borderColor: notif.read ? "hsl(var(--surface-border))" : `${accentColor}40`,
                background: notif.read
                  ? undefined
                  : `linear-gradient(135deg, ${accentColor}08, transparent 60%), hsl(var(--surface))`,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}
                >
                  <Icon size={16} style={{ color: accentColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-semibold text-foreground truncate">{notif.title}</h4>
                    {!notif.read && (
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: accentColor }}
                      />
                    )}
                  </div>
                  <p className="text-xs text-foreground-muted leading-snug mb-1">{notif.body}</p>
                  <p className="text-[10px] font-mono text-foreground-dim">{notif.time}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismiss(notif.id);
                  }}
                  className="p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "hsl(var(--foreground-muted))" }}
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
