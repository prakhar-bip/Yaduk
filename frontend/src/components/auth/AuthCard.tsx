import React, { useState } from "react";
import { YadukLogo } from "@/components/quest/YadukLogo";
import { useAuth } from "@/lib/auth-context";
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Sparkles, ArrowRight, CheckCircle2, LogOut, ShieldCheck } from "lucide-react";

interface AuthCardProps {
  onStartJourney: () => void;
  onAuthSuccess?: () => void;
  className?: string;
}

export function AuthCard({ onStartJourney, onAuthSuccess, className = "" }: AuthCardProps) {
  const { user, isAuthenticated, login, register, continueAsGuest, logout } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTabSwitch = (newTab: "login" | "register") => {
    setTab(newTab);
    setErrorMsg(null);
  };

  const notifySuccess = () => {
    if (onAuthSuccess) {
      onAuthSuccess();
    } else {
      onStartJourney();
    }
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
      notifySuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials.");
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
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(email, password, fullName);
      notifySuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest(fullName || undefined);
    notifySuccess();
  };

  // If already logged in, show student profile card with quick start
  if (isAuthenticated && user) {
    return (
      <div className={`panel q-pop rounded-3xl border border-slate-200/80 bg-white/95 p-6 sm:p-7 shadow-xl shadow-blue-500/5 ${className}`}>
        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-display text-lg font-bold shadow-md shadow-blue-500/20">
            {user.fullName ? user.fullName[0].toUpperCase() : user.email[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate font-display text-base font-bold text-slate-900 sm:text-lg">
                {user.fullName || user.email.split("@")[0]}
              </span>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                {user.isGuest ? "Guest" : "Verified Student"}
              </span>
            </div>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Welcome back! Ready to discover tailored project ideas, generate architectural blueprints, and consult your AI mentor?
          </p>
          <button
            onClick={onStartJourney}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 py-3 font-display text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-teal-700 hover:shadow-lg cursor-pointer"
          >
            <span>Continue to Project Discovery</span>
            <ArrowRight className="size-4" />
          </button>
          <div className="flex items-center justify-end pt-1">
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-medium text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
              title="Log Out of Yaduk"
            >
              <LogOut className="size-3" />
              <span>Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`panel q-rise rounded-3xl border border-slate-200/80 bg-white/95 p-6 sm:p-8 shadow-xl shadow-blue-500/5 ${className}`}>
      <div className="mb-5 text-center">
        <div className="flex justify-center mb-2.5">
          <YadukLogo size={44} />
        </div>
        <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
          {tab === "register" ? "Create Student Account" : "Sign In to Yaduk"}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {tab === "register"
            ? "Save your answers, scored ideas, and blueprint."
            : "Resume your final-year engineering project journey."}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
        <button
          type="button"
          onClick={() => handleTabSwitch("login")}
          className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
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
          className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
            tab === "register"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          New Student
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs font-semibold text-red-700">
          {errorMsg}
        </div>
      )}

      <form
        onSubmit={tab === "login" ? handleLoginSubmit : handleRegisterSubmit}
        className="space-y-3.5"
      >
        {tab === "register" && (
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Arjun Sharma"
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
              placeholder="student@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
            Password
          </label>
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
              <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Authenticating...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              {tab === "register" ? "Sign Up & Begin →" : "Sign In & Continue →"}
            </span>
          )}
        </button>
      </form>

      {/* Guest Fast-Track */}
      <div className="mt-5 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={handleGuest}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-all cursor-pointer"
        >
          <Sparkles className="size-3.5 text-blue-600" />
          <span>Continue as Guest / Evaluator</span>
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-center text-[10px] text-slate-400">
        <ShieldCheck className="size-3 text-emerald-500" />
        <span>Secured with JWT & Supabase PostgreSQL encryption</span>
      </div>
    </div>
  );
}
