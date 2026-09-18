import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, RefreshCw } from "lucide-react";

export function PlanChangeBar({
  busy,
  onSubmit,
}: {
  busy: boolean;
  onSubmit: (request: string) => void;
}) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!text.trim()) {
      toast.info("Please describe what you would like to change in your plan (e.g. 'Swap Streamlit for React', 'Add real-time alerts', or 'Cut one feature').");
      return;
    }
    onSubmit(text.trim());
    setText("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="panel q-rise flex flex-wrap items-center gap-3 border border-slate-200/80 bg-white/95 p-4 sm:p-5 shadow-sm rounded-2xl"
    >
      <div className="min-w-[12rem] flex-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
          Dynamically Refine Architectural Blueprint
        </label>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={busy}
          placeholder="e.g. Swap PostgreSQL for MongoDB, add OAuth2, or break down the ML inference layer..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400"
        />
      </div>
      <div className="pt-4 sm:pt-0">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-40 cursor-pointer"
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
    </form>
  );
}
