import type { Stage } from "@/lib/types";
import { YadukLogo } from "./YadukLogo";
import { useAuth } from "@/lib/auth-context";
import { LogOut } from "lucide-react";

const STAGES: { key: Stage; label: string }[] = [
  { key: "discovery", label: "Discovery" },
  { key: "profile", label: "Profile" },
  { key: "ideas", label: "Project Ideas" },
  { key: "feasibility", label: "Reality Check" },
  { key: "blueprint", label: "System Blueprint" },
  { key: "theme", label: "Theme" },
  { key: "prototype", label: "Prototype" },
];

export function QuestHud({
  stage,
  onReset,
  onSelectStage,
}: {
  stage: Stage;
  badges?: string[];
  onReset?: () => void;
  onSelectStage?: (stage: Stage) => void;
}) {
  const activeIndex = STAGES.findIndex((s) => s.key === stage);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (onReset) {
      onReset();
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <YadukLogo size={36} />
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-lg font-bold text-slate-900">Yaduk</span>
              <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[9px] font-semibold text-sky-700 border border-sky-200 uppercase tracking-wider">
                AI PLATFORM
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">Project Architect & Planner</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* User Profile Pill */}
          {user && (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs shadow-2xs">
              <span className="grid size-5 place-items-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-[10px] font-bold text-white shadow-xs">
                {user.fullName ? user.fullName[0].toUpperCase() : user.email[0].toUpperCase()}
              </span>
              <span className="max-w-[120px] truncate font-semibold text-slate-800 sm:max-w-[160px]">
                {user.fullName || user.email.split("@")[0]}
              </span>
              <span className="text-[10px] font-medium text-slate-400 hidden sm:inline">
                · {user.isGuest ? "Guest" : "Student"}
              </span>
            </div>
          )}

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/80 px-3 py-1.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-600 hover:text-white cursor-pointer shadow-2xs"
            title="Log Out"
          >
            <LogOut className="size-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Stage Pills Row */}
      <div className="mx-auto max-w-6xl overflow-x-auto px-5 pb-2.5 pt-1">
        <ol className="flex min-w-max items-center gap-1">
          {STAGES.map((s, i) => {
            const done = activeIndex > i;
            const active = activeIndex === i;
            const isClickable = Boolean(onSelectStage);
            const pillClasses = `flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 ${
              active
                ? "border-blue-600 bg-blue-600 text-white shadow-xs shadow-blue-500/30"
                : done
                  ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  : "border-slate-200 bg-white/70 text-slate-500 hover:text-slate-800 hover:bg-white"
            } ${isClickable ? "cursor-pointer" : ""}`;

            const content = (
              <>
                <span
                  className={`grid size-4 place-items-center rounded-full font-mono text-[9px] font-bold ${
                    active
                      ? "bg-white/20 text-white"
                      : done
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span>{s.label}</span>
              </>
            );

            return (
              <li key={s.key} className="flex items-center gap-1">
                {isClickable ? (
                  <button
                    type="button"
                    onClick={() => onSelectStage?.(s.key)}
                    className={pillClasses}
                  >
                    {content}
                  </button>
                ) : (
                  <span className={pillClasses}>{content}</span>
                )}
                {i < STAGES.length - 1 && (
                  <svg viewBox="0 0 24 6" className="h-1.5 w-5 text-slate-300">
                    <line
                      x1="0"
                      y1="3"
                      x2="24"
                      y2="3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </header>
  );
}
