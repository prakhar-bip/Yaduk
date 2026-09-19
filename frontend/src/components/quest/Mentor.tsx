import Markdown from "react-markdown";
import { useEffect, useRef, useState } from "react";
import type { Blueprint, StudentProfile } from "@/lib/types";
import { YadukLogo } from "./YadukLogo";
import { Send, Sparkles, X, RotateCcw } from "lucide-react";
import { askMentorChat } from "@/lib/quest.functions";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const PROMPTS = [
  "Where should I start coding first?",
  "Explain the hardest part of this plan",
  "Why is this tech stack ideal for my background?",
  "What potential blockers should I prepare for?",
  "How should I explain this architecture in my viva?",
];

export function Mentor({
  profile,
  blueprint,
  askSeed,
  onAsked,
  compact = false,
  onClose,
}: {
  profile: StudentProfile;
  blueprint: Blueprint;
  askSeed?: { text: string; n: number } | null;
  onAsked?: () => void;
  compact?: boolean;
  onClose?: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const seenSeed = useRef<number>(-1);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  useEffect(() => {
    if (!busy) inputRef.current?.focus();
  }, [busy]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");
    setError(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setBusy(true);
    onAsked?.();

    try {
      const history = nextMessages.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const res = await askMentorChat({
        data: {
          message: trimmed,
          context: { profile, blueprint },
          history: history.slice(-8),
        },
      });

      const mentorMsg: ChatMessage = {
        id: `mentor-${Date.now()}`,
        role: "assistant",
        text: res.text,
      };
      setMessages((prev) => [...prev, mentorMsg]);
    } catch (err: any) {
      console.error("Mentor chat error:", err);
      setError("Mentor was momentarily busy. Click retry to try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleRetry = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      void send(lastUserMsg.text);
    }
  };

  useEffect(() => {
    if (!askSeed || askSeed.n === seenSeed.current) return;
    seenSeed.current = askSeed.n;
    void send(askSeed.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [askSeed]);

  return (
    <section
      className={`panel flex flex-col overflow-hidden border border-slate-200/80 bg-white shadow-xl shadow-blue-500/5 ${
        compact ? "h-[30rem]" : "h-[40rem] lg:h-[46rem]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/40 px-5 py-3.5">
        <YadukLogo size={32} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="font-display text-sm font-bold text-slate-900 leading-tight">Ask Yaduk</p>
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[11px] text-slate-500 truncate">Context-aware architecture guide & copilot</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close mentor chat"
            className="grid size-7 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 space-y-3.5 overflow-y-auto p-5">
        {messages.length === 0 && (
          <div className="space-y-3.5 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
              <Sparkles className="size-4 text-blue-600" />
              <span>Ask Yaduk Anything About Your Project</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              I have full knowledge of your skills, chosen tech stack, and blueprint. Ask me for coding assistance, debugging advice, or interview prep.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-all hover:border-blue-400 hover:bg-blue-50/80 hover:text-blue-700 cursor-pointer shadow-2xs"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`q-rise max-w-[88%] text-xs sm:text-sm leading-relaxed ${
                m.role === "user"
                  ? "whitespace-pre-wrap rounded-2xl rounded-tr-xs bg-blue-600 px-4 py-2.5 text-white shadow-sm"
                  : "mentor-md rounded-2xl rounded-tl-xs border border-slate-200/80 bg-slate-50/70 p-4 text-slate-800 shadow-2xs"
              }`}
            >
              {m.role === "user" ? m.text : <Markdown>{m.text}</Markdown>}
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <div className="size-2 rounded-full bg-blue-600 animate-bounce" />
            <div className="size-2 rounded-full bg-indigo-600 animate-bounce delay-100" />
            <div className="size-2 rounded-full bg-blue-400 animate-bounce delay-200" />
            <span>Yaduk is analyzing your blueprint…</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <span>{error}</span>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1 font-semibold text-amber-900 underline hover:no-underline cursor-pointer"
            >
              <RotateCcw className="size-3" />
              Retry
            </button>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-100 bg-slate-50/40 p-3.5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={2}
            placeholder="Ask a technical doubt, explain an architecture layer, or get guidance…"
            className="flex-1 resize-none rounded-xl border border-slate-200 bg-white p-2.5 text-xs sm:text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="grid size-9.5 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 disabled:opacity-40 cursor-pointer"
            aria-label="Send message"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </section>
  );
}
