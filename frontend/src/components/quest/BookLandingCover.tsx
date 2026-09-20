import React from "react";
import { YadukLogo } from "./YadukLogo";
import { useAuth } from "@/lib/auth-context";
import { AuthCard } from "@/components/auth/AuthCard";
import {
  GraduationCap,
  BookOpen,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  Award,
  ChevronRight,
  Library,
} from "lucide-react";
import { BOOK_STAGES } from "./BookWorkspace";

interface BookLandingCoverProps {
  onStart: () => void;
  onOpenAuth: (tab: "login" | "register") => void;
  onAuthSuccess?: () => void;
}

export function BookLandingCover({
  onStart,
  onOpenAuth: _onOpenAuth,
  onAuthSuccess,
}: BookLandingCoverProps) {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="mx-auto max-w-6xl px-2 py-6 sm:py-10">
      {/* ====================================================================
          TOP UNIVERSITY BANNER
          ==================================================================== */}
      <div className="mb-8 text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-4 py-1 text-xs font-bold text-blue-800 shadow-2xs">
          <GraduationCap className="size-4 text-blue-700" />
          <span>University Final-Year Capstone Architecture Platform • 2025–2026</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
          Your Complete Academic <span className="text-blue-700 underline decoration-amber-400 decoration-wavy decoration-2">Capstone Project</span> Journal
        </h1>
        <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed">
          Step-by-step guidance from skill diagnostics to production architecture, starter code, and Viva Voce defense.
        </p>
      </div>

      {/* ====================================================================
          THE CLOSED HARDBOUND BOOK SPREAD (LANDING COVER)
          ==================================================================== */}
      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left / Center: The Embossed Hardcover Capstone Journal */}
        <div className="lg:col-span-7 book-perspective">
          <div className="book-hardcover transition-transform duration-300 hover:shadow-2xl">
            <div className="relative rounded-xl border border-amber-400/40 bg-gradient-to-b from-[#0e213d] via-[#142c52] to-[#0c1c33] p-6 sm:p-9 text-white shadow-inner overflow-hidden">
              {/* Decorative Gold Inset Border */}
              <div className="absolute inset-3.5 rounded-lg border border-amber-400/30 pointer-events-none" />
              <div className="absolute inset-4 rounded-lg border border-amber-400/15 pointer-events-none" />

              {/* Gold Ribbon Bookmark peaking at top */}
              <div className="absolute top-0 right-10 w-6 h-14 bg-gradient-to-b from-amber-500 to-amber-600 shadow-md flex items-end justify-center pb-2">
                <Bookmark className="size-3.5 text-amber-950 fill-amber-950" />
              </div>

              {/* University Seal Header */}
              <div className="relative z-10 flex items-center gap-3.5 border-b border-amber-400/20 pb-5">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg text-slate-950 p-2">
                  <YadukLogo size={36} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xl font-black tracking-wide text-amber-300">
                      YADUK
                    </span>
                    <span className="rounded bg-amber-400/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-amber-200 border border-amber-400/30">
                      CAPSTONE MANUAL
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-300 mt-0.5">
                    Dept. of Computer Science & Engineering • Volume 2025–26
                  </p>
                </div>
              </div>

              {/* Book Front Title */}
              <div className="relative z-10 mt-6 space-y-3">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300/90">
                  <Sparkles className="size-3.5 text-amber-400" />
                  Production-Grade Project Blueprint
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold leading-snug text-white">
                  Engineering Project Discovery, Feasibility & Architecture Manual
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-300 max-w-lg">
                  Transform raw curiosity and semester constraints into an approved, defensible capstone project backed by an AI systems architect and viva coach.
                </p>
              </div>

              {/* 9 Chapter Table of Contents Inside the Cover */}
              <div className="relative z-10 mt-7 rounded-xl bg-slate-900/60 border border-amber-400/25 p-4 backdrop-blur-xs">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2.5">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Library className="size-3 text-amber-400" />
                    Table of Contents (9 Chapters)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Sem 8 Syllabus</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                  {BOOK_STAGES.map((s, idx) => (
                    <div key={s.key} className="flex items-center justify-between text-slate-300 py-0.5">
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="font-mono text-[10px] text-amber-400 font-bold">{idx + 1}.</span>
                        <span className="truncate">{s.label}</span>
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">Ch. {idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Central Primary Action: OPEN THE BOOK */}
              <div className="relative z-10 mt-7 pt-4 border-t border-amber-400/20 flex flex-wrap items-center justify-between gap-4">
                <div>
                  {isAuthenticated && user ? (
                    <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                      Enrolled as {user.fullName || user.email}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-300">
                      Open to all engineering undergraduates
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onStart}
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 px-6 py-3 font-display text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/30 transition-all hover:scale-102 hover:shadow-xl hover:shadow-amber-500/40 active:scale-98 cursor-pointer"
                >
                  <BookOpen className="size-4.5 text-slate-950 group-hover:rotate-6 transition-transform" />
                  <span>
                    {isAuthenticated ? "Open Capstone Book & Resume" : "Open Capstone Book & Begin Step 1"}
                  </span>
                  <ArrowRight className="size-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Candidate Registry Desk (Authentication Card) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-lg bg-blue-50 text-blue-700 font-bold">
                  <Award className="size-4" />
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    Candidate Registry Desk
                  </h3>
                  <p className="text-[11px] text-slate-500">Sign in to save your 9-stage blueprint</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Verified Portal
              </span>
            </div>

            <AuthCard onStartJourney={onStart} {...(onAuthSuccess ? { onAuthSuccess } : {})} />
          </div>

          {/* 3 Academic Guarantees */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-2.5 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <ShieldCheck className="size-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-semibold">Faculty Guide Compliant:</strong>
                <span className="text-slate-600 ml-1">Rigorous feasibility analysis designed for university thesis evaluation rubrics.</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-semibold">Production Architecture:</strong>
                <span className="text-slate-600 ml-1">Complete system dataflow, database schemas, and 8-phase implementation roadmap.</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Sparkles className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-semibold">Viva Voce Defense Simulator:</strong>
                <span className="text-slate-600 ml-1">Contextual AI mentor to rehearse defense answers for tough external examiner questions.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
