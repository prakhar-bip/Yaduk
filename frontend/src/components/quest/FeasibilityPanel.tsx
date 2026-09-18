import { useState } from "react";
import type { Feasibility, ProjectIdea } from "@/lib/types";
import { CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, Sparkles, BookOpen, Clock, Layers } from "lucide-react";

export function FeasibilityPanel({
  idea,
  f,
  busy,
  onChoose,
  onBack,
}: {
  idea: ProjectIdea;
  f: Feasibility;
  busy: boolean;
  onChoose: (direction: string, label: string) => void;
  onBack: () => void;
}) {
  const [note, setNote] = useState("");

  return (
    <section className="space-y-6">
      {/* Title */}
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-3 py-0.5 text-xs font-semibold text-blue-700 mb-1.5">
          <Sparkles className="size-3 text-blue-600" />
          Honest Reality Check
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
          Can you realistically build <span className="text-blue-600">{idea.name}</span>?
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          We analyzed your timeframe, technical stack, and learning curve to prevent scope overload.
        </p>
      </div>

      {/* Main Verdict Card */}
      <div className="panel q-rise overflow-hidden border border-slate-200/80 bg-white/95 shadow-xl shadow-blue-500/5">
        {/* Verdict Header Banner */}
        <div
          className={`flex items-center gap-4 border-b p-5 sm:p-6 ${
            f.achievable
              ? "border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/40 text-emerald-950"
              : "border-amber-100 bg-gradient-to-r from-amber-50 via-white to-amber-50/40 text-amber-950"
          }`}
        >
          <div
            className={`size-12 shrink-0 grid place-items-center rounded-2xl shadow-xs ${
              f.achievable ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
            }`}
          >
            {f.achievable ? <CheckCircle2 className="size-6" /> : <AlertTriangle className="size-6" />}
          </div>
          <div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                f.achievable ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {f.achievable ? "Achievable Scope" : "High Complexity Warning"}
            </span>
            <p className="font-display text-lg sm:text-xl font-bold leading-snug">{f.verdict}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid gap-6 p-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Architect Analysis</span>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-700">{f.reasoning}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  <Clock className="size-3 text-blue-500" />
                  <span>Time Assessment</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">{f.timeVerdict}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  <Layers className="size-3 text-indigo-500" />
                  <span>Resource Match</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">{f.resourceVerdict}</p>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">New Skills You Need to Learn</span>
              <div className="flex flex-wrap gap-1.5">
                {f.skillGaps.map((s) => (
                  <span key={s} className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Learning Roadmap */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
              <BookOpen className="size-4 text-blue-600" />
              <span>Recommended Learning Path</span>
            </div>
            <ol className="relative space-y-3.5">
              <span className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-slate-200" />
              {f.learningRoadmap.map((step, i) => (
                <li key={step.skill} className="relative pl-8">
                  <span className="absolute left-0 top-0 grid size-6 place-items-center rounded-full bg-blue-600 font-mono text-[10px] font-bold text-white shadow-xs">
                    {i + 1}
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">{step.skill}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {step.how} · <span className="font-semibold text-blue-600">~{step.weeks} wks</span>
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Decision Options */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">Choose Your Execution Direction:</span>
        <div className="grid gap-4 md:grid-cols-3">
          <button
            onClick={() => onChoose("build the project as selected", "as selected")}
            disabled={busy}
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-blue-500 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer shadow-sm"
          >
            <span className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-700 border border-blue-200">
              Option A
            </span>
            <p className="mt-2.5 font-display text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Proceed As Planned
            </p>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Keep the full original scope and adhere to the learning path.
            </p>
          </button>

          <button
            onClick={() => onChoose(`build the simplified version: ${f.simplified.name} — ${f.simplified.summary}`, "simplified")}
            disabled={busy}
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-indigo-500 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer shadow-sm"
          >
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-700 border border-indigo-200">
              Option B · Streamlined
            </span>
            <p className="mt-2.5 font-display text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {f.simplified.name}
            </p>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              {f.simplified.summary}
            </p>
          </button>

          <button
            onClick={() => onChoose(`switch to the alternative project: ${f.alternative.name} — ${f.alternative.summary}`, "alternative")}
            disabled={busy}
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-emerald-500 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer shadow-sm"
          >
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 border border-emerald-200">
              Option C · Alternative
            </span>
            <p className="mt-2.5 font-display text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              {f.alternative.name}
            </p>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              {f.alternative.summary}
            </p>
          </button>
        </div>
      </div>

      {/* Custom Adjustment Input */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
          Option D · Custom Tech or Scope Refinement
        </span>
        <p className="text-xs text-slate-500 mb-3">
          Specify exact frameworks, dropped features, or custom requirements to tailor the architectural plan.
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="e.g. Keep the idea but use Python FastAPI instead of Node.js, and remove the mobile application..."
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs sm:text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => onChoose(`build the project with this student feedback applied: ${note.trim()}`, "your own feedback")}
            disabled={busy || note.trim().length === 0}
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-6 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-700 disabled:opacity-40 cursor-pointer"
          >
            <span>Apply Custom Feedback & Generate Plan</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Footer back button */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Project Ideas</span>
        </button>
        {busy && <span className="text-xs font-bold text-blue-600 animate-pulse">Synthesizing Architectural Blueprint with AI...</span>}
      </div>
    </section>
  );
}
