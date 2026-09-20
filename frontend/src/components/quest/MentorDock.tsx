import type { Blueprint, StudentProfile } from "@/lib/types";
import { Mentor } from "./Mentor";
import { YadukLogo } from "./YadukLogo";
import { MessageSquare, X } from "lucide-react";

export function MentorDock({
  profile,
  blueprint,
  askSeed,
  onAsked,
  open,
  onToggle,
}: {
  profile: StudentProfile;
  blueprint: Blueprint;
  askSeed?: { text: string; n: number } | null;
  onAsked?: () => void;
  open: boolean;
  onToggle: (open: boolean) => void;
}) {
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 pointer-events-none">
      <div
        className={`w-[min(94vw,32rem)] sm:w-[28rem] md:w-[32rem] origin-bottom-right transition-all duration-300 ease-out ${
          open
            ? "pointer-events-auto scale-100 opacity-100 visible"
            : "pointer-events-none translate-y-3 scale-95 opacity-0 invisible h-0 overflow-hidden"
        }`}
      >
        <div className="overflow-hidden rounded-2xl shadow-2xl shadow-blue-500/20 border border-slate-200">
          <Mentor
            profile={profile}
            blueprint={blueprint}
            askSeed={open ? (askSeed ?? null) : null}
            onAsked={onAsked ?? (() => {})}
            compact
            onClose={() => onToggle(false)}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onToggle(!open)}
        aria-expanded={open}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/35 hover:-translate-y-0.5 cursor-pointer [&_svg]:pointer-events-none [&_span]:pointer-events-none"
      >
        <YadukLogo size={20} />
        <span>{open ? "Minimize Mentor" : "Ask AI Mentor"}</span>
      </button>
    </div>
  );
}
