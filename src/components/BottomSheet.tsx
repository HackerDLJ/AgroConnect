import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  accentColor?: "green" | "amber" | "blue";
}

export function BottomSheet({ open, onClose, title, children, accentColor = "green" }: BottomSheetProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
    } else {
      const t = setTimeout(() => setVisible(false), 350);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!visible) return null;

  const accentVar =
    accentColor === "green"
      ? "var(--farm-green)"
      : accentColor === "amber"
      ? "var(--alert-amber)"
      : "var(--market-blue)";

  return (
    <div className="fixed inset-0 z-50 flex items-end max-w-md mx-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        style={{ opacity: open ? 1 : 0, transition: "opacity 0.3s ease" }}
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className="bottom-sheet relative w-full p-6 pb-10 z-10"
        style={{
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
          borderTopColor: `hsl(${accentVar} / 0.3)`,
        }}
      >
        {/* Handle */}
        <div
          className="mx-auto mb-5 h-1 w-10 rounded-full"
          style={{ background: `hsl(${accentVar} / 0.5)` }}
        />
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl transition-colors"
            style={{ background: "hsl(var(--surface-border))" }}
          >
            <X size={16} className="text-foreground-muted" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
