import React, { useState } from "react";
import { YadukLogo } from "@/components/quest/YadukLogo";
import { useAuth } from "@/lib/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "register";
  onSuccess?: () => void;
}

export function AuthModal({
  open,
  onOpenChange,
  defaultTab = "login",
  onSuccess,
}: AuthModalProps) {
  const { login, register, continueAsGuest, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (open && isAuthenticated) {
      onOpenChange(false);
    }
  }, [open, isAuthenticated, onOpenChange]);

  React.useEffect(() => {
    if (open) {
      setTab(defaultTab);
      setErrorMsg(null);
    }
  }, [open, defaultTab]);

  const handleTabSwitch = (newTab: "login" | "register") => {
    setTab(newTab);
    setErrorMsg(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email || !password) {
      setErrorMsg("Please fill in both email and password.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email || !password) {
      setErrorMsg("Please provide an email and password.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    setLoading(true);
    try {
      await register(email, password, fullName);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestContinue = () => {
    continueAsGuest(fullName || undefined);
    onOpenChange(false);
    if (onSuccess) onSuccess();
  };

  return (
    <Dialog open={open && !isAuthenticated} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl sm:p-8">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-sky-50 border border-sky-200 shadow-xs">
            <YadukLogo size={36} />
          </div>
          <DialogTitle className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {tab === "login" ? "Welcome Back, Scholar" : "Join Yaduk AI"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 sm:text-sm">
            {tab === "login"
              ? "Sign in to access your saved capstone project blueprints and AI mentor."
              : "Create your student account to discover, score and architect your capstone."}
          </DialogDescription>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="mt-4 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => handleTabSwitch("login")}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all duration-200 sm:text-sm cursor-pointer ${
              tab === "login"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch("register")}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all duration-200 sm:text-sm cursor-pointer ${
              tab === "register"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs font-semibold text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={tab === "login" ? handleLoginSubmit : handleRegisterSubmit}
          className="mt-4 space-y-3.5"
        >
          {tab === "register" && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                Your Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Arjun Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                Password
              </label>
              {tab === "register" && (
                <span className="text-[10px] text-slate-400">
                  min 6 chars
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-10 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {tab === "login" ? "Signing In..." : "Creating Account..."}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                {tab === "login" ? "Sign In" : "Create Account & Start"}
                <ArrowRight className="size-4" />
              </span>
            )}
          </button>
        </form>

        {/* Guest Fast-Track Option */}
        <div className="mt-5 border-t border-slate-100 pt-4 text-center">
          <p className="text-[11px] text-slate-400 mb-2.5">
            or test immediately without signing up
          </p>
          <button
            type="button"
            onClick={handleGuestContinue}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <Sparkles className="size-3.5 text-blue-600" />
            Continue as Guest / Evaluator
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-center text-[10px] text-slate-400">
          <ShieldCheck className="size-3.5 text-emerald-500" />
          <span>Secured with JWT & Supabase PostgreSQL encryption</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
