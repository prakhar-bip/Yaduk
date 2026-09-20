import React, { useState, useEffect } from "react";
import type { Stage } from "@/lib/types";
import { YadukLogo } from "./YadukLogo";
import {
  CheckCircle2,
  Lock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  BookOpen,
  User,
  Home,
  RotateCcw,
  LogOut,
} from "lucide-react";

export const STAGES: {
  key: Stage;
  label: string;
  stepNum: number;
  subtitle: string;
  description: string;
}[] = [
  {
    key: "discovery",
    label: "Discovery",
    stepNum: 1,
    subtitle: "Candidate & Skill Diagnostic",
    description: "Capture your engineering branch, verified programming stack, domain interests, and weekly time budget.",
  },
  {
    key: "profile",
    label: "Profile",
    stepNum: 2,
    subtitle: "Academic & Technical Dossier",
    description: "Review your calculated diagnostic score, verified technical strengths, and project feasibility boundary.",
  },
  {
    key: "ideas",
    label: "Project Ideas",
    stepNum: 3,
    subtitle: "Capstone Ideation Deck",
    description: "Inspect tailored final-year capstone ideas ranked with multi-dimensional compatibility and novelty scores.",
  },
  {
    key: "feasibility",
    label: "Reality Check",
    stepNum: 4,
    subtitle: "Scope & Timeline Audit",
    description: "Verify your semester timeline, third-party dependency risks, and faculty advisor approval criteria.",
  },
  {
    key: "blueprint",
    label: "System Blueprint",
    stepNum: 5,
    subtitle: "Architecture & Implementation Roadmap",
    description: "Multi-tier system architecture, component dataflow, and 8-phase implementation roadmap.",
  },
  {
    key: "theme",
    label: "Theme",
    stepNum: 6,
    subtitle: "UI/UX Visual Styling",
    description: "Select an accessible, light-theme design system and presentation tokens for your project.",
  },
  {
    key: "contract",
    label: "Backend & DB Spec",
    stepNum: 7,
    subtitle: "Database Schemas & API Matrix",
    description: "Inspect relational database schemas, Pydantic models, and RESTful API contract specifications.",
  },
  {
    key: "setup",
    label: "Setup & Dependencies",
    stepNum: 8,
    subtitle: "Environment & Docker Manifest",
    description: "Containerized Docker configuration, virtual environments, and local developer bootstrap scripts.",
  },
  {
    key: "codebase",
    label: "Full-Stack Codebase",
    stepNum: 9,
    subtitle: "Code Explorer & Repo Forge",
    description: "Interactive full-stack code repository, live file preview, and 1-click export to GitHub.",
  },
];

interface StudentStudioLayoutProps {
  currentStage: Stage;
  onSelectStage: (stage: Stage) => void;
  onGoHome?: () => void;
  onResetFlow?: () => void;
  onLogout?: () => void;
  studentName?: string;
  onToggleMentor?: () => void;
  isMentorOpen?: boolean;
  children: React.ReactNode;
  leftPageOverride?: React.ReactNode;
  isBusy?: boolean;
  onProceedNext?: () => void;
  canProceedNext?: boolean;
  nextButtonLabel?: string;
}

export function BookWorkspace({
  currentStage,
  onSelectStage,
  onGoHome,
  onResetFlow,
  onLogout,
  studentName,
  onToggleMentor: _onToggleMentor,
  isMentorOpen: _isMentorOpen,
  children,
  leftPageOverride,
  isBusy,
  onProceedNext,
  canProceedNext = true,
  nextButtonLabel,
}: StudentStudioLayoutProps) {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);
  const activeStage = STAGES[currentIndex] || STAGES[0];

  // Track max unlocked stage so students can jump back and forth
  const [maxUnlockedIndex, setMaxUnlockedIndex] = useState(currentIndex);

  useEffect(() => {
    if (currentIndex > maxUnlockedIndex) {
      setMaxUnlockedIndex(currentIndex);
    }
  }, [currentIndex, maxUnlockedIndex]);

  // Dropdown menu state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleStageClick = (targetStage: Stage, targetIndex: number) => {
    if (targetIndex > maxUnlockedIndex) return;
    if (targetIndex === currentIndex) return;
    onSelectStage(targetStage);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectStage(STAGES[currentIndex - 1].key);
    }
  };

  const handleNext = () => {
    if (onProceedNext) {
      onProceedNext();
      return;
    }
    if (currentIndex < STAGES.length - 1 && currentIndex < maxUnlockedIndex) {
      onSelectStage(STAGES[currentIndex + 1].key);
    }
  };

  const percentComplete = Math.round(((currentIndex + 1) / STAGES.length) * 100);

  return (
    <div className="mx-auto w-full max-w-6xl pb-20">
      {/* ====================================================================
          1. CLEAN TOP HEADER (College Capstone Portal)
          ==================================================================== */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700">
            <YadukLogo size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Yaduk Capstone Studio
              </h1>
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-800 border border-blue-200/80">
                <GraduationCap className="size-3 text-blue-700" />
                Sem 8 Capstone
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Stage {currentIndex + 1} of {STAGES.length}: <strong className="text-slate-800 font-semibold">{activeStage.label}</strong>
            </p>
          </div>
        </div>

        {/* ====================================================================
            STUDENT PROFILE & ACADEMIC MENU (Right Corner Dropdown)
            ==================================================================== */}
        <div className="relative ml-auto" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            className="flex items-center gap-2 sm:gap-2.5 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 px-3.5 py-1.5 text-xs text-slate-800 transition-all shadow-xs cursor-pointer select-none"
            title="Candidate Profile & Menu"
          >
            <div className="grid size-7 place-items-center rounded-xl bg-blue-600 font-bold text-white text-xs shadow-xs">
              <User className="size-3.5" />
            </div>
            <span className="font-bold text-slate-900 text-xs">Profile</span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="font-medium text-slate-600 hidden sm:inline max-w-[120px] truncate">
              {studentName || "Candidate"}
            </span>
            <div className="flex items-center gap-1 rounded-full bg-blue-100 border border-blue-200 px-2 py-0.5 text-[11px] font-extrabold text-blue-800">
              <BookOpen className="size-3 text-blue-700" />
              <span>{percentComplete}%</span>
            </div>
            <ChevronDown
              className={`size-3.5 text-slate-400 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180 text-blue-600" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 origin-top-right rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xl shadow-slate-900/10 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Profile & Stage Progress Header */}
              <div className="rounded-xl bg-slate-50/90 border border-slate-100 p-3 mb-1.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="grid size-8 place-items-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs">
                      <User className="size-4 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs leading-none">
                        {studentName || "Engineering Candidate"}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        B.Tech CSE · Sem 8 Capstone
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                    {percentComplete}%
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span>Progress (Stage {currentIndex + 1}/9)</span>
                    <span className="font-semibold text-slate-700">{activeStage.label}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${percentComplete}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Menu Actions */}
              <div className="space-y-0.5">
                {onGoHome && (
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onGoHome();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Home className="size-4 text-slate-500 shrink-0" />
                    <div className="text-left flex-1">
                      <span className="font-semibold block text-slate-800">Portal Overview</span>
                      <span className="text-[10px] text-slate-500">Return to landing cover</span>
                    </div>
                  </button>
                )}

                {onResetFlow && (
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onResetFlow();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-amber-800 hover:bg-amber-50 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="size-4 text-amber-600 shrink-0" />
                    <div className="text-left flex-1">
                      <span className="font-semibold block text-amber-900">Reset Flow</span>
                      <span className="text-[10px] text-amber-700/80">Restart from Stage 1: Discovery</span>
                    </div>
                  </button>
                )}

                <div className="border-t border-slate-100 my-1" />

                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="size-4 text-red-500 shrink-0" />
                    <div className="text-left flex-1">
                      <span className="font-semibold block text-red-600">Log Out</span>
                      <span className="text-[10px] text-red-400">Sign out of current account</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ====================================================================
          2. SIMPLE 9-STAGE ACADEMIC STEPPER
          ==================================================================== */}
      <nav aria-label="Project Roadmap" className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {STAGES.map((s, idx) => {
            const isActive = s.key === currentStage;
            const isCompleted = idx < currentIndex;
            const isUnlocked = idx <= maxUnlockedIndex;

            return (
              <button
                key={s.key}
                type="button"
                disabled={!isUnlocked}
                onClick={() => handleStageClick(s.key, idx)}
                title={isUnlocked ? `Stage ${s.stepNum}: ${s.label}` : `Stage ${s.stepNum} is locked`}
                className={`studio-step-pill flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all select-none border cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white font-bold border-blue-600 shadow-sm shadow-blue-500/25"
                    : isCompleted
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70"
                      : isUnlocked
                        ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                        : "bg-slate-100/70 text-slate-400 border-slate-200/50 opacity-60 cursor-not-allowed"
                }`}
              >
                <span
                  className={`flex size-4.5 items-center justify-center rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-white text-blue-700"
                      : isCompleted
                        ? "bg-emerald-200 text-emerald-800"
                        : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="size-3 text-emerald-700" /> : s.stepNum}
                </span>
                <span className="whitespace-nowrap">{s.label}</span>
                {!isUnlocked && <Lock className="size-2.5 text-slate-400 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ====================================================================
          3. STAGE TITLE CARD WITH NAVIGATION
          ==================================================================== */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Stage {activeStage.stepNum} of 9
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {activeStage.subtitle}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            {activeStage.description}
          </p>
        </div>

        {/* Quick Nav Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="size-3.5" />
            <span>Previous</span>
          </button>

          {onProceedNext && (
            <button
              type="button"
              disabled={isBusy || !canProceedNext}
              onClick={onProceedNext}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <span>{nextButtonLabel || "Continue →"}</span>
              <ChevronRight className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ====================================================================
          4. MAIN CLEAN WORKSPACE CANVAS
          ==================================================================== */}
      <div className="space-y-6">
        {leftPageOverride ? (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              {leftPageOverride}
            </aside>
            <main className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs">
              {children}
            </main>
          </div>
        ) : (
          <main className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs">
            {children}
          </main>
        )}
      </div>
    </div>
  );
}
