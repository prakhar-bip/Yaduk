import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BlueprintView } from "@/components/quest/BlueprintView";
import { Discovery } from "@/components/quest/Discovery";
import { FeasibilityPanel } from "@/components/quest/FeasibilityPanel";
import { IdeaDeck } from "@/components/quest/IdeaDeck";
import { Mascot, SparkLine } from "@/components/quest/Mascot";
import { YadukLogo } from "@/components/quest/YadukLogo";
import { Mentor } from "@/components/quest/Mentor";
import { MentorDock } from "@/components/quest/MentorDock";
import { PlanChangeBar } from "@/components/quest/PlanChangeBar";
import { ProfileCard } from "@/components/quest/ProfileCard";
import { ThemeSelection } from "@/components/quest/ThemeSelection";
import { BackendContractView } from "@/components/quest/BackendContractView";
import { ProjectSetupInspector } from "@/components/quest/ProjectSetupInspector";
import { CodebaseExplorerView } from "@/components/quest/CodebaseExplorerView";
import { QuestHud } from "@/components/quest/QuestHud";
import { QuestScrollPanel } from "@/components/quest/QuestScroll";
import { useJourney } from "@/lib/journey";
import { useAuth, AUTH_TOKEN_KEY } from "@/lib/auth-context";
import { AuthModal } from "@/components/auth/AuthModal";
import { AuthCard } from "@/components/auth/AuthCard";
import { LogOut, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import {
  analyzeFeasibility,
  applyBlueprintChangeFallback,
  buildProfile,
  generateBackendContract,
  generateBackendContractFallback,
  generateBlueprint,
  generateBlueprintScrollFallback,
  generateIdeas,
  generateProjectSetup,
  generateProjectSetupFallback,
  generateBackendEngine,
  generateBackendEngineFallback,
  generateFrontendEngine,
  generateFrontendEngineFallback,
  refineIdeas,
  summarizeBlueprint,
  updateBlueprint,
} from "@/lib/quest.functions";
import type {
  BackendContractDoc,
  Blueprint,
  GeneratedCodeFile,
  ProjectCodebase,
  ProjectIdea,
  ProjectSetupSpec,
  QuestScroll,
  StudentProfile,
  Stage,
} from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Yaduk — AI Final-Year Project Planner & Architect" },
      {
        name: "description",
        content:
          "Yaduk: Turn your skills, interests and goals into a matched final-year project idea, a feasibility check and a full build blueprint — guided by an AI project architect.",
      },
      { property: "og:title", content: "Yaduk — AI Final-Year Project Planner & Architect" },
      {
        property: "og:description",
        content:
          "Discover, score, refine and plan your final-year project with Yaduk — your AI architect and mentor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Loader({ label }: { label: string }) {
  return (
    <div className="panel q-pop mx-auto max-w-md flex flex-col items-center gap-5 p-10 text-center shadow-xl">
      <YadukLogo size={64} className="animate-pulse" />
      <div>
        <p className="font-display text-xl font-bold text-slate-800">{label}</p>
        <p className="text-xs text-slate-500 mt-1">Yaduk AI is analyzing constraints & generating plans</p>
      </div>
      <div className="h-2.5 w-64 overflow-hidden rounded-full border border-blue-100 bg-blue-50/60">
        <div className="q-shine h-full w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600" />
      </div>
    </div>
  );
}

function LandingNavbar({
  onOpenAuth,
  onLogout,
}: {
  onOpenAuth: (tab: "login" | "register") => void;
  onLogout?: () => void;
}) {
  const { user, isAuthenticated, logout } = useAuth();

  const handleNavbarLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
    }
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <YadukLogo variant="full" size={38} />

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-xs">
                <span className="grid size-6 place-items-center rounded-full bg-blue-600 font-bold text-white text-xs shadow-xs">
                  {user.fullName ? user.fullName[0]?.toUpperCase() : (user.email?.[0] || "U").toUpperCase()}
                </span>
                <span className="font-semibold text-slate-800 max-w-[120px] truncate sm:max-w-none">
                  {user.fullName || user.email.split("@")[0]}
                </span>
                <span className="text-[10px] font-medium text-slate-500 hidden md:inline">
                  {user.isGuest ? "· Guest" : "· Student"}
                </span>
              </div>
              <button
                onClick={handleNavbarLogout}
                className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50/80 px-3.5 py-1.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-600 hover:text-white cursor-pointer"
                title="Log Out of Yaduk"
              >
                <LogOut className="size-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onOpenAuth("login")}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 shadow-xs cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth("register")}
                className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 cursor-pointer"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function Intro({
  onStart,
  onOpenAuth,
  onAuthSuccess,
}: {
  onStart: () => void;
  onOpenAuth: (tab: "login" | "register") => void;
  onAuthSuccess?: () => void;
}) {
  const { user, isAuthenticated } = useAuth();

  return (
    <section className="mx-auto max-w-6xl px-2 py-8 sm:py-12">
      {/* Top Banner on Landing Page */}
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        {/* Left Hero Column */}
        <div className="text-left">
          <div className="mb-4 flex items-center gap-3">
            <div className="q-pop w-fit">
              <YadukLogo size={52} />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-3 py-1 text-xs font-medium text-blue-700">
                <Sparkles className="size-3 text-blue-600" />
                AI project architect & mentor
              </span>
              {isAuthenticated && user && (
                <p className="mt-1.5 text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  Signed in as {user.fullName || user.email}
                </p>
              )}
            </div>
          </div>

          <h1 className="q-rise font-display text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl text-slate-900">
            Stop guessing your
            <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-teal-600 bg-clip-text text-transparent"> final-year project.</span>
          </h1>

          <p
            className="q-rise mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-slate-600"
            style={{ animationDelay: "120ms" }}
          >
            Answer a few short questions. Get tailored project ideas scored around your skills, time and career
            ambitions — backed by an honest reality check, complete system blueprint, and an AI mentor who adapts the
            plan as you collaborate.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3.5">
            <button
              onClick={onStart}
              className="q-pop inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-teal-600 px-5 py-2.5 font-display text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:opacity-95 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 cursor-pointer"
              style={{ animationDelay: "220ms" }}
            >
              <span>{isAuthenticated ? "Launch Project Discovery" : "Get Started Free"}</span>
              <ArrowRight className="size-4" />
            </button>
            {!isAuthenticated && (
              <button
                onClick={() => onOpenAuth("login")}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 shadow-xs cursor-pointer"
              >
                Already have an account? Sign In
              </button>
            )}
          </div>
        </div>

        {/* Right Auth Column */}
        <div className="w-full">
          <AuthCard onStartJourney={onStart} {...(onAuthSuccess ? { onAuthSuccess } : {})} />
        </div>
      </div>

      {/* 3 Step Features */}
      <div className="mt-16 grid gap-5 text-left sm:grid-cols-3">
        {[
          [
            "01 · Authenticate & Discover",
            "Sign into your student account and answer a few intuitive questions to capture your skills, stack, and constraints.",
          ],
          [
            "02 · Scored Project Ideas",
            "Receive tailored final-year capstone ideas ranked with multi-dimensional match scores and difficulty estimates.",
          ],
          [
            "03 · Build Plan & AI Mentor",
            "Unlock an honest reality check, complete system architecture blueprint, and an interactive AI project mentor.",
          ],
        ].map(([tag, text], i) => (
          <div
            key={tag}
            className="panel q-rise p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            style={{ animationDelay: `${300 + i * 90}ms` }}
          >
            <span className="mono-label font-bold text-blue-600">{tag}</span>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Home() {
  const { state, update, award, reset, hydrated } = useJourney();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [scrollBusy, setScrollBusy] = useState(false);
  const [askSeed, setAskSeed] = useState<{ text: string; n: number } | null>(null);
  const [dockOpen, setDockOpen] = useState(false);

  // Ensure auth modal is immediately dismissed whenever user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setAuthModalOpen(false);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    reset();
    update({ stage: "intro" });
    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(new Event("yaduk:session_cleared"));
        window.dispatchEvent(new Event("sarthi:session_cleared"));
      } catch {
        /* ignore */
      }
    }
  };

  // Listen for session cleared event to immediately bring the view back to intro landing
  useEffect(() => {
    const handleSessionCleared = () => {
      reset();
      update({ stage: "intro" });
    };
    window.addEventListener("yaduk:session_cleared", handleSessionCleared);
    window.addEventListener("sarthi:session_cleared", handleSessionCleared);
    return () => {
      window.removeEventListener("yaduk:session_cleared", handleSessionCleared);
      window.removeEventListener("sarthi:session_cleared", handleSessionCleared);
    };
  }, [reset, update]);

  const openAuth = (tab: "login" | "register") => {
    if (isAuthenticated) return;
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    update({ stage: "discovery" });
  };

  const handleStartJourney = (forceAuthenticated = false) => {
    const hasLocalToken =
      typeof window !== "undefined"
        ? Boolean(
            localStorage.getItem(AUTH_TOKEN_KEY) ||
            localStorage.getItem("yaduk_auth_token_v1") ||
            localStorage.getItem("sarthi_auth_token_v1") ||
            localStorage.getItem("sarthi_auth_token")
          )
        : false;
    const isAuthed = forceAuthenticated || isAuthenticated || Boolean(user) || hasLocalToken;

    if (!isAuthed) {
      openAuth("login");
      toast.info("Please sign in or create an account to access the project discovery quest.");
    } else {
      setAuthModalOpen(false);
      update({ stage: "discovery" });
    }
  };

  const doBuildProfile = useServerFn(buildProfile);
  const doGenerateIdeas = useServerFn(generateIdeas);
  const doRefineIdeas = useServerFn(refineIdeas);
  const doFeasibility = useServerFn(analyzeFeasibility);
  const doBlueprint = useServerFn(generateBlueprint);
  const doUpdateBlueprint = useServerFn(updateBlueprint);
  const doSummarize = useServerFn(summarizeBlueprint);
  const doGenerateBackendContract = useServerFn(generateBackendContract);
  const doGenerateProjectSetup = useServerFn(generateProjectSetup);
  const doGenerateBackendEngine = useServerFn(generateBackendEngine);
  const doGenerateFrontendEngine = useServerFn(generateFrontendEngine);

  const selected = state.ideas.find((i) => i.id === state.selectedIdeaId) ?? null;

  const fail = (e: unknown) => {
    const msg = e instanceof Error ? e.message : "Something went wrong.";
    toast.error(msg.includes("402") ? "The AI workspace is out of credits." : msg);
  };

  async function handleDiscovery(raw: StudentProfile) {
    setBusy("Building your profile…");
    try {
      const profile = await doBuildProfile({ data: { raw } });
      update({ profile, stage: "profile" });
      award(200, "explorer");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(null);
    }
  }

  async function handleGenerateIdeas(profile: StudentProfile) {
    setBusy("Finding project ideas for you…");
    try {
      const ideas = await doGenerateIdeas({
        data: { profile, feedback: state.feedbackLog, exclude: state.ideas.map((i) => i.name) },
      });
      update({ ideas, stage: "ideas", selectedIdeaId: null });
      award(150, "strategist");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(null);
    }
  }

  const effectiveProfile: StudentProfile = {
    name: state.profile?.name || user?.fullName || "Student Developer",
    fieldOfStudy: state.profile?.fieldOfStudy || "Computer Science & Engineering",
    yearOfStudy: state.profile?.yearOfStudy || "Final Year",
    experienceLevel: (state.profile as any)?.experienceLevel || "Intermediate",
    skills:
      state.profile?.skills && state.profile.skills.length > 0
        ? state.profile.skills
        : ["Full Stack", "TypeScript", "Python"],
    languages:
      (state.profile as any)?.languages && (state.profile as any).languages.length > 0
        ? (state.profile as any).languages
        : ["TypeScript", "Python", "JavaScript", "SQL"],
    frameworks:
      (state.profile as any)?.frameworks && (state.profile as any).frameworks.length > 0
        ? (state.profile as any).frameworks
        : ["React", "FastAPI", "Tailwind CSS"],
    aiKnowledge: (state.profile as any)?.aiKnowledge || "Proficient",
    previousProjects: (state.profile as any)?.previousProjects || "Full-stack software application",
    interests:
      state.profile?.interests && state.profile.interests.length > 0
        ? state.profile.interests
        : ["Software Architecture", "AI Systems"],
    domains:
      (state.profile as any)?.domains && (state.profile as any).domains.length > 0
        ? (state.profile as any).domains
        : ["Full-stack web", "AI / ML"],
    careerGoal:
      (state.profile as any)?.careerGoal ||
      (state.profile as any)?.ambition ||
      "Full-Stack Software Engineer",
    projectType: (state.profile as any)?.projectType || "Product / application",
    hoursPerWeek:
      (state.profile as any)?.hoursPerWeek || (state.profile as any)?.weeklyHours || 15,
    weeks: (state.profile as any)?.weeks || 12,
    teamSize: (state.profile as any)?.teamSize || "Solo",
    resources:
      (state.profile as any)?.resources && (state.profile as any).resources.length > 0
        ? (state.profile as any).resources
        : ["Laptop only", "Cloud hosting"],
    complexity: (state.profile as any)?.complexity || "Challenging but doable",
    ownIdeas: (state.profile as any)?.ownIdeas || "",
    summary: state.profile?.summary || "",
    strengths: state.profile?.strengths || [],
    watchOuts: state.profile?.watchOuts || [],
  };

  async function handleFeedback(idea: ProjectIdea, action: string) {
    const prof = state.profile || effectiveProfile;
    setBusy("Updating ideas from your feedback…");
    try {
      const feedback = [...state.feedbackLog, `${action} (re: ${idea.name})`];
      const ideas = await doRefineIdeas({
        data: { profile: prof, idea, action, feedback: state.feedbackLog },
      });
      update({ ideas, feedbackLog: feedback, selectedIdeaId: null, profile: prof });
      award(60, "tinkerer");
      toast.success("New ideas based on your feedback.");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(null);
    }
  }

  async function handleSelect(idea: ProjectIdea) {
    const prof = state.profile || effectiveProfile;
    setBusy("Running the reality check…");
    update({ selectedIdeaId: idea.id });
    try {
      const feasibility = await doFeasibility({ data: { profile: prof, idea } });
      update({ feasibility, stage: "feasibility", selectedIdeaId: idea.id, profile: prof });
      award(150, "realist");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(null);
    }
  }

  async function handleDirection(direction: string, label: string) {
    if (!selected) return;
    const prof = state.profile || effectiveProfile;
    setBusy("Writing your full project plan…");
    try {
      const blueprint = await doBlueprint({
        data: {
          profile: prof,
          idea: selected,
          feasibility: state.feasibility,
          feedback: state.feedbackLog,
          direction,
        },
      });
      update({
        blueprint,
        profile: prof,
        stage: "blueprint",
        feedbackLog: [...state.feedbackLog, `chose the ${label} direction`],
      });
      award(300, "architect");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(null);
    }
  }

  async function handleSummon() {
    if (!state.blueprint) return;
    const prof = effectiveProfile;
    setScrollBusy(true);
    try {
      let scroll: QuestScroll | null = null;
      try {
        const res = await fetch("/api/blueprint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "summarize",
            profile: prof,
            blueprint: state.blueprint,
          }),
          signal: AbortSignal.timeout(15000),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.scroll?.tldr) {
            scroll = data.scroll;
          }
        }
      } catch (apiErr) {
        console.warn("API summarize request encountered error, falling back to local generator:", apiErr);
      }

      if (!scroll) {
        scroll = generateBlueprintScrollFallback(state.blueprint);
      }

      update({ scroll, profile: prof });
      award(80, "loremaster");
      toast.success("Summary ready! Here is your quick plan overview.");
    } catch (e) {
      console.error("handleSummon error:", e);
      const scroll = generateBlueprintScrollFallback(state.blueprint);
      update({ scroll, profile: prof });
      toast.success("Summary ready! Here is your quick plan overview.");
    } finally {
      setScrollBusy(false);
    }
  }

  function ask(text: string) {
    setDockOpen(true);
    setAskSeed({ text, n: Date.now() });
  }

  async function handleApply(request: string) {
    if (!state.blueprint || applying) return;
    const prof = effectiveProfile;
    setApplying(true);
    try {
      let updatedBp: Blueprint | null = null;
      let changeSummary: string = "";

      try {
        const res = await fetch("/api/blueprint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update",
            profile: prof,
            blueprint: state.blueprint,
            request,
          }),
          signal: AbortSignal.timeout(20000),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.blueprint?.title && data?.changeSummary) {
            updatedBp = data.blueprint;
            changeSummary = data.changeSummary;
          }
        }
      } catch (apiErr) {
        console.warn("API update blueprint request encountered error, falling back to local modifier:", apiErr);
      }

      if (!updatedBp || !changeSummary) {
        const fallback = applyBlueprintChangeFallback(state.blueprint, request);
        updatedBp = fallback.blueprint;
        changeSummary = fallback.changeSummary;
      }

      update({
        blueprint: updatedBp,
        profile: prof,
        scroll: null,
        changeLog: [...state.changeLog, changeSummary],
      });
      award(120, "shipwright");
      toast.success(changeSummary);
    } catch (e) {
      console.error("handleApply error:", e);
      const fallback = applyBlueprintChangeFallback(state.blueprint, request);
      update({
        blueprint: fallback.blueprint,
        profile: prof,
        scroll: null,
        changeLog: [...state.changeLog, fallback.changeSummary],
      });
      toast.success(fallback.changeSummary);
    } finally {
      setApplying(false);
    }
  }

  async function handleGenerateBackendContract(selectedTheme?: string) {
    if (!state.blueprint) {
      toast.error("Please create a blueprint first before generating backend specifications.");
      return;
    }
    const theme = selectedTheme || state.selectedTheme || "neo-brutalism";
    
    // 1. Immediately provision baseline contract and transition stage so user instantly sees the page
    const immediateContract =
      state.backendContract ||
      generateBackendContractFallback(state.blueprint, effectiveProfile);

    update({
      backendContract: immediateContract,
      profile: effectiveProfile,
      selectedTheme: theme,
      stage: "contract",
    });
    award(150, "engineer");
    toast.success("Backend Architecture & System Contract ready!");

    // 2. Asynchronously enrich with deep AI synthesis in background if needed
    try {
      const enriched = await doGenerateBackendContract({
        data: { profile: effectiveProfile, blueprint: state.blueprint, theme },
      });
      if (enriched?.apiRoutes && enriched.apiRoutes.length > 0) {
        update({
          backendContract: enriched,
          profile: effectiveProfile,
          selectedTheme: theme,
        });
      }
    } catch (err) {
      console.warn("Backend contract AI enrichment completed with baseline contract:", err);
    }
  }

  async function handleProceedToSetup() {
    if (!state.blueprint) {
      toast.error("Please create a blueprint first before configuring setup.");
      return;
    }

    const baselineSetup =
      state.setupSpec ||
      generateProjectSetupFallback(state.blueprint, effectiveProfile, state.backendContract);

    update({
      setupSpec: baselineSetup,
      profile: effectiveProfile,
      stage: "setup",
    });
    award(100, "builder");
    toast.success("Project setup & dependency specification loaded!");

    try {
      const enriched = await doGenerateProjectSetup({
        data: {
          blueprint: state.blueprint,
          profile: effectiveProfile,
          contract: state.backendContract,
        },
      });
      if (enriched?.backendDependencies && enriched.backendDependencies.length > 0) {
        update({
          setupSpec: enriched,
          profile: effectiveProfile,
        });
      }
    } catch (err) {
      console.warn("Project setup AI enrichment completed with baseline:", err);
    }
  }

  async function handleLockSetupAndGenerate(approvedSetup: ProjectSetupSpec) {
    if (!state.blueprint) {
      toast.error("Missing project blueprint.");
      return;
    }

    const contract =
      state.backendContract ||
      generateBackendContractFallback(state.blueprint, effectiveProfile);
    const theme = state.selectedTheme || "modern-minimal";

    // 1. Immediate baseline codebase
    const baselineBackend = generateBackendEngineFallback(state.blueprint, contract, approvedSetup);
    const baselineFrontend = generateFrontendEngineFallback(state.blueprint, theme, contract, approvedSetup);
    const initialFiles = [...baselineBackend, ...baselineFrontend];

    const initialCodebase: ProjectCodebase = {
      setupSpec: approvedSetup,
      files: initialFiles,
      backendEngineCompleted: true,
      frontendEngineCompleted: true,
      activeFilePath: initialFiles[0]?.path || "backend/app/main.py",
    };

    update({
      setupSpec: approvedSetup,
      codebase: initialCodebase,
      stage: "codebase",
    });
    award(150, "coder");
    toast.success("Locked setup! Two-Engine Codebase initialized.");

    let workingFiles: GeneratedCodeFile[] = initialFiles;

    // 2. Run Engine 1: Backend & Database Synthesis
    try {
      setBusy("Engine 1: Synthesizing Backend & Database models...");
      const backendFiles = await doGenerateBackendEngine({
        data: {
          blueprint: state.blueprint,
          contract,
          setupSpec: approvedSetup,
        },
      });

      if (backendFiles && backendFiles.length > 0) {
        workingFiles = [
          ...backendFiles,
          ...workingFiles.filter((f) => f.layer === "frontend" || f.layer === "root"),
        ];
        update({
          codebase: {
            setupSpec: approvedSetup,
            files: workingFiles,
            backendEngineCompleted: true,
            frontendEngineCompleted: true,
            activeFilePath: backendFiles[0]?.path,
          },
        });
        toast.success("Engine 1 (Backend & DB) completed!");
      }
    } catch (err) {
      console.warn("Engine 1 AI generation error, keeping baseline backend:", err);
    } finally {
      setBusy(null);
    }

    // 3. Run Engine 2: Frontend & UI Shell Synthesis
    try {
      setBusy("Engine 2: Synthesizing Frontend views & theme components...");
      const frontendFiles = await doGenerateFrontendEngine({
        data: {
          blueprint: state.blueprint,
          selectedTheme: theme,
          contract,
          setupSpec: approvedSetup,
        },
      });

      if (frontendFiles && frontendFiles.length > 0) {
        const nonFrontendFiles = workingFiles.filter(
          (f) => f.layer === "backend" || f.layer === "database" || f.layer === "root"
        );
        workingFiles = [...nonFrontendFiles, ...frontendFiles];
        update({
          codebase: {
            setupSpec: approvedSetup,
            files: workingFiles,
            backendEngineCompleted: true,
            frontendEngineCompleted: true,
            activeFilePath: frontendFiles[0]?.path || nonFrontendFiles[0]?.path,
          },
        });
        toast.success("Engine 2 (Frontend & UI) completed! Full suite ready.");
      }
    } catch (err) {
      console.warn("Engine 2 AI generation error, keeping baseline frontend:", err);
    } finally {
      setBusy(null);
    }
  }

  const handleStageNavigation = (targetStage: any) => {
    setBusy(null);
    if (targetStage === state.stage) return;
    if (targetStage === "discovery") {
      update({ stage: "discovery" });
      return;
    }
    if (targetStage === "profile") {
      if (!state.profile) {
        toast.info("Please complete the project discovery questions first.");
        return;
      }
      update({ stage: "profile" });
      return;
    }
    if (targetStage === "ideas") {
      if (!state.ideas || state.ideas.length === 0) {
        toast.info("Please complete discovery to generate your tailored project ideas.");
        return;
      }
      update({ stage: "ideas" });
      return;
    }
    if (targetStage === "feasibility") {
      if (!state.feasibility) {
        toast.info("Please choose a project idea first to run the reality check.");
        return;
      }
      update({ stage: "feasibility" });
      return;
    }
    if (targetStage === "blueprint") {
      if (!state.blueprint) {
        toast.info("Please complete the reality check first to build your blueprint.");
        return;
      }
      setBusy(null);
      update({ stage: "blueprint" });
      return;
    }
    if (targetStage === "theme") {
      if (!state.blueprint) {
        toast.info("Please create your blueprint before choosing a theme.");
        return;
      }
      setBusy(null);
      update({ stage: "theme" });
      return;
    }
    if (targetStage === "contract") {
      if (!state.blueprint) {
        toast.info("Please create your blueprint first.");
        return;
      }
      if (!state.backendContract) {
        void handleGenerateBackendContract();
        return;
      }
      setBusy(null);
      update({ stage: "contract" });
      return;
    }
    if (targetStage === "setup") {
      if (!state.blueprint) {
        toast.info("Please create your blueprint first.");
        return;
      }
      if (!state.setupSpec) {
        void handleProceedToSetup();
        return;
      }
      setBusy(null);
      update({ stage: "setup" });
      return;
    }
    if (targetStage === "codebase") {
      if (!state.setupSpec) {
        toast.info("Please review and configure your project setup first.");
        return;
      }
      setBusy(null);
      update({ stage: "codebase" });
      return;
    }
    update({ stage: targetStage });
  };

  if (!hydrated) return null;

  // Render quest pipeline if authenticated OR if user is on a quest stage
  const showQuest = (isAuthenticated || state.stage !== "intro") && state.stage !== "intro";

  return (
    <div className="min-h-screen">
      {!showQuest && <LandingNavbar onOpenAuth={openAuth} onLogout={handleLogout} />}

      {showQuest && (
        <QuestHud
          stage={state.stage}
          badges={state.badges}
          onReset={handleLogout}
          onSelectStage={handleStageNavigation}
        />
      )}

      <main className="mx-auto max-w-6xl px-5 py-8">
        {!showQuest && (
          <Intro
            onStart={handleStartJourney}
            onOpenAuth={openAuth}
            onAuthSuccess={handleAuthSuccess}
          />
        )}

        {showQuest && busy && (
          <div className="py-6">
            <Loader label={busy} />
          </div>
        )}

        {showQuest && !busy && state.stage === "discovery" && (
          <Discovery
            busy={false}
            onComplete={handleDiscovery}
            initialName={user?.fullName || ""}
          />
        )}

        {showQuest && !busy && state.stage === "profile" && state.profile && (
          <ProfileCard
            p={state.profile}
            onConfirm={() => handleGenerateIdeas(state.profile!)}
            onEdit={() => update({ stage: "discovery" })}
          />
        )}

        {showQuest && !busy && state.stage === "ideas" && state.profile && (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <div className="hidden lg:block">
              <ProfileCard p={state.profile} compact />
            </div>
            <IdeaDeck
              ideas={state.ideas}
              selectedId={state.selectedIdeaId}
              busy={false}
              onSelect={handleSelect}
              onFeedback={handleFeedback}
              onReroll={() => handleGenerateIdeas(state.profile!)}
            />
          </div>
        )}

        {showQuest && !busy && state.stage === "feasibility" && selected && state.feasibility && (
          <FeasibilityPanel
            idea={selected}
            f={state.feasibility}
            busy={false}
            onChoose={handleDirection}
            onBack={() => update({ stage: "ideas" })}
          />
        )}

        {showQuest && !busy && state.stage === "blueprint" && state.blueprint && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-3xl font-extrabold">Your build plan</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBusy(null);
                  update({ stage: "feasibility" });
                }}
                className="mono-label rounded-full border-2 border-border px-4 py-2 cursor-pointer hover:bg-sunken transition-all"
              >
                ← Back to Reality Check
              </button>
            </div>
            <QuestScrollPanel
              scroll={state.scroll}
              busy={scrollBusy}
              onSummon={() => void handleSummon()}
              onAsk={ask}
            />
            <PlanChangeBar busy={applying} onSubmit={(req) => void handleApply(req)} />
            <BlueprintView
              b={state.blueprint}
              changeLog={state.changeLog}
              onProceedToTheme={() => {
                setBusy(null);
                update({ stage: "theme" });
              }}
              isProceedingToTheme={Boolean(busy)}
            />
            <MentorDock
              profile={state.profile || effectiveProfile}
              blueprint={state.blueprint}
              askSeed={askSeed}
              open={dockOpen}
              onToggle={setDockOpen}
              onAsked={() => award(40, "apprentice")}
            />
          </div>
        )}

        {showQuest && !busy && state.stage === "theme" && state.blueprint && (
          <div className="space-y-6">
            <ThemeSelection
              blueprint={state.blueprint}
              profile={state.profile || effectiveProfile}
              onSelectTheme={(theme) => {
                award(100, "stylist");
                void handleGenerateBackendContract(theme);
              }}
              onBack={() => {
                setBusy(null);
                update({ stage: "blueprint" });
              }}
              isGenerating={Boolean(busy)}
            />
            <MentorDock
              profile={state.profile || effectiveProfile}
              blueprint={state.blueprint}
              askSeed={askSeed}
              open={dockOpen}
              onToggle={setDockOpen}
              onAsked={() => award(40, "apprentice")}
            />
          </div>
        )}

        {showQuest && !busy && state.stage === "contract" && state.blueprint && (
          <div className="space-y-6">
            <BackendContractView
              contract={
                state.backendContract ||
                generateBackendContractFallback(state.blueprint, effectiveProfile)
              }
              blueprint={state.blueprint}
              profile={state.profile || effectiveProfile}
              selectedTheme={state.selectedTheme}
              onBackToTheme={() => {
                setBusy(null);
                update({ stage: "theme" });
              }}
              onOpenMentor={() => setDockOpen(true)}
              onProceedToSetup={() => void handleProceedToSetup()}
            />
            <MentorDock
              profile={state.profile || effectiveProfile}
              blueprint={state.blueprint}
              askSeed={askSeed}
              open={dockOpen}
              onToggle={setDockOpen}
              onAsked={() => award(40, "apprentice")}
            />
          </div>
        )}

        {showQuest && !busy && state.stage === "setup" && state.blueprint && (
          <div className="space-y-6">
            <ProjectSetupInspector
              setupSpec={
                state.setupSpec ||
                generateProjectSetupFallback(
                  state.blueprint,
                  effectiveProfile,
                  state.backendContract
                )
              }
              blueprint={state.blueprint}
              profile={state.profile || effectiveProfile}
              onLockSetupAndProceed={(approvedSetup) => void handleLockSetupAndGenerate(approvedSetup)}
              onBackToContract={() => {
                setBusy(null);
                update({ stage: "contract" });
              }}
              isGenerating={Boolean(busy)}
            />
            <MentorDock
              profile={state.profile || effectiveProfile}
              blueprint={state.blueprint}
              askSeed={askSeed}
              open={dockOpen}
              onToggle={setDockOpen}
              onAsked={() => award(40, "apprentice")}
            />
          </div>
        )}

        {showQuest && !busy && state.stage === "codebase" && state.blueprint && (
          <div className="space-y-6">
            <CodebaseExplorerView
              codebase={
                state.codebase || {
                  setupSpec:
                    state.setupSpec ||
                    generateProjectSetupFallback(
                      state.blueprint,
                      effectiveProfile,
                      state.backendContract
                    ),
                  files: [
                    ...generateBackendEngineFallback(
                      state.blueprint,
                      state.backendContract ||
                        generateBackendContractFallback(state.blueprint, effectiveProfile),
                      state.setupSpec ||
                        generateProjectSetupFallback(
                          state.blueprint,
                          effectiveProfile,
                          state.backendContract
                        )
                    ),
                    ...generateFrontendEngineFallback(
                      state.blueprint,
                      state.selectedTheme || "modern-minimal",
                      state.backendContract ||
                        generateBackendContractFallback(state.blueprint, effectiveProfile),
                      state.setupSpec ||
                        generateProjectSetupFallback(
                          state.blueprint,
                          effectiveProfile,
                          state.backendContract
                        )
                    ),
                  ],
                  backendEngineCompleted: true,
                  frontendEngineCompleted: true,
                  activeFilePath: "backend/app/main.py",
                }
              }
              blueprint={state.blueprint}
              profile={state.profile || effectiveProfile}
              onBackToSetup={() => {
                setBusy(null);
                update({ stage: "setup" });
              }}
              onRegenerateBackend={() => {
                if (state.setupSpec) {
                  void handleLockSetupAndGenerate(state.setupSpec);
                }
              }}
              onRegenerateFrontend={() => {
                if (state.setupSpec) {
                  void handleLockSetupAndGenerate(state.setupSpec);
                }
              }}
              isGenerating={Boolean(busy)}
            />
            <MentorDock
              profile={state.profile || effectiveProfile}
              blueprint={state.blueprint}
              askSeed={askSeed}
              open={dockOpen}
              onToggle={setDockOpen}
              onAsked={() => award(40, "apprentice")}
            />
          </div>
        )}


        {showQuest && !busy && state.stage === "mentor" && state.blueprint && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,440px)_1fr]">
            <div className="order-2 space-y-6 lg:order-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-3xl font-extrabold">{state.blueprint.title}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBusy(null);
                      update({ stage: "blueprint" });
                    }}
                    className="mono-label rounded-full border-2 border-border bg-accent px-4 py-2 font-bold text-accent-foreground cursor-pointer transition-all hover:opacity-90 shadow-xs"
                  >
                    ← Back to Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBusy(null);
                      update({ stage: "ideas" });
                    }}
                    className="mono-label rounded-full border-2 border-border px-4 py-2 cursor-pointer hover:bg-sunken"
                  >
                    back to ideas
                  </button>
                </div>
              </div>
              <QuestScrollPanel
                scroll={state.scroll}
                busy={scrollBusy}
                onSummon={() => void handleSummon()}
                onAsk={ask}
              />
              <BlueprintView
                b={state.blueprint}
                changeLog={state.changeLog}
                onProceedToTheme={() => update({ stage: "theme" })}
                isProceedingToTheme={Boolean(busy)}
              />
            </div>
            <div className="order-1 lg:order-2 lg:sticky lg:top-36 lg:h-fit">
              <Mentor
                profile={state.profile || effectiveProfile}
                blueprint={state.blueprint}
                askSeed={askSeed}
                onAsked={() => award(40, "apprentice")}
              />
            </div>
          </div>
        )}
      </main>

      <AuthModal
        open={authModalOpen && !isAuthenticated}
        onOpenChange={setAuthModalOpen}
        defaultTab={authModalTab}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
