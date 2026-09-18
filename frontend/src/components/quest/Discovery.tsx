import { useState } from "react";
import type { StudentProfile } from "@/lib/types";
import { Sparkles, ArrowRight, ArrowLeft, Check } from "lucide-react";

const SKILLS = [
  "Web development",
  "Mobile apps",
  "Data analysis",
  "Machine learning",
  "Computer vision",
  "NLP",
  "Cloud / DevOps",
  "Databases",
  "Embedded / IoT",
  "Cybersecurity",
  "Game development",
  "UI/UX design",
];
const LANGS = ["Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "Kotlin", "Swift", "R", "SQL"];
const FRAMEWORKS = [
  "React",
  "Next.js",
  "Node.js",
  "Django",
  "Flask",
  "FastAPI",
  "Spring",
  "Flutter",
  "TensorFlow",
  "PyTorch",
  "Docker",
  "PostgreSQL",
  "MongoDB",
  "Firebase",
];
const INTERESTS = [
  "Healthcare",
  "Education",
  "Finance",
  "Sustainability",
  "Agriculture",
  "Accessibility",
  "Social good",
  "Sports",
  "Music & media",
  "Robotics",
  "Smart cities",
  "E-commerce",
];
const DOMAINS = ["AI / ML", "Full-stack web", "Mobile", "Data engineering", "IoT & hardware", "Security", "AR / VR", "Automation"];
const RESOURCES = ["Laptop only", "GPU access", "Cloud credits", "Sensors / hardware", "Real dataset", "University lab", "Mentor / supervisor"];

const STEPS = [
  { title: "Who you are", desc: "Your background and current experience" },
  { title: "What you can build", desc: "Your technical arsenal and skills" },
  { title: "What excites you", desc: "Domains and project themes you care about" },
  { title: "Where you're headed", desc: "Career goals and project format" },
  { title: "Your constraints", desc: "Time budget, team size and available resources" },
];

function Chips({
  options,
  value,
  onChange,
  tone = "primary",
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  tone?: "primary" | "accent" | "grape";
}) {
  const activeClass =
    tone === "grape"
      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20"
      : "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20";

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const on = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(on ? value.filter((v) => v !== opt) : [...value, opt])}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
              on
                ? activeClass
                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
            }`}
          >
            {on && <Check className="size-3 stroke-[3]" />}
            <span>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">{label}</label>
        {hint && <span className="text-xs text-slate-400 font-normal">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20";

export function Discovery({
  busy,
  onComplete,
  initialName = "",
}: {
  busy: boolean;
  onComplete: (p: StudentProfile) => void;
  initialName?: string;
}) {
  const [step, setStep] = useState(0);
  const [p, setP] = useState<StudentProfile>({
    name: initialName || "",
    fieldOfStudy: "Computer Science",
    yearOfStudy: "Final year",
    skills: [],
    languages: [],
    frameworks: [],
    aiKnowledge: "Some coursework",
    previousProjects: "",
    experienceLevel: "Intermediate",
    interests: [],
    domains: [],
    careerGoal: "",
    projectType: "Product / application",
    hoursPerWeek: 12,
    weeks: 10,
    teamSize: "Solo",
    resources: ["Laptop only"],
    complexity: "Challenging but doable",
    ownIdeas: "",
  });

  const set = <K extends keyof StudentProfile>(k: K, v: StudentProfile[K]) =>
    setP((prev) => ({ ...prev, [k]: v }));

  const canContinue =
    step === 0
      ? p.name.trim().length > 0
      : step === 1
        ? p.skills.length > 0 || p.languages.length > 0
        : step === 2
          ? p.interests.length > 0
          : step === 3
            ? p.careerGoal.trim().length > 0
            : true;

  return (
    <section className="panel mx-auto max-w-3xl overflow-hidden border border-slate-200/80 bg-white/95 shadow-xl shadow-blue-500/5">
      {/* Header bar with progress */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/50 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-100 px-2 py-0.5 font-mono text-[11px] font-bold text-blue-700">
                Step {step + 1} of {STEPS.length}
              </span>
              <span className="text-xs font-semibold text-slate-400">· {Math.round(((step + 1) / STEPS.length) * 100)}% Completed</span>
            </div>
            <h2 className="mt-1.5 font-display text-2xl font-bold text-slate-900">{STEPS[step]?.title}</h2>
            <p className="text-xs text-slate-500">{STEPS[step]?.desc}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <span
                key={s.title}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-8 bg-blue-600 shadow-xs shadow-blue-500/40"
                    : i < step
                      ? "w-2.5 bg-blue-400"
                      : "w-2.5 bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div key={step} className="q-rise space-y-6 px-6 py-7 sm:px-8">
        {step === 0 && (
          <>
            <Field label="What should we call you?">
              <input
                className={inputCls}
                value={p.name}
                placeholder="e.g. Arjun Sharma"
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Field of study">
                <input
                  className={inputCls}
                  value={p.fieldOfStudy}
                  placeholder="Computer Science & Engineering"
                  onChange={(e) => set("fieldOfStudy", e.target.value)}
                />
              </Field>
              <Field label="Year of study">
                <select className={inputCls} value={p.yearOfStudy} onChange={(e) => set("yearOfStudy", e.target.value)}>
                  {["Third year", "Final year", "Masters", "Other"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Experience level">
              <Chips
                options={["Beginner", "Intermediate", "Advanced"]}
                value={[p.experienceLevel]}
                onChange={(v) => set("experienceLevel", v.filter((x) => x !== p.experienceLevel)[0] ?? p.experienceLevel)}
                tone="accent"
              />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field label="Technical skills" hint="pick everything you've actually used">
              <Chips options={SKILLS} value={p.skills} onChange={(v) => set("skills", v)} />
            </Field>
            <Field label="Programming languages">
              <Chips options={LANGS} value={p.languages} onChange={(v) => set("languages", v)} tone="grape" />
            </Field>
            <Field label="Frameworks & tools">
              <Chips options={FRAMEWORKS} value={p.frameworks} onChange={(v) => set("frameworks", v)} tone="accent" />
            </Field>
            <Field label="AI / ML knowledge">
              <Chips
                options={["None yet", "Some coursework", "Built a few models", "Comfortable end-to-end"]}
                value={[p.aiKnowledge]}
                onChange={(v) => set("aiKnowledge", v.filter((x) => x !== p.aiKnowledge)[0] ?? p.aiKnowledge)}
              />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Areas of interest">
              <Chips options={INTERESTS} value={p.interests} onChange={(v) => set("interests", v)} tone="accent" />
            </Field>
            <Field label="Preferred project domains">
              <Chips options={DOMAINS} value={p.domains} onChange={(v) => set("domains", v)} tone="grape" />
            </Field>
            <Field
              label="Your own project ideas"
              hint="optional — write any idea you already have in mind"
            >
              <textarea
                className={`${inputCls} min-h-24 resize-none`}
                value={p.ownIdeas}
                placeholder="e.g. an app that helps my college manage lab equipment bookings…"
                onChange={(e) => set("ownIdeas", e.target.value)}
              />
            </Field>
            <Field label="Previous projects" hint="optional — anything you've built before">
              <textarea
                className={`${inputCls} min-h-24 resize-none`}
                value={p.previousProjects}
                placeholder="e.g. a course scheduling web app, a CNN for leaf disease detection…"
                onChange={(e) => set("previousProjects", e.target.value)}
              />
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <Field label="Career goal" hint="what job or path is this project feeding?">
              <input
                className={inputCls}
                value={p.careerGoal}
                placeholder="e.g. Machine learning engineer at a health-tech company"
                onChange={(e) => set("careerGoal", e.target.value)}
              />
            </Field>
            <Field label="Project preference">
              <Chips
                options={["Product / application", "Research-flavoured", "Data-heavy", "Hardware / IoT", "Open-source tool"]}
                value={[p.projectType]}
                onChange={(v) => set("projectType", v.filter((x) => x !== p.projectType)[0] ?? p.projectType)}
              />
            </Field>
            <Field label="Preferred complexity">
              <Chips
                options={["Keep it safe", "Challenging but doable", "Push me hard"]}
                value={[p.complexity]}
                onChange={(v) => set("complexity", v.filter((x) => x !== p.complexity)[0] ?? p.complexity)}
                tone="accent"
              />
            </Field>
          </>
        )}

        {step === 4 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label={`Hours per week — ${p.hoursPerWeek} hrs`}>
                <div className="space-y-1">
                  <input
                    type="range"
                    min={2}
                    max={40}
                    value={p.hoursPerWeek}
                    onChange={(e) => set("hoursPerWeek", Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>2 hrs (light)</span>
                    <span>20 hrs (standard)</span>
                    <span>40 hrs (full time)</span>
                  </div>
                </div>
              </Field>
              <Field label={`Weeks available — ${p.weeks} wks`}>
                <div className="space-y-1">
                  <input
                    type="range"
                    min={4}
                    max={32}
                    value={p.weeks}
                    onChange={(e) => set("weeks", Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>4 wks (sprint)</span>
                    <span>16 wks (semester)</span>
                    <span>32 wks (year)</span>
                  </div>
                </div>
              </Field>
            </div>
            <Field label="Team size">
              <Chips
                options={["Solo", "Pair", "Team of 3-4", "Team of 5+"]}
                value={[p.teamSize]}
                onChange={(v) => set("teamSize", v.filter((x) => x !== p.teamSize)[0] ?? p.teamSize)}
                tone="grape"
              />
            </Field>
            <Field label="Resources you can use">
              <Chips options={RESOURCES} value={p.resources} onChange={(v) => set("resources", v)} />
            </Field>
          </>
        )}
      </div>

      {/* Footer navigation */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:px-8">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || busy}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-35 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back</span>
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canContinue}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-md disabled:opacity-50 cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="size-3.5" />
          </button>
        ) : (
          <button
            onClick={() => onComplete(p)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-sm shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-md disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="size-4" />
            <span>{busy ? "Creating your profile…" : "Create My Profile"}</span>
          </button>
        )}
      </div>
    </section>
  );
}
