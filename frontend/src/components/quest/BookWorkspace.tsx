import React, { useState, useEffect } from "react";
import type { Stage } from "@/lib/types";
import { BookSpineRibbon } from "./BookSpineRibbon";
import { BookPageHeader } from "./BookPageHeader";
import {
  CheckCircle2,
  Lock,
  ArrowRight,
  BookOpen,
  ClipboardList,
  Sparkles,
  Award,
  ChevronRight,
} from "lucide-react";

export const BOOK_STAGES: {
  key: Stage;
  label: string;
  chapter: string;
  subtitle: string;
  rubric: string[];
}[] = [
  {
    key: "discovery",
    label: "Discovery",
    chapter: "Chapter 1",
    subtitle: "Candidate & Skill Diagnostic",
    rubric: [
      "Select engineering branch & semester standing",
      "Declare verified programming languages & frameworks",
      "Specify domain interests (AI/ML, Web3, IoT, Cloud)",
      "Set honest weekly development time budget",
    ],
  },
  {
    key: "profile",
    label: "Profile",
    chapter: "Chapter 2",
    subtitle: "Academic & Technical Dossier",
    rubric: [
      "Diagnostic strength score calculated",
      "Technical boundary & learning hurdles mapped",
      "Core domain feasibility verified",
      "Candidate profile locked for project generation",
    ],
  },
  {
    key: "ideas",
    label: "Project Ideas",
    chapter: "Chapter 3",
    subtitle: "Capstone Ideation Deck",
    rubric: [
      "Review tailored problem statements with real-world impact",
      "Inspect compatibility & novelty scoring rings",
      "Provide natural feedback for dynamic idea refinement",
      "Select flagship capstone direction",
    ],
  },
  {
    key: "feasibility",
    label: "Reality Check",
    chapter: "Chapter 4",
    subtitle: "Scope & Timeline Audit",
    rubric: [
      "Verify completion timeline against semester deadline",
      "Audit API costs and third-party hardware requirements",
      "Review faculty advisor risks & contingency paths",
      "Lock in direction for architecture blueprinting",
    ],
  },
  {
    key: "blueprint",
    label: "System Blueprint",
    chapter: "Chapter 5",
    subtitle: "Architecture & Implementation Roadmap",
    rubric: [
      "Multi-tier component architecture & dataflow",
      "MVP specification versus future scope",
      "8-Phase step-by-step implementation milestones",
      "Viva defense risk mitigation matrix",
    ],
  },
  {
    key: "theme",
    label: "Theme",
    chapter: "Chapter 6",
    subtitle: "UI/UX Visual Styling",
    rubric: [
      "Choose accessible light-theme visual style",
      "Preview component design tokens & typography",
      "Align frontend styling with college presentation guidelines",
    ],
  },
  {
    key: "contract",
    label: "Backend & DB Spec",
    chapter: "Chapter 7",
    subtitle: "Database Schemas & API Matrix",
    rubric: [
      "Relational schema & entity-relationship matrix",
      "Pydantic data models & REST endpoint contracts",
      "Authentication & security permission rules",
    ],
  },
  {
    key: "setup",
    label: "Setup & Dependencies",
    chapter: "Chapter 8",
    subtitle: "Environment & Docker Manifest",
    rubric: [
      "Containerized Docker compose architecture",
      "Backend virtualenv & frontend package dependencies",
      "Local developer bootstrap script verified",
    ],
  },
  {
    key: "codebase",
    label: "Full-Stack Codebase",
    chapter: "Chapter 9",
    subtitle: "Code Explorer & Repo Forge",
    rubric: [
      "Interactive multi-file codebase explorer",
      "FastAPI backend & React 19 frontend integration",
      "1-Click export to GitHub & ZIP archive download",
      "Final viva presentation signoff",
    ],
  },
];

interface BookWorkspaceProps {
  currentStage: Stage;
  onSelectStage: (stage: Stage) => void;
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
  studentName,
  onToggleMentor,
  isMentorOpen,
  children,
  leftPageOverride,
  isBusy,
  onProceedNext,
  canProceedNext = true,
  nextButtonLabel,
}: BookWorkspaceProps) {
  const currentIndex = BOOK_STAGES.findIndex((s) => s.key === currentStage);
  const activeStageMeta = BOOK_STAGES[currentIndex] || BOOK_STAGES[0];

  // Track the highest unlocked stage so students can freely navigate backwards
  const [maxUnlockedIndex, setMaxUnlockedIndex] = useState(currentIndex);
  const [flipDirection, setFlipDirection] = useState<"forward" | "backward" | null>(null);

  useEffect(() => {
    if (currentIndex > maxUnlockedIndex) {
      setMaxUnlockedIndex(currentIndex);
    }
  }, [currentIndex, maxUnlockedIndex]);

  const handleStageClick = (targetStage: Stage, targetIndex: number) => {
    if (targetIndex > maxUnlockedIndex) return;
    if (targetIndex === currentIndex) return;

    setFlipDirection(targetIndex > currentIndex ? "forward" : "backward");
    setTimeout(() => {
      onSelectStage(targetStage);
      setFlipDirection(null);
    }, 450);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      handleStageClick(BOOK_STAGES[currentIndex - 1].key, currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (onProceedNext) {
      onProceedNext();
      return;
    }
    if (currentIndex < BOOK_STAGES.length - 1 && currentIndex < maxUnlockedIndex) {
      handleStageClick(BOOK_STAGES[currentIndex + 1].key, currentIndex + 1);
    }
  };

  const nextStageMeta = BOOK_STAGES[currentIndex + 1];

  return (
    <div className="book-perspective mx-auto w-full max-w-7xl pb-16">
      {/* ====================================================================
          TOP CHAPTER STEPPER (9 Pipeline Stages as Book Tabs)
          ==================================================================== */}
      <nav aria-label="Capstone Chapters" className="mb-3 px-1 sm:px-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          {BOOK_STAGES.map((s, idx) => {
            const isActive = s.key === currentStage;
            const isCompleted = idx < currentIndex;
            const isUnlocked = idx <= maxUnlockedIndex;

            return (
              <button
                key={s.key}
                type="button"
                disabled={!isUnlocked}
                onClick={() => handleStageClick(s.key, idx)}
                title={isUnlocked ? `${s.chapter}: ${s.label}` : `${s.chapter} is locked`}
                className={`book-tab flex shrink-0 items-center gap-1.5 rounded-t-xl px-3 py-2 text-xs transition-all select-none border border-b-0 cursor-pointer ${
                  isActive
                    ? "book-tab-active border-blue-700 font-bold"
                    : isCompleted
                      ? "bg-white/95 text-slate-800 border-slate-200/90 hover:bg-slate-50"
                      : isUnlocked
                        ? "bg-white/70 text-slate-600 border-slate-200/70 hover:bg-white"
                        : "bg-slate-100/60 text-slate-400 border-slate-200/40 opacity-60 cursor-not-allowed"
                }`}
              >
                <span
                  className={`flex size-4 items-center justify-center rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-white text-blue-700"
                      : isCompleted
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="size-3 text-emerald-600" /> : idx + 1}
                </span>
                <span className="truncate max-w-[130px]">{s.label}</span>
                {!isUnlocked && <Lock className="size-2.5 text-slate-400 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ====================================================================
          THE OPEN HARDCOVER BOOK SPREAD
          ==================================================================== */}
      <div className="book-hardcover">
        <div className="book-spread relative overflow-hidden">
          {/* Spine Gutter & Hanging Ribbon */}
          <BookSpineRibbon
            onToggleMentor={onToggleMentor}
            isMentorOpen={isMentorOpen}
          />

          {/* Book Header within spread */}
          <div className="p-4 sm:p-6 pb-2">
            <BookPageHeader
              currentStage={currentStage}
              stageIndex={currentIndex}
              totalStages={BOOK_STAGES.length}
              stageTitle={activeStageMeta.label}
              studentName={studentName}
              onPrevPage={handlePrev}
              onNextPage={handleNext}
              canGoPrev={currentIndex > 0}
              canGoNext={currentIndex < BOOK_STAGES.length - 1}
            />
          </div>

          {/* TWO-PAGE SPREAD GRID */}
          <div
            className={`grid grid-cols-1 md:grid-cols-12 min-h-[580px] ${
              flipDirection === "forward"
                ? "turn-forward-anim"
                : flipDirection === "backward"
                  ? "turn-backward-anim"
                  : ""
            }`}
          >
            {/* --------------------------------------------------------------
                LEFT PAGE: Context, Syllabus Rubric, Guidelines & Notes
                -------------------------------------------------------------- */}
            <aside className="book-page-left md:col-span-4 p-5 sm:p-6 flex flex-col justify-between border-b md:border-b-0 border-slate-200/80">
              {leftPageOverride ? (
                leftPageOverride
              ) : (
                <div className="space-y-5">
                  {/* Chapter Academic Stamp */}
                  <div className="border-b border-dashed border-slate-300 pb-3">
                    <span className="inline-block font-mono text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {activeStageMeta.chapter}
                    </span>
                    <h2 className="mt-1.5 font-display text-xl font-bold text-slate-900 leading-snug">
                      {activeStageMeta.subtitle}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Academic evaluation guidelines for college submission.
                    </p>
                  </div>

                  {/* Syllabus / Submission Rubric Checklist */}
                  <div>
                    <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                      <ClipboardList className="size-3.5 text-blue-600" />
                      Chapter Evaluation Rubric
                    </h3>
                    <ul className="mt-2.5 space-y-2 text-xs text-slate-600">
                      {activeStageMeta.rubric.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Academic Advisor Sticky Note */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <Sparkles className="size-3.5 text-amber-600" />
                      Faculty Advisor Note
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-amber-800">
                      Ensure your choices align with your semester capstone requirements. The Yaduk AI TA can assist with Viva prep anytime via the bookmark ribbon.
                    </p>
                  </div>
                </div>
              )}

              {/* Left Page Footer / Page Number */}
              <div className="pt-6 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Page {currentIndex * 2 + 1}</span>
                <span className="flex items-center gap-1 text-slate-500 font-sans text-xs">
                  <Award className="size-3 text-blue-600" />
                  Yaduk Engineering Studio
                </span>
              </div>
            </aside>

            {/* --------------------------------------------------------------
                RIGHT PAGE: Interactive Task Canvas & Active Stage UI
                -------------------------------------------------------------- */}
            <section className="book-page-right md:col-span-8 p-5 sm:p-7 flex flex-col justify-between relative">
              {/* Main Stage UI Content */}
              <div className="w-full flex-1">{children}</div>

              {/* Bottom Page-Turn Bar with Corner Curl */}
              <div className="mt-8 pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] font-mono text-slate-400">
                  Page {currentIndex * 2 + 2} of {BOOK_STAGES.length * 2}
                </div>

                {nextStageMeta && (
                  <div className="flex items-center gap-2">
                    {onProceedNext && (
                      <button
                        type="button"
                        disabled={isBusy || !canProceedNext}
                        onClick={onProceedNext}
                        className="book-corner-curl group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-display text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <span>
                          {nextButtonLabel || `Turn Page to ${nextStageMeta.label} →`}
                        </span>
                        <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Quick Access AI TA Floating Tab (for convenience on all screens) */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={onToggleMentor}
          className="flex items-center gap-2 rounded-full bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-lg shadow-blue-700/30 hover:bg-blue-800 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-blue-500/50"
        >
          <Sparkles className="size-4 text-amber-300" />
          <span>{isMentorOpen ? "Close AI TA Desk" : "AI Mentor & Viva Coach"}</span>
        </button>
      </div>
    </div>
  );
}
