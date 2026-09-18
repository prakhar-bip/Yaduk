import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, Layers } from "lucide-react";
import type { Stage } from "@/lib/types";

interface StepQuickNavigatorProps {
  currentStage: Stage;
  onNavigate: (stage: Stage) => void;
}

const STEPS: { stage: Stage; label: string; stepNumber: string }[] = [
  { stage: "intro", label: "Landing", stepNumber: "0" },
  { stage: "discovery", label: "Discovery", stepNumber: "1" },
  { stage: "profile", label: "Profile", stepNumber: "2" },
  { stage: "ideas", label: "Ideas", stepNumber: "3" },
  { stage: "feasibility", label: "Reality Check", stepNumber: "4" },
  { stage: "blueprint", label: "Blueprint", stepNumber: "5" },
  { stage: "theme", label: "Theme Studio", stepNumber: "6" },
  { stage: "prototype", label: "Prototype Forge", stepNumber: "7" },
];

export function StepQuickNavigator({ currentStage, onNavigate }: StepQuickNavigatorProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <aside
      aria-label="Development Stage Quick Navigator"
      className="fixed top-2.5 left-1/2 -translate-x-1/2 z-50 transition-all duration-200"
    >
      <div className="flex items-center gap-1.5 rounded-full border border-blue-200/90 bg-white/95 px-3 py-1.5 shadow-xl shadow-blue-500/10 backdrop-blur-md">
        <div className="flex items-center gap-1.5 pl-1 pr-2 border-r border-slate-200">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-blue-700 hidden sm:inline">
            Fast Nav
          </span>
        </div>

        {!isMinimized && (
          <div className="flex items-center gap-1 overflow-x-auto max-w-[85vw] sm:max-w-none py-0.5">
            {STEPS.map((s) => {
              const isActive = currentStage === s.stage;
              return (
                <button
                  key={s.stage}
                  type="button"
                  onClick={() => onNavigate(s.stage)}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white font-bold shadow-xs scale-102"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                  title={`Jump directly to Step ${s.stepNumber}: ${s.label}`}
                >
                  <span
                    className={`font-mono text-[9px] ${
                      isActive ? "text-blue-100" : "text-slate-400"
                    }`}
                  >
                    {s.stepNumber}
                  </span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsMinimized(!isMinimized)}
          className="size-6 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 grid place-items-center ml-1 cursor-pointer"
          title={isMinimized ? "Expand Fast Navigator" : "Minimize Fast Navigator"}
        >
          {isMinimized ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
        </button>
      </div>
    </aside>
  );
}
