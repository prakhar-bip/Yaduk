import type { Blueprint } from "@/lib/types";
import { CheckCircle2, Sparkles, Layers, Cpu, Compass, AlertCircle, ArrowRight, Palette, Github, Zap, Workflow } from "lucide-react";
import { getDefaultUserWorkflow } from "@/lib/quest.functions";

function Section({
  tag,
  title,
  icon,
  children,
  delay = 0,
}: {
  tag: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <section className="panel q-rise overflow-hidden border border-slate-200/80 bg-white/95 shadow-sm" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-3.5">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">{tag}</span>
            <h3 className="font-display text-lg font-bold text-slate-900 leading-none">{title}</h3>
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function BlueprintView({
  b,
  changeLog = [],
  onGeneratePrototype,
  isGeneratingPrototype = false,
}: {
  b: Blueprint;
  changeLog?: string[];
  onGeneratePrototype?: () => void;
  isGeneratingPrototype?: boolean;
}) {
  const overview = b?.overview || {
    summary: "",
    problemStatement: "",
    proposedSolution: "",
    objectives: [],
    targetUsers: "",
    expectedImpact: "",
  };

  const mvpFeatures = b?.mvpFeatures || [];
  const advancedFeatures = b?.advancedFeatures || [];
  const futureImprovements = b?.futureImprovements || [];
  const stack = b?.stack || [];
  const layers = b?.architecture?.layers || [];
  const dataFlow = b?.architecture?.dataFlow || "";
  const userWorkflow = (b?.userWorkflow && b.userWorkflow.length > 0) ? b.userWorkflow : getDefaultUserWorkflow(b?.title);
  const roadmap = b?.roadmap || [];
  const challenges = b?.challenges || [];
  const safeChangeLog = changeLog || [];

  return (
    <div className="space-y-6">
      {/* Top Banner & Overview Card */}
      <div className="panel q-rise overflow-hidden border border-slate-200/80 bg-white/95 shadow-xl shadow-blue-500/5">
        {/* Banner Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-6 py-6 text-white sm:px-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-white/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                Verified System Blueprint
              </span>
              <span className="text-xs text-blue-100 hidden sm:inline">· Ready for Code Execution</span>
            </div>
            <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {b?.title || "Project Blueprint"}
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1.5 backdrop-blur-md text-xs font-semibold text-white">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>Architecture Locked</span>
          </div>
        </div>

        {/* Overview Body */}
        <div className="grid gap-5 p-6 sm:p-8 lg:grid-cols-2">
          <div className="space-y-3.5">
            <p className="text-sm leading-relaxed text-slate-700">{overview.summary}</p>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Problem Statement</span>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-800">{overview.problemStatement}</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">Proposed Solution</span>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-800 font-medium">{overview.proposedSolution}</p>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Core Objectives</span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {(overview.objectives || []).map((o) => (
                  <li key={o} className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Target Users</span>
                <p className="text-xs text-slate-700 font-medium">{overview.targetUsers}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Expected Impact</span>
                <p className="text-xs text-slate-700 font-medium">{overview.expectedImpact}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Sets: MVP, Advanced, Future */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Section
          tag="Phase 1 Deliverables"
          title="Core MVP Features"
          icon={<div className="size-2 rounded-full bg-blue-600" />}
          delay={60}
        >
          <ul className="space-y-3">
            {mvpFeatures.map((f) => (
              <li key={f.name} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 transition-all hover:bg-slate-50">
                <p className="text-xs sm:text-sm font-bold text-slate-900">{f.name}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{f.detail}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          tag="Phase 2 Scope"
          title="Advanced Features"
          icon={<div className="size-2 rounded-full bg-indigo-600" />}
          delay={120}
        >
          <ul className="space-y-3">
            {advancedFeatures.map((f) => (
              <li key={f.name} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 transition-all hover:bg-slate-50">
                <p className="text-xs sm:text-sm font-bold text-slate-900">{f.name}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{f.detail}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          tag="Phase 3 & Beyond"
          title="Future Improvements"
          icon={<div className="size-2 rounded-full bg-emerald-600" />}
          delay={180}
        >
          <ul className="space-y-2.5 text-xs text-slate-700">
            {futureImprovements.map((f) => (
              <li key={f} className="flex items-start gap-2 rounded-lg bg-slate-50/70 p-2.5">
                <span className="text-emerald-500 font-bold mt-0.5">★</span>
                <span className="leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* Recommended Tech Stack */}
      <Section
        tag="Engineering Toolkit"
        title="Tailored Tech Stack"
        icon={<Cpu className="size-4 text-blue-600" />}
        delay={60}
      >
        <div className="grid gap-3.5 md:grid-cols-2">
          {stack.map((t) => (
            <div key={t.name} className="card-lift rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:border-slate-200 hover:bg-white hover:shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-display text-sm sm:text-base font-bold text-slate-900">{t.name}</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                    t.isNew
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {t.isNew ? "Learn along way" : "In your arsenal"}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">{t.category}</span>
              <p className="mt-2 text-xs leading-relaxed text-slate-700">
                <span className="font-semibold text-slate-900">Why chosen: </span>
                {t.why}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                <span className="font-semibold text-slate-700">Implementation: </span>
                {t.howUsed}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* High-Level Architecture */}
      <Section
        tag="System Design"
        title="High-Level Architecture & Data Flow"
        icon={<Layers className="size-4 text-blue-600" />}
        delay={90}
      >
        <div className="flex flex-wrap items-stretch gap-3 overflow-x-auto pb-2">
          {layers.map((l, i) => (
            <div key={l.name} className="flex items-center gap-3">
              <div className="min-w-44 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600">Layer {i + 1}</span>
                <p className="font-display text-xs sm:text-sm font-bold text-slate-900 mt-0.5">{l.name}</p>
                <ul className="mt-2 space-y-1">
                  {(l.parts || []).map((p) => (
                    <li key={p} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                      <span className="size-1 rounded-full bg-slate-400" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {i < layers.length - 1 && (
                <div className="text-slate-300">
                  <ArrowRight className="size-4" />
                </div>
              )}
            </div>
          ))}
        </div>
        {dataFlow && (
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs leading-relaxed text-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Data Flow Cycle</span>
            {dataFlow}
          </div>
        )}
      </Section>

      {/* End-to-End Application Screen & User Journey Workflow */}
      <Section
        tag="Application User Journey"
        title="Screen Navigation & Interaction Workflow"
        icon={<Workflow className="size-4 text-indigo-600" />}
        delay={105}
      >
        <p className="text-xs text-slate-500 mb-4">
          The sequential end-user flow and route hierarchy from initial public landing to core execution and reviews:
        </p>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
          {userWorkflow.map((step, idx) => (
            <div
              key={step.step || idx}
              className="relative rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 flex flex-col justify-between shadow-2xs hover:bg-white hover:border-indigo-300 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="grid size-6 place-items-center rounded-full bg-indigo-600 text-[10px] font-mono font-bold text-white shadow-xs">
                    {step.step || idx + 1}
                  </span>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700">
                    {step.route || "/"}
                  </span>
                </div>

                <h4 className="font-display text-xs sm:text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                  {step.screen}
                </h4>

                <p className="mt-1.5 text-[11px] text-slate-600 leading-relaxed">
                  {step.userAction}
                </p>
              </div>

              {step.keyComponents && step.keyComponents.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/70">
                  <span className="text-[9px] font-mono text-slate-400 block mb-1 uppercase tracking-wider">
                    Components
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {step.keyComponents.map((comp, cIdx) => (
                      <span
                        key={cIdx}
                        className="rounded bg-white border border-slate-200/80 px-1.5 py-0.5 text-[9px] font-medium text-slate-600"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Development Roadmap */}
      <Section
        tag="Implementation Phases"
        title="Development Roadmap & Milestones"
        icon={<Compass className="size-4 text-blue-600" />}
        delay={120}
      >
        <ol className="relative space-y-4">
          <span className="absolute left-[13px] top-3 bottom-3 w-0.5 bg-slate-200" />
          {roadmap.map((r, i) => (
            <li key={r.phase + i} className="relative pl-9">
              <span className="absolute left-0 top-0 grid size-7 place-items-center rounded-full bg-blue-600 font-mono text-[10px] font-bold text-white shadow-xs">
                {i + 1}
              </span>
              <div className="flex flex-wrap items-baseline gap-2">
                <p className="font-display text-sm sm:text-base font-bold text-slate-900">{r.title}</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {r.weeks}
                </span>
              </div>
              <ul className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
                {(r.tasks || []).map((t) => (
                  <li key={t} className="flex items-start gap-1.5 text-xs text-slate-600">
                    <span className="text-blue-500 font-bold mt-0.5">▸</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      {/* Challenges & Solutions */}
      <Section
        tag="Risk Mitigation"
        title="Potential Challenges & Actionable Fixes"
        icon={<AlertCircle className="size-4 text-amber-500" />}
        delay={150}
      >
        <div className="grid gap-3.5 md:grid-cols-2">
          {challenges.map((c) => (
            <div key={c.challenge} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-amber-500" />
                <span>{c.challenge}</span>
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{c.solution}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Plan updates changelog */}
      {safeChangeLog.length > 0 && (
        <Section tag="History" title="Plan Refinements" delay={60}>
          <ol className="space-y-2">
            {safeChangeLog.map((c, i) => (
              <li key={c + i} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-blue-700">
                  v{i + 1}
                </span>
                <span>{c}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Prototype Forge CTA Banner */}
      {onGeneratePrototype && (
        <div className="panel q-rise rounded-3xl border border-blue-200/80 bg-gradient-to-r from-blue-50/70 via-white to-indigo-50/70 p-6 sm:p-10 text-center space-y-4 shadow-lg shadow-blue-500/5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 border border-blue-200 px-3 py-1 font-mono text-[10px] font-bold text-blue-700 uppercase tracking-wider">
            <Sparkles className="size-3 text-blue-600" />
            Next Phase: Prototype, GitHub & StackBlitz Forge
          </span>
          <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Ready to select a visual theme and forge your workspace?
          </h3>
          <p className="mx-auto max-w-xl text-xs sm:text-sm text-slate-600 leading-relaxed">
            Yaduk AI will generate an interactive live UI mockup and multi-file starter repository with instant 1-click launch in <strong>StackBlitz WebContainer</strong> or direct push to <strong>GitHub</strong>.
          </p>

          <div className="flex flex-wrap justify-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
              <Palette className="size-3.5 text-blue-600" />
              <span>Multi-Theme UI Sandbox</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-800 shadow-2xs">
              <Zap className="size-3.5 text-amber-500" />
              <span>StackBlitz 1-Click Launch</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-800 shadow-2xs">
              <Github className="size-3.5 text-slate-900" />
              <span>Direct GitHub Push & CI/CD</span>
            </span>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={onGeneratePrototype}
              disabled={isGeneratingPrototype}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
            >
              <Palette className="size-4" />
              <span>{isGeneratingPrototype ? "Manifesting Prototype with Yaduk AI..." : "Select Theme & Build Prototype →"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
