import { useState, useRef } from "react";
import { toast } from "sonner";
import { Sparkles, RefreshCw, X, Lightbulb } from "lucide-react";

const SUGGESTIONS = [
  "Swap to PostgreSQL & Prisma",
  "Add JWT Auth & RBAC",
  "Add Redis Caching",
  "Trim to 4-Week MVP",
  "Break Down ML Inference Layer",
];

export function PlanChangeBar({
  busy,
  onSubmit,
}: {
  busy: boolean;
  onSubmit: (request: string) => void;
}) {
  const [text, setText] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectSuggestion = (suggestion: string) => {
    if (busy) return;
    setText(suggestion);
    setShake(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!text.trim()) {
      setShake(true);
      inputRef.current?.focus();
      setTimeout(() => setShake(false), 700);
      toast.info("Please describe what to change, or click a quick suggestion chip below!");
      return;
    }
    onSubmit(text.trim());
    setText("");
    setShake(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="panel q-rise border border-slate-200/80 bg-white/95 p-4 sm:p-5 shadow-sm rounded-2xl space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
          Dynamically Refine Architectural Blueprint
        </label>
        <span className="text-[11px] text-slate-400 hidden sm:inline-flex items-center gap-1">
          <Lightbulb className="size-3 text-amber-500" />
          Click a suggestion below or type your custom requirement
        </span>
      </div>

      {/* Quick Suggestion Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-1">Quick ideas:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={busy}
            onClick={() => handleSelectSuggestion(s)}
            className="rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 cursor-pointer shadow-2xs [&_span]:pointer-events-none"
          >
            <span>+ {s}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <div className="relative min-w-[14rem] flex-1">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (shake) setShake(false);
            }}
            disabled={busy}
            placeholder="e.g. Swap PostgreSQL for MongoDB, add OAuth2, or break down the ML inference layer..."
            className={`w-full rounded-xl border bg-slate-50/70 px-3.5 py-2.5 pr-8 text-xs sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 ${
              shake
                ? "border-amber-500 ring-2 ring-amber-400/30 animate-shake bg-amber-50/20"
                : "border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            }`}
          />
          {text.trim().length > 0 && !busy && (
            <button
              type="button"
              onClick={() => setText("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
              aria-label="Clear input"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_span]:pointer-events-none active:scale-98"
          >
            {busy ? (
              <>
                <RefreshCw className="size-3.5 animate-spin" />
                <span>Updating Blueprint…</span>
              </>
            ) : (
              <>
                <Sparkles className="size-3.5" />
                <span>Apply Blueprint Change</span>
              </>
            )}
          </button>
        </div>
      </div>

      {shake && (
        <p className="text-[11px] font-medium text-amber-600 animate-pulse">
          ⚠️ Please type your modification or click one of the quick suggestions above.
        </p>
      )}
    </form>
  );
}
