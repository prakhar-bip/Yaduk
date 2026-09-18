import type { QuestScroll as Scroll } from "@/lib/types";
import { Sparkles, FileText, HelpCircle, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

export function QuestScrollPanel({
  scroll,
  busy,
  onSummon,
  onAsk,
}: {
  scroll: Scroll | null;
  busy: boolean;
  onSummon: () => void;
  onAsk: (question: string) => void;
}) {
  return (
    <section className="panel q-rise overflow-hidden border border-slate-200/80 bg-white/95 shadow-sm rounded-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="size-9 grid place-items-center rounded-xl bg-white/20 backdrop-blur-xs">
            <FileText className="size-5 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-100 block">Executive Summary</span>
            <h3 className="font-display text-lg sm:text-xl font-bold leading-tight">
              Capstone Project Snapshot
            </h3>
          </div>
        </div>
        <button
          type="button"
          onClick={onSummon}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-blue-700 shadow-sm transition-all hover:bg-blue-50 disabled:opacity-50 cursor-pointer"
        >
          <Sparkles className="size-3.5 text-blue-600" />
          <span>{busy ? "Synthesizing Summary…" : scroll ? "Regenerate Summary" : "Generate 1-Min Pitch"}</span>
        </button>
      </div>

      {!scroll && !busy && (
        <div className="p-6 text-center">
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Generate an executive one-minute pitch of your complete project plan: core elevator summary, recommended tooling, immediate next milestones, and highest-risk factors.
          </p>
        </div>
      )}

      {busy && (
        <div className="space-y-2.5 p-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="q-shine h-3.5 rounded-full bg-slate-100"
              style={{ width: `${85 - i * 15}%` }}
            />
          ))}
        </div>
      )}

      {scroll && !busy && (
        <div className="space-y-5 p-6">
          <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
            <p className="font-display text-base font-bold text-slate-900 leading-snug">{scroll.tldr}</p>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 mt-1.5">{scroll.pitch}</p>
          </div>

          {Array.isArray(scroll.loadout) && scroll.loadout.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Engineering Toolkit</span>
              <div className="flex flex-wrap gap-1.5">
                {scroll.loadout.map((t, idx) => (
                  <span
                    key={typeof t === "string" ? t : idx}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {typeof t === "string" ? t : String(t)}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {Array.isArray(scroll.keyMoves) && scroll.keyMoves.length > 0 && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">Architectural Decisions</span>
                <ul className="space-y-2">
                  {scroll.keyMoves.map((m, idx) => {
                    const moveText = typeof m === "string" ? m : m?.move || `Decision ${idx + 1}`;
                    const whyText = typeof m === "string" ? "" : m?.why || "";
                    return (
                      <li key={moveText + idx} className="text-xs">
                        <span className="font-bold text-slate-800">{moveText}</span>
                        {whyText ? <span className="text-slate-500"> — {whyText}</span> : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {Array.isArray(scroll.bossRisks) && scroll.bossRisks.length > 0 && (
              <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-2">Crucial Risks to Address</span>
                <ul className="space-y-1.5">
                  {scroll.bossRisks.map((r, idx) => (
                    <li key={typeof r === "string" ? r : idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                      <AlertTriangle className="size-3 text-amber-500 shrink-0 mt-0.5" />
                      <span>{typeof r === "string" ? r : String(r)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {Array.isArray(scroll.nextThreeMoves) && scroll.nextThreeMoves.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Your Next 3 Action Steps</span>
              <ol className="space-y-2">
                {scroll.nextThreeMoves.map((m, i) => (
                  <li key={typeof m === "string" ? m : i} className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 text-xs sm:text-sm">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-blue-600 font-mono text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-slate-800 font-medium">{typeof m === "string" ? m : String(m)}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="border-t border-slate-100 pt-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Need advice? Ask Yaduk:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Explain step 1 like I've never built this",
                "Which risk should I worry about most?",
                "What would an examiner grill me on during the presentation?",
              ].map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => onAsk(q)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 cursor-pointer shadow-2xs"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
