import React from "react";
import { Sparkles } from "lucide-react";

interface BookSpineRibbonProps {
  onToggleMentor?: () => void;
  isMentorOpen?: boolean;
}

export function BookSpineRibbon({
  onToggleMentor,
  isMentorOpen,
}: BookSpineRibbonProps) {
  return (
    <>
      {/* Visual Spine Gutter Depth */}
      <div className="book-center-spine hidden md:block" aria-hidden="true" />

      {/* Hanging Collegiate Satin Ribbon Marker */}
      <button
        type="button"
        onClick={onToggleMentor}
        title={isMentorOpen ? "Close AI TA Desk" : "Open AI TA Desk / Viva Coach"}
        className="book-ribbon group hidden md:flex flex-col items-center pt-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
      >
        <span className="sr-only">Toggle AI Campus Mentor</span>
        <Sparkles className="size-3 text-amber-300 drop-shadow-xs group-hover:rotate-12 transition-transform" />
        <span className="mono-label text-[8px] text-white/90 font-bold tracking-widest mt-1 uppercase select-none [writing-mode:vertical-lr]">
          AI TA
        </span>
      </button>
    </>
  );
}
