import React from "react";
import { YadukLogo } from "./YadukLogo";
import { useAuth } from "@/lib/auth-context";
import { AuthCard } from "@/components/auth/AuthCard";
import {
  GraduationCap,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Code2,
  Layers,
} from "lucide-react";
import { STAGES } from "./BookWorkspace";

interface BookLandingCoverProps {
  onStart: () => void;
  onOpenAuth: (tab: "login" | "register") => void;
  onAuthSuccess?: () => void;
}

export function BookLandingCover({
  onStart,
  onOpenAuth,
  onAuthSuccess,
}: BookLandingCoverProps) {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:py-12">
      {/* ====================================================================
          1. HERO HEADER SECTION
          ==================================================================== */}
      <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
        {/* Left Column: Mission & Pitch */}
        <div className="lg:col-span-7 space-y-5 text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-3.5 py-1 text-xs font-bold text-blue-800 shadow-2xs">
            <GraduationCap className="size-4 text-blue-700" />
            <span>Final-Year Engineering Capstone Studio • Sem 8</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            Stop guessing your
            <span className="text-blue-600 block sm:inline"> final-year project.</span>
          </h1>

          <p className="max-w-xl text-sm sm:text-base leading-relaxed text-slate-600">
            Tell us your branch, languages, and time budget. Get matched project ideas, an honest feasibility check, complete production architecture blueprint, and an AI mentor for your college Viva Voce defense.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              type="button"
              onClick={onStart}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-display text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span>{isAuthenticated ? "Launch Project Discovery" : "Start Project Discovery"}</span>
              <ArrowRight className="size-4" />
            </button>

            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => onOpenAuth("login")}
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>

          {isAuthenticated && user && (
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 pt-1">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Signed in as {user.fullName || user.email} (Candidate)
            </p>
          )}
        </div>

        {/* Right Column: Candidate Registry Desk */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700 font-bold">
                  <GraduationCap className="size-4" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    Candidate Registry Desk
                  </h3>
                  <p className="text-[11px] text-slate-500">Sign in to save your 9-stage project</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Sem 8
              </span>
            </div>

            <AuthCard onStartJourney={onStart} {...(onAuthSuccess ? { onAuthSuccess } : {})} />
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. THE 9-STAGE PROJECT ROADMAP PREVIEW
          ==================================================================== */}
      <div className="mt-14 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-blue-600" />
            <h2 className="font-display text-base font-bold text-slate-900">
              The 9-Stage Capstone Pipeline
            </h2>
          </div>
          <span className="text-xs text-slate-500">From concept to GitHub repo & viva prep</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
          {STAGES.map((s) => (
            <div
              key={s.key}
              className="rounded-xl border border-slate-200/80 bg-white p-3 text-center shadow-2xs hover:border-blue-300 transition-colors"
            >
              <span className="grid size-6 place-items-center rounded-full bg-blue-50 text-blue-700 font-mono text-[11px] font-bold mx-auto mb-1.5 border border-blue-200">
                {s.stepNum}
              </span>
              <p className="font-display text-xs font-bold text-slate-800 truncate">
                {s.label}
              </p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {s.subtitle.split(" ")[0]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ====================================================================
          3. THREE STUDENT ACADEMIC ADVANTAGES
          ==================================================================== */}
      <div className="mt-12 grid gap-5 sm:grid-cols-3 text-left">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 mb-3 border border-blue-100">
            <ShieldCheck className="size-5" />
          </div>
          <h3 className="font-display text-sm font-bold text-slate-900">
            Faculty Guide Compliant
          </h3>
          <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
            Every idea is validated against realistic semester deadlines, hardware costs, and academic thesis evaluation rubrics.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 mb-3 border border-emerald-100">
            <Code2 className="size-5" />
          </div>
          <h3 className="font-display text-sm font-bold text-slate-900">
            Production Blueprint & Repo Forge
          </h3>
          <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
            Get multi-tier system schemas, REST API contracts, Docker compose manifests, and 1-click export to GitHub.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 mb-3 border border-amber-100">
            <Sparkles className="size-5" />
          </div>
          <h3 className="font-display text-sm font-bold text-slate-900">
            Viva Voce Oral Defense Coach
          </h3>
          <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
            Contextual AI mentor generates tough external examiner questions and scores your technical defense answers.
          </p>
        </div>
      </div>
    </div>
  );
}
