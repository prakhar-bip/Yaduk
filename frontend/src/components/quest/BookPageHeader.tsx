import React from "react";
import { GraduationCap, BookOpen, ChevronLeft, ChevronRight, User } from "lucide-react";
import { YadukLogo } from "./YadukLogo";
import type { Stage } from "@/lib/types";

interface BookPageHeaderProps {
  currentStage: Stage;
  stageIndex: number;
  totalStages: number;
  stageTitle: string;
  studentName?: string;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  canGoPrev?: boolean;
  canGoNext?: boolean;
}

export function BookPageHeader({
  currentStage: _currentStage,
  stageIndex,
  totalStages,
  stageTitle,
  studentName,
  onPrevPage,
  onNextPage,
  canGoPrev,
  canGoNext,
}: BookPageHeaderProps) {
  const percentComplete = Math.round(((stageIndex + 1) / totalStages) * 100);

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3.5">
      {/* Left: University / Capstone Brand */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-200/80 shadow-2xs">
          <YadukLogo size={24} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              Yaduk Capstone Journal
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200/80">
              <GraduationCap className="size-3 text-amber-700" />
              Sem 8 Final Year
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-500">
            Chapter {stageIndex + 1} of {totalStages}: <span className="font-semibold text-slate-700">{stageTitle}</span>
          </p>
        </div>
      </div>

      {/* Center / Right: Student Badge & Turn Page Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Student Credential Pill */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/90 px-3 py-1 text-xs text-slate-700 shadow-2xs">
          <div className="grid size-5 place-items-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
            <User className="size-3" />
          </div>
          <span className="font-semibold">{studentName || "Engineering Candidate"}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 font-mono text-[11px]">B.Tech CSE</span>
        </div>

        {/* Progress % */}
        <div className="hidden md:flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200/70 px-3 py-1 text-xs font-semibold text-blue-800">
          <BookOpen className="size-3 text-blue-600" />
          <span>{percentComplete}% Completed</span>
        </div>

        {/* Page Nav Arrows */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={!canGoPrev}
            title="Turn to previous chapter"
            className="flex size-7 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-[11px] font-mono px-1 font-semibold text-slate-500">
            p. {stageIndex + 1}/{totalStages}
          </span>
          <button
            type="button"
            onClick={onNextPage}
            disabled={!canGoNext}
            title="Turn to next chapter"
            className="flex size-7 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
