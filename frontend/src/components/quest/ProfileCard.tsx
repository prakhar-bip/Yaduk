import type { StudentProfile } from "@/lib/types";
import { CheckCircle, AlertTriangle, Sparkles, ArrowRight, Edit3, User, Clock, Users, Target, Layers } from "lucide-react";

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition-all hover:bg-slate-50 hover:border-slate-200 shadow-2xs">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-xs sm:text-sm font-bold text-slate-800 truncate mt-1">{value}</div>
    </div>
  );
}

export function ProfileCard({
  p,
  compact = false,
  onConfirm,
  onEdit,
}: {
  p: StudentProfile;
  compact?: boolean;
  onConfirm?: () => void;
  onEdit?: () => void;
}) {
  // Compact representation for sidebars (e.g. in Step 3 IdeaDeck)
  if (compact) {
    return (
      <section className="panel q-rise overflow-hidden border border-slate-200/80 bg-white/95 shadow-sm rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="size-9 shrink-0 grid place-items-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-display text-sm font-bold shadow-xs">
            {p.name ? p.name.slice(0, 1).toUpperCase() : "S"}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-sm font-bold text-slate-900 truncate leading-tight">{p.name}</h3>
            <p className="text-[11px] text-slate-500 truncate">{p.fieldOfStudy}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-slate-50 p-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Year</span>
            <span className="font-semibold text-slate-800 text-[11px]">{p.yearOfStudy}</span>
          </div>
          <div className="rounded-lg bg-slate-50 p-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Weekly</span>
            <span className="font-semibold text-slate-800 text-[11px]">{p.hoursPerWeek}h/wk</span>
          </div>
        </div>

        <div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Top Stack</span>
          <div className="flex flex-wrap gap-1">
            {[...p.skills, ...p.languages].slice(0, 4).map((s) => (
              <span key={s} className="rounded-md bg-blue-50 border border-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Full dedicated unified student profile presentation
  return (
    <section className="panel q-rise mx-auto max-w-4xl overflow-hidden rounded-3xl border border-blue-200/80 bg-white/95 shadow-xl shadow-blue-500/5">
      {/* Top Banner Header */}
      <div className="relative border-b border-slate-100 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-6 py-6 text-white sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-16 shrink-0 grid place-items-center rounded-2xl bg-white/10 border border-white/20 text-white font-display text-2xl font-bold shadow-inner backdrop-blur-md">
              {p.name ? p.name.slice(0, 1).toUpperCase() : "S"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                  Step 2 · Student Dossier
                </span>
                <span className="text-xs text-blue-100 hidden sm:inline">· Verified for Architecture Synthesis</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                {p.name}
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                {p.fieldOfStudy} · {p.yearOfStudy} · <span className="font-semibold text-white">{p.experienceLevel}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-300/40 px-3.5 py-1 text-xs font-bold text-emerald-100 backdrop-blur-md">
            <CheckCircle className="size-3.5 text-emerald-300" />
            <span>Profile Ready</span>
          </div>
        </div>
      </div>

      {/* Main Dossier Content */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Executive AI Synopsis */}
        {p.summary && (
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 p-4 sm:p-5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-1.5">
              <Sparkles className="size-3 text-blue-600" />
              <span>Yaduk AI Assessment</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-800 italic font-medium">
              "{p.summary}"
            </p>
          </div>
        )}

        {/* 4 Core Constraints Stats Grid */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
            Project Parameters & Ambition
          </span>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatItem
              icon={<Clock className="size-3 text-blue-500" />}
              label="Time Budget"
              value={`${p.hoursPerWeek}h/wk · ${p.weeks} wks`}
            />
            <StatItem
              icon={<Users className="size-3 text-indigo-500" />}
              label="Team Format"
              value={p.teamSize}
            />
            <StatItem
              icon={<Target className="size-3 text-emerald-500" />}
              label="Career Ambition"
              value={p.careerGoal || "Software Architect"}
            />
            <StatItem
              icon={<Layers className="size-3 text-purple-500" />}
              label="Complexity"
              value={p.complexity}
            />
          </div>
        </div>

        {/* Technical Toolkit & Interests */}
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Skills & Stack */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Technical Arsenal & Stack
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[...p.skills, ...p.languages, ...p.frameworks].map((s) => (
                <span
                  key={s}
                  className="rounded-lg border border-blue-200/80 bg-white px-2.5 py-1 text-xs font-semibold text-blue-800 shadow-2xs"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Interests & Domains */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Target Domains & Focus
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[...p.interests, ...p.domains].map((s) => (
                <span
                  key={s}
                  className="rounded-lg border border-indigo-200/80 bg-white px-2.5 py-1 text-xs font-semibold text-indigo-800 shadow-2xs"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Strengths & Watch-outs */}
        {((p.strengths && p.strengths.length > 0) || (p.watchOuts && p.watchOuts.length > 0)) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {p.strengths && p.strengths.length > 0 && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-2">
                  <CheckCircle className="size-3.5 text-emerald-600" />
                  <span>Strategic Strengths</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {p.strengths.map((s) => (
                    <li key={s} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold leading-none mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {p.watchOuts && p.watchOuts.length > 0 && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-2">
                  <AlertTriangle className="size-3.5 text-amber-600" />
                  <span>Potential Watch-Outs</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {p.watchOuts.map((s) => (
                    <li key={s} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold leading-none mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Combined Action Bar */}
        <div className="border-t border-slate-100 pt-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
            Your tailored project ideas, feasibility reality check, and build roadmap will be synthesized from this dossier.
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
              >
                <Edit3 className="size-3.5 text-slate-500" />
                <span>Edit Answers</span>
              </button>
            )}

            {onConfirm && (
              <button
                type="button"
                onClick={onConfirm}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Show My Project Ideas</span>
                <ArrowRight className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
