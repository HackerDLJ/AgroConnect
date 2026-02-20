import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Mail, Phone, ArrowRight, Check } from "lucide-react";

type AuthMode = "login" | "signup" | "phone" | "phone_otp";

const ONBOARDING_STEPS = [
  { icon: "🌱", label: "Create account" },
  { icon: "🗣️", label: "Choose language" },
  { icon: "🏡", label: "Add farm details" },
  { icon: "✅", label: "Start farming smarter" },
];

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState(0); // onboarding progress step

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setSuccess("Check your email for a confirmation link!");
        setStep(1);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formatted = phone.startsWith("+") ? phone : `+91${phone}`;
      const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
      if (error) throw error;
      setMode("phone_otp");
      setSuccess("OTP sent to your phone!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formatted = phone.startsWith("+") ? phone : `+91${phone}`;
      const { error } = await supabase.auth.verifyOtp({ phone: formatted, token: otp, type: "sms" });
      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "hsl(var(--background))" }}>
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-2xl" style={{ background: "hsl(var(--farm-green) / 0.15)", border: "1px solid hsl(var(--farm-green) / 0.3)" }}>
            🌿
          </div>
          <p className="text-[10px] font-mono tracking-widest" style={{ color: "hsl(var(--farm-green))" }}>AGROCONNECT</p>
          <h1 className="text-2xl font-bold text-foreground">
            {mode === "signup" ? "Create account" : mode === "phone" ? "Phone sign-in" : mode === "phone_otp" ? "Enter OTP" : "Welcome back"}
          </h1>
          <p className="text-sm text-foreground-muted">
            {mode === "signup" ? "Join thousands of smart farmers" : "Sign in to your farm dashboard"}
          </p>
        </div>

        {/* Onboarding steps (signup only) */}
        {mode === "signup" && (
          <div className="flex items-center justify-between px-2">
            {ONBOARDING_STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all"
                  style={{
                    background: i <= step ? "hsl(var(--farm-green) / 0.2)" : "hsl(var(--surface-border))",
                    border: `1px solid ${i <= step ? "hsl(var(--farm-green) / 0.4)" : "hsl(var(--surface-border))"}`,
                  }}
                >
                  {i < step ? <Check size={12} style={{ color: "hsl(var(--farm-green))" }} /> : <span>{s.icon}</span>}
                </div>
                <p className="text-[8px] font-mono text-foreground-muted text-center leading-tight max-w-[48px]">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Error / Success */}
        {error && (
          <div className="p-3 rounded-xl text-xs text-center" style={{ background: "hsl(0 72% 55% / 0.1)", border: "1px solid hsl(0 72% 55% / 0.2)", color: "hsl(0 72% 55%)" }}>
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-xl text-xs text-center" style={{ background: "hsl(var(--farm-green) / 0.1)", border: "1px solid hsl(var(--farm-green) / 0.2)", color: "hsl(var(--farm-green))" }}>
            {success}
          </div>
        )}

        {/* Phone OTP verify */}
        {mode === "phone_otp" && (
          <form onSubmit={handleOtpVerify} className="space-y-4">
            <p className="text-xs text-foreground-muted text-center">OTP sent to <span className="text-foreground font-mono">{phone}</span></p>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="w-full px-4 py-4 rounded-xl text-center text-2xl font-mono tracking-widest outline-none"
              style={{ background: "hsl(var(--surface-elevated))", border: "1px solid hsl(var(--surface-border))", color: "hsl(var(--foreground))" }}
            />
            <AuthButton loading={loading} label="Verify OTP" />
            <button type="button" onClick={() => setMode("phone")} className="w-full text-xs text-foreground-muted">← Back</button>
          </form>
        )}

        {/* Phone sign-in */}
        {mode === "phone" && (
          <form onSubmit={handlePhoneSend} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-foreground-muted block mb-2">Mobile number</label>
              <div className="relative">
                <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-4 rounded-xl text-sm outline-none"
                  style={{ background: "hsl(var(--surface-elevated))", border: "1px solid hsl(var(--surface-border))", color: "hsl(var(--foreground))" }}
                />
              </div>
            </div>
            <AuthButton loading={loading} label="Send OTP" />
            <button type="button" onClick={() => setMode("login")} className="w-full text-xs text-foreground-muted">Use email instead</button>
          </form>
        )}

        {/* Email auth */}
        {(mode === "login" || mode === "signup") && (
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-foreground-muted block mb-2">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@example.com"
                  required
                  className="w-full pl-10 pr-4 py-4 rounded-xl text-sm outline-none"
                  style={{ background: "hsl(var(--surface-elevated))", border: "1px solid hsl(var(--surface-border))", color: "hsl(var(--foreground))" }}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-foreground-muted block mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-4 pr-10 py-4 rounded-xl text-sm outline-none"
                  style={{ background: "hsl(var(--surface-elevated))", border: "1px solid hsl(var(--surface-border))", color: "hsl(var(--foreground))" }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <AuthButton loading={loading} label={mode === "signup" ? "Create account" : "Sign in"} />
          </form>
        )}

        {/* Google OAuth */}
        {(mode === "login" || mode === "signup") && (
          <>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "hsl(var(--surface-border))" }} />
              <span className="text-[10px] font-mono text-foreground-dim">OR</span>
              <div className="flex-1 h-px" style={{ background: "hsl(var(--surface-border))" }} />
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "hsl(var(--surface-elevated))", border: "1px solid hsl(var(--surface-border))", color: "hsl(var(--foreground))" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <button
                onClick={() => setMode("phone")}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "hsl(var(--surface-elevated))", border: "1px solid hsl(var(--surface-border))", color: "hsl(var(--foreground))" }}
              >
                <Phone size={15} />
                Continue with Phone OTP
              </button>
            </div>

            <p className="text-center text-xs text-foreground-muted">
              {mode === "login" ? "New farmer?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setSuccess(""); }}
                style={{ color: "hsl(var(--farm-green))" }}
                className="font-semibold"
              >
                {mode === "login" ? "Create account" : "Sign in"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function AuthButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
      style={{ background: "hsl(var(--farm-green))", color: "hsl(var(--primary-foreground))" }}
    >
      {loading ? (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        <>
          {label}
          <ArrowRight size={15} />
        </>
      )}
    </button>
  );
}
