import { useState } from "react";
import type { ProjectIdea } from "@/lib/types";
import { CheckCircle2, ChevronDown, ChevronUp, Sparkles, RefreshCw, Clock, BarChart3, ArrowRight, Target, Lightbulb, AlertCircle } from "lucide-react";

const RARITY: Record<string, { label: string; cls: string }> = {
  legendary: { label: "Top Recommendation", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  epic: { label: "Strong Fit", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  rare: { label: "Great Alternative", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  common: { label: "Viable Project", cls: "bg-slate-50 text-slate-600 border-slate-200" },
};

const METRICS: { key: keyof ProjectIdea["match"]; label: string }[] = [
  { key: "skill", label: "Skill Match" },
  { key: "interest", label: "Interest" },
  { key: "feasibility", label: "Feasibility" },
  { key: "career", label: "Career Value" },
  { key: "portfolio", label: "Portfolio" },
  { key: "time", label: "Time Budget" },
];

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-semibold text-slate-600">
        <span>{label}</span>
        <span className="text-slate-900 font-bold">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 border border-slate-200/60">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            value >= 75
              ? "bg-emerald-500"
              : value >= 55
                ? "bg-blue-500"
                : "bg-amber-500"
          }`}
          style={{ width: `${Math.max(5, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

export function IdeaCard({
  idea,
  index,
  selected,
  onSelect,
  onFeedback,
  busy,
}: {
  idea: ProjectIdea;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onFeedback: (action: string) => void;
  busy: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rarity = RARITY[idea.rarity ?? "common"] ?? RARITY["common"]!;

  return (
    <article
      className={`panel card-lift q-pop relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 ${
        selected
          ? "border-blue-600 ring-2 ring-blue-500/20 shadow-xl shadow-blue-500/10 bg-white"
          : "border-slate-200/80 bg-white/95 shadow-sm hover:border-slate-300 hover:shadow-md"
      }`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Top Header */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/60 to-blue-50/30 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${rarity.cls}`}>
                <Sparkles className="size-2.5" />
                {rarity.label}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                <BarChart3 className="size-3 text-slate-400" />
                {idea.difficulty}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                <Clock className="size-3 text-slate-400" />
                {idea.estimatedTime}
              </span>
            </div>

            <h3 className="mt-2 font-display text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {idea.name}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{idea.tagline}</p>
          </div>

          {/* Match Score Badge */}
          <div className="shrink-0 text-center">
            <div className="rounded-xl border border-blue-200/80 bg-gradient-to-b from-blue-50 to-indigo-50/60 px-3 py-1.5 text-center shadow-2xs">
              <div className="font-display text-base sm:text-lg font-black text-blue-700 leading-none">
                {idea.overall}%
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 block mt-0.5">
                Match
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Body: Problem vs Solution structured cards */}
      <div className="flex-1 space-y-3 p-4 sm:p-5 text-xs text-slate-700">
        {/* The Problem */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <AlertCircle className="size-3 text-amber-500" />
            <span>The Challenge</span>
          </span>
          <p className="leading-relaxed text-slate-600">{idea.problem}</p>
        </div>

        {/* Proposed Solution */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
            <Lightbulb className="size-3 text-blue-500" />
            <span>Yaduk Architectural Solution</span>
          </span>
          <p className="leading-relaxed text-slate-800 font-medium">{idea.solution}</p>
        </div>

        {/* Skills Tag Pills */}
        <div className="pt-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Required Toolkit
          </span>
          <div className="flex flex-wrap gap-1">
            {idea.requiredSkills.map((s) => (
              <span
                key={s}
                className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700 shadow-2xs"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Compatibility Metrics Toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            <span>{open ? "Hide Compatibility Scores" : "View Compatibility Scores"}</span>
            {open ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </button>

          {open && (
            <div className="mt-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-2.5 q-rise">
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
                {METRICS.map((m) => (
                  <Meter key={m.key} label={m.label} value={idea.match?.[m.key] ?? 0} />
                ))}
              </div>
              <div className="border-t border-slate-200/60 pt-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Profile Alignment Reason
                </span>
                <p className="text-[11px] leading-relaxed text-slate-600">{idea.why}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer: Compact CTA & Quick Refinements */}
      <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-3">
        {/* Refinement chips */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
              Refine:
            </span>
            {[
              ["Similar", "give me similar ideas"],
              ["Advanced", "make it more advanced"],
              ["Simpler", "give me a simpler version"],
              ["New Domain", "change the project domain"],
            ].map(([label, action]) => (
              <button
                key={label}
                type="button"
                onClick={() => onFeedback(action)}
                disabled={busy}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 transition-colors cursor-pointer shadow-2xs"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Compact Select Button */}
          <button
            type="button"
            onClick={onSelect}
            disabled={busy}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              selected
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                : "bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
            }`}
          >
            {selected ? (
              <>
                <CheckCircle2 className="size-3.5" />
                <span>Selected</span>
              </>
            ) : (
              <>
                <span>Select Project</span>
                <ArrowRight className="size-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export function IdeaDeck({
  ideas,
  selectedId,
  busy,
  onSelect,
  onFeedback,
  onReroll,
}: {
  ideas: ProjectIdea[];
  selectedId: string | null;
  busy: boolean;
  onSelect: (idea: ProjectIdea) => void;
  onFeedback: (idea: ProjectIdea, action: string) => void;
  onReroll: () => void;
}) {
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">
            <Sparkles className="size-2.5 text-blue-600" />
            AI Matched Concepts
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
            Recommended Project Ideas
          </h2>
          <p className="text-xs text-slate-500">
            Scored quantitatively against your skills, weekly commitment and ambition.
          </p>
        </div>
        <button
          type="button"
          onClick={onReroll}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`size-3.5 text-slate-500 ${busy ? "animate-spin" : ""}`} />
          <span>{busy ? "Generating…" : "Regenerate Ideas"}</span>
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {ideas.map((idea, i) => (
          <IdeaCard
            key={idea.id + i}
            idea={idea}
            index={i}
            selected={selectedId === idea.id}
            busy={busy}
            onSelect={() => onSelect(idea)}
            onFeedback={(action) => onFeedback(idea, action)}
          />
        ))}
      </div>
    </section>
  );
}
