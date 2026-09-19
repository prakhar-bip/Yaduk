import { useState, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { YadukLogo } from "./YadukLogo";
import { formatMentorMarkdown } from "./Mentor";
import {
  Sparkles,
  Palette,
  ArrowLeft,
  Check,
  Wand2,
  RefreshCw,
  Search,
  Bell,
  CheckCircle2,
  TrendingUp,
  Sliders,
  DollarSign,
  Users,
  Briefcase,
  ChevronDown,
  Layers,
  Bot,
  MessageSquare,
  X,
  Copy,
  ShieldCheck,
  Activity,
  Key,
  Database,
  Send,
  Minimize2,
  Code2,
  Globe,
  Lock,
  LayoutDashboard,
  Boxes,
  FileCheck2,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import type { Blueprint, StudentProfile, UserWorkflowStep } from "@/lib/types";
import {
  suggestThemes,
  generateProjectThemedSuggestions,
  getDefaultUserWorkflow,
  type AiThemeSuggestion,
} from "@/lib/quest.functions";
import { getContrastRatio, getWcagCompliance } from "@/lib/wcag";

export type FontPairing = {
  id: string;
  name: string;
  heading: string;
  body: string;
};

const FONT_PAIRINGS: FontPairing[] = [
  { id: "inter-space", name: "Inter + Space Grotesk", heading: "Space Grotesk", body: "Inter" },
  { id: "jetbrains", name: "JetBrains Mono + Fira", heading: "JetBrains Mono", body: "Fira Code" },
  { id: "lora-inter", name: "Lora + Inter (Editorial)", heading: "Lora", body: "Inter" },
  { id: "poppins-lato", name: "Poppins + Lato (Modern)", heading: "Poppins", body: "Lato" },
  { id: "system", name: "Modern Sans (System)", heading: "System UI", body: "sans-serif" },
];

function getInitialFont(themeName: string): FontPairing {
  const name = themeName.toLowerCase();
  if (name.includes("cyber") || name.includes("terminal") || name.includes("code") || name.includes("matrix")) {
    return FONT_PAIRINGS[1] ?? FONT_PAIRINGS[0]!;
  }
  if (name.includes("fintech") || name.includes("bank") || name.includes("precision") || name.includes("slate") || name.includes("clinical")) {
    return FONT_PAIRINGS[2] ?? FONT_PAIRINGS[0]!;
  }
  if (name.includes("glass") || name.includes("modern") || name.includes("glow") || name.includes("vision")) {
    return FONT_PAIRINGS[3] ?? FONT_PAIRINGS[0]!;
  }
  return FONT_PAIRINGS[0]!;
}

type MentorMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const UI_QUICK_PROMPTS = [
  "Is my color contrast readable for college evaluators?",
  "What color psychology works best for my domain?",
  "How should I style my landing page hero vs dashboard?",
  "Suggest a subtle accent color that complements my primary.",
];

export function ThemeSelection({
  blueprint,
  profile,
  onSelectTheme,
  onBack,
  isGenerating = false,
}: {
  blueprint: Blueprint;
  profile: StudentProfile | null;
  onSelectTheme: (themeId: string) => void;
  onBack: () => void;
  isGenerating?: boolean;
}) {
  // Query the planned Screen Navigation Workflow from the Blueprint
  const workflowPages: UserWorkflowStep[] =
    blueprint.userWorkflow && blueprint.userWorkflow.length > 0
      ? blueprint.userWorkflow
      : getDefaultUserWorkflow(blueprint.title);

  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const activePage: UserWorkflowStep = workflowPages[activePageIndex] ?? workflowPages[0]!;

  const initialProjectThemes = generateProjectThemedSuggestions(blueprint, profile);
  const [aiSuggestions, setAiSuggestions] = useState<AiThemeSuggestion[]>(initialProjectThemes);
  const [selectedThemeId, setSelectedThemeId] = useState<string>(
    initialProjectThemes[0]?.id || "project-theme-1",
  );

  // Active theme colors
  const activePreset =
    aiSuggestions.find((t) => t.id === selectedThemeId) || aiSuggestions[0] || initialProjectThemes[0];

  const [primaryColor, setPrimaryColor] = useState<string>(activePreset?.palette?.[0] || "#0F172A");
  const [secondaryColor, setSecondaryColor] = useState<string>(activePreset?.palette?.[1] || "#0284C7");
  const [accentColor, setAccentColor] = useState<string>(activePreset?.palette?.[2] || "#10B981");
  const [darkColor, setDarkColor] = useState<string>(activePreset?.palette?.[3] || "#020617");
  const [selectedFont, setSelectedFont] = useState<FontPairing>(getInitialFont(activePreset?.name || ""));

  // Floating Dock & Modal State
  const [isDockOpen, setIsDockOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"theme" | "mentor">("theme");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);

  // Mentor Chat State
  const [mentorMessages, setMentorMessages] = useState<MentorMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: `Hello! I'm your UI/UX Design Mentor for "${blueprint.title}". You are currently inspecting the skeleton for "${activePage.screen}". Ask me about visual hierarchy, typography, or color contrast for this view!`,
    },
  ]);
  const [mentorInput, setMentorInput] = useState<string>("");
  const [isMentorThinking, setIsMentorThinking] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const doSuggestThemes = useServerFn(suggestThemes);

  // Compute live WCAG contrast
  const contrastWithWhite = getContrastRatio(primaryColor, "#FFFFFF");
  const wcagStatus = getWcagCompliance(contrastWithWhite);

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === "mentor") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [mentorMessages, activeTab, isMentorThinking]);

  // Initial fetch of bespoke themes
  useEffect(() => {
    let isSubscribed = true;
    const fetchBespokeThemes = async () => {
      if (!blueprint) return;
      setIsSuggesting(true);
      try {
        const res = await doSuggestThemes({
          data: { profile: profile || ({} as any), blueprint },
        });
        if (isSubscribed && res?.suggestions && res.suggestions.length > 0 && res.suggestions[0]) {
          setAiSuggestions(res.suggestions);
          setSelectedThemeId(res.suggestions[0].id);
          applyPreset(res.suggestions[0]);
        }
      } catch (err) {
        console.warn("Using smart domain-tailored theme suggestions for project:", err);
      } finally {
        if (isSubscribed) setIsSuggesting(false);
      }
    };

    fetchBespokeThemes();
    return () => {
      isSubscribed = false;
    };
  }, [blueprint.title]);

  const applyPreset = (theme: AiThemeSuggestion) => {
    setSelectedThemeId(theme.id);
    setPrimaryColor(theme.palette[0] || "#0F172A");
    setSecondaryColor(theme.palette[1] || "#0284C7");
    setAccentColor(theme.palette[2] || "#10B981");
    setDarkColor(theme.palette[3] || "#020617");
    setSelectedFont(getInitialFont(theme.name));
    setIsCustom(false);
  };

  const handleRerollThemes = async () => {
    if (!blueprint) return;
    setIsSuggesting(true);
    try {
      const res = await doSuggestThemes({
        data: { profile: profile || ({} as any), blueprint },
      });
      if (res?.suggestions && res.suggestions.length > 0 && res.suggestions[0]) {
        setAiSuggestions(res.suggestions);
        applyPreset(res.suggestions[0]);
        toast.success(`Yaduk designed fresh bespoke themes for "${blueprint.title}"!`);
      }
    } catch (err) {
      console.error("Failed to regenerate themes:", err);
      toast.error("Could not reach AI model. Using tailored project themes.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSendMentorMessage = async (queryText?: string) => {
    const text = (queryText || mentorInput).trim();
    if (!text || isMentorThinking) return;

    setMentorInput("");
    const userMsg: MentorMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
    };
    setMentorMessages((prev) => [...prev, userMsg]);
    setIsMentorThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          context: {
            profile,
            blueprint: {
              ...blueprint,
              activeScreen: activePage.screen,
              activeRoute: activePage.route,
              activeTheme: {
                primary: primaryColor,
                secondary: secondaryColor,
                accent: accentColor,
                font: selectedFont.name,
                wcagRatio: contrastWithWhite,
              },
            },
          },
          currentTopic: "ui_ux_design",
          history: mentorMessages.slice(-6).map((m) => ({
            role: m.role,
            content: m.text,
          })),
        }),
      });

      if (!res.ok) throw new Error("Mentor connection error");
      const data = await res.json();
      const replyText =
        data.text ||
        `On the ${activePage.screen}, ensure key actions use ${primaryColor} with high-contrast text to guide evaluators naturally.`;

      setMentorMessages((prev) => [
        ...prev,
        {
          id: `mentor-${Date.now()}`,
          role: "assistant",
          text: replyText,
        },
      ]);
    } catch (err) {
      setMentorMessages((prev) => [
        ...prev,
        {
          id: `mentor-${Date.now()}`,
          role: "assistant",
          text: `Your current palette (${primaryColor} with ${accentColor}) has a contrast ratio of ${contrastWithWhite}:1. This meets WCAG 2.1 AA standards for ${activePage.screen}.`,
        },
      ]);
    } finally {
      setIsMentorThinking(false);
    }
  };

  const handleCopyTailwind = () => {
    const snippet = `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "${primaryColor}",
        secondary: "${secondaryColor}",
        accent: "${accentColor}",
        dark: "${darkColor}",
      },
      fontFamily: {
        heading: ["${selectedFont.heading}", "sans-serif"],
        body: ["${selectedFont.body}", "sans-serif"],
      },
    },
  },
};`;
    navigator.clipboard.writeText(snippet);
    toast.success("Tailwind theme configuration copied to clipboard!");
  };

  const handleProceed = () => {
    const themeName = isCustom ? "Custom Precision Aesthetic" : (activePreset?.name || "Modern Minimal");
    const richThemeDesc = `${themeName} (Primary: ${primaryColor}, Secondary: ${secondaryColor}, Accent: ${accentColor}, Font: ${selectedFont.name})`;
    onSelectTheme(richThemeDesc);
  };

  const getPageIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <Globe className="size-3.5" />;
      case 1:
        return <Lock className="size-3.5" />;
      case 2:
        return <LayoutDashboard className="size-3.5" />;
      case 3:
        return <Boxes className="size-3.5" />;
      case 4:
      default:
        return <FileCheck2 className="size-3.5" />;
    }
  };

  return (
    <div
      className="relative min-h-screen space-y-4 pb-24"
      style={
        {
          "--theme-primary": primaryColor,
          "--theme-secondary": secondaryColor,
          "--theme-accent": accentColor,
          "--theme-dark": darkColor,
          fontFamily: selectedFont.body,
        } as React.CSSProperties
      }
    >
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-4 shadow-xs sticky top-2 z-30">
        <div className="flex items-center gap-3.5">
          <YadukLogo size={42} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-700">
                STEP 7: VISUAL DESIGN STUDIO
              </span>
              <span className="text-xs text-slate-400">· Multi-Page Skeleton Inspector</span>
            </div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>{blueprint.title}</span>
              <span
                className="size-3 rounded-full border border-black/10 inline-block shadow-xs"
                style={{ backgroundColor: primaryColor }}
                title={`Primary: ${primaryColor}`}
              />
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleRerollThemes}
            disabled={isSuggesting}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isSuggesting ? "animate-spin text-blue-600" : "text-slate-500"}`} />
            <span>{isSuggesting ? "Synthesizing..." : "Reroll AI Themes"}</span>
          </button>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Plan</span>
          </button>

          <button
            type="button"
            onClick={handleProceed}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-sm transition-all cursor-pointer disabled:opacity-50 relative z-10 hover:opacity-95 active:scale-98"
            style={{ backgroundColor: primaryColor }}
          >
            <Wand2 className={`size-4 ${isGenerating ? "animate-spin" : ""}`} />
            <span>{isGenerating ? "Synthesizing Backend Spec..." : "Confirm Theme & Review Backend Spec →"}</span>
          </button>
        </div>
      </div>

      {/* 2. Page Skeleton Inspector Canvas */}
      <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden transition-all duration-300">
        {/* Screen Switcher Navigation Bar (Powered directly by the Knowledge Base User Workflow) */}
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Application User Journey & Screen Skeletons
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {workflowPages.map((page, idx) => {
                  const isActive = activePageIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePageIndex(idx)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "text-white shadow-xs scale-102"
                          : "bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                      }`}
                      style={isActive ? { backgroundColor: primaryColor } : {}}
                    >
                      {getPageIcon(idx)}
                      <span>{page.screen}</span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                          isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {page.route}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-right hidden md:block">
              <span className="text-[10px] font-mono text-slate-400 block">Inspecting Skeleton:</span>
              <span className="text-xs font-bold text-slate-700">
                {activePage.screen} ({activePage.route})
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Skeleton Wireframe Container */}
        <div className="p-6 sm:p-8 bg-slate-50/30 min-h-[520px]">
          {/* SKELETON 1: LANDING & SHOWCASE PAGE */}
          {activePageIndex === 0 && (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
              {/* Public Topnav Skeleton */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2">
                  <span
                    className="size-6 rounded-md flex items-center justify-center text-[10px] text-white font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {blueprint.title ? blueprint.title[0] : "Y"}
                  </span>
                  <span className="font-bold text-sm text-slate-900" style={{ fontFamily: selectedFont.heading }}>
                    {blueprint.title}
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-slate-600">
                  <span className="hover:text-slate-900 cursor-pointer">Architecture</span>
                  <span className="hover:text-slate-900 cursor-pointer">Features</span>
                  <span className="hover:text-slate-900 cursor-pointer">Docs</span>
                  <span className="hover:text-slate-900 cursor-pointer">Live Demo</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePageIndex(1)}
                    className="px-3 py-1 rounded-lg text-xs font-bold text-white shadow-xs cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Get Started →
                  </button>
                </div>
              </div>

              {/* Hero Section Wireframe */}
              <div className="text-center py-6 sm:py-10 space-y-4 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border border-slate-200 bg-white shadow-xs">
                  <span className="size-2 rounded-full" style={{ backgroundColor: accentColor }} />
                  <span className="text-slate-700">Production-Grade Architecture Specification</span>
                </div>

                <h1
                  className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight"
                  style={{ fontFamily: selectedFont.heading }}
                >
                  Engineered Solution for{" "}
                  <span style={{ color: primaryColor }}>{blueprint.title}</span>
                </h1>

                <p className="text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
                  {blueprint.overview?.summary ||
                    "A modular, scalable systems architecture designed to deliver verifiable results for evaluators and real-world users."}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:opacity-95"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Launch Live Workspace
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePageIndex(2)}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-xs"
                  >
                    Explore Dashboard →
                  </button>
                </div>
              </div>

              {/* 3-Column Feature Matrix Wireframe */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                {(blueprint.mvpFeatures || []).slice(0, 3).map((f, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
                    <div
                      className="size-8 rounded-lg flex items-center justify-center text-xs text-white font-bold"
                      style={{ backgroundColor: i === 0 ? primaryColor : i === 1 ? secondaryColor : accentColor }}
                    >
                      0{i + 1}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900" style={{ fontFamily: selectedFont.heading }}>
                      {f.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{f.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SKELETON 2: AUTHENTICATION & ONBOARDING */}
          {activePageIndex === 1 && (
            <div className="max-w-md mx-auto py-6 sm:py-10 space-y-6 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <div
                  className="size-10 rounded-xl mx-auto flex items-center justify-center text-white shadow-xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Lock className="size-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 pt-2" style={{ fontFamily: selectedFont.heading }}>
                  Authenticate Workspace
                </h3>
                <p className="text-xs text-slate-500">
                  Access protected endpoints and services for {blueprint.title}
                </p>
              </div>

              {/* Auth Card Wireframe */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex border-b border-slate-200">
                  <button
                    type="button"
                    className="flex-1 pb-2.5 text-xs font-bold border-b-2 text-slate-900"
                    style={{ borderColor: primaryColor }}
                  >
                    OAuth2 Client
                  </button>
                  <button type="button" className="flex-1 pb-2.5 text-xs font-medium text-slate-400">
                    Bearer Token
                  </button>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Client ID / Key</label>
                    <input
                      type="text"
                      disabled
                      placeholder="client_vts_84910294829"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-mono text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Client Secret</label>
                    <input
                      type="password"
                      disabled
                      value="••••••••••••••••••••••••"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-mono text-slate-600"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300" />
                      <span>Remember credentials</span>
                    </label>
                    <span className="text-blue-600 font-semibold cursor-pointer">Regenerate secret</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActivePageIndex(2)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:opacity-95 cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Exchange Token & Launch Dashboard →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SKELETON 3: MAIN TELEMETRY DASHBOARD */}
          {activePageIndex === 2 && (
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
              {/* Dashboard Subheader */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: selectedFont.heading }}>
                    Telemetry & Operational Overview
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time operational health for {blueprint.overview?.targetUsers || "evaluators"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-white shadow-xs"
                    style={{ backgroundColor: accentColor }}
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span>All Services Healthy</span>
                  </span>
                </div>
              </div>

              {/* 3 Metric KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Activity className="size-3.5 text-blue-600" />
                      <span>Active Transactions</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      +14.2%
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 mt-2" style={{ fontFamily: selectedFont.heading }}>
                    14,290
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Processed across active nodes</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-emerald-600" />
                      <span>System Cryptography</span>
                    </span>
                    <span
                      className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Armed
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 mt-2" style={{ fontFamily: selectedFont.heading }}>
                    AES-256-GCM
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Zero-plaintext isolation</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Activity className="size-3.5 text-indigo-600" />
                      <span>Roundtrip Latency</span>
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      P99 &lt; 35ms
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 mt-2" style={{ fontFamily: selectedFont.heading }}>
                    18.4 ms
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Sub-second execution</p>
                </div>
              </div>

              {/* Waveform Telemetry Chart */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <TrendingUp className="size-3.5 text-blue-600" />
                    <span>Real-Time Query Throughput</span>
                  </span>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="size-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                      <span>Production</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="size-2 rounded-full" style={{ backgroundColor: secondaryColor }} />
                      <span>Staging</span>
                    </span>
                  </div>
                </div>

                <div className="h-28 w-full">
                  <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="pageThemeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={primaryColor} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0,75 Q 60,20 120,45 T 240,25 T 320,55 T 400,15 L 400,100 L 0,100 Z"
                      fill="url(#pageThemeGrad)"
                    />
                    <path
                      d="M 0,75 Q 60,20 120,45 T 240,25 T 320,55 T 400,15"
                      fill="none"
                      stroke={primaryColor}
                      strokeWidth="2.5"
                    />
                    <path
                      d="M 0,85 Q 60,50 120,70 T 240,45 T 320,75 T 400,35"
                      fill="none"
                      stroke={secondaryColor}
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* SKELETON 4: CORE DOMAIN WORKFLOW / REGISTRY */}
          {activePageIndex === 3 && (
            <div className="max-w-5xl mx-auto space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: selectedFont.heading }}>
                    Core Entity Registry & Processing Workspace
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage active records, trigger transformations, and verify state
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    + Execute Action
                  </button>
                </div>
              </div>

              {/* Data Table Skeleton */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-mono text-[11px]">
                    <tr>
                      <th className="p-3">Reference ID</th>
                      <th className="p-3">Entity / Payload</th>
                      <th className="p-3">Service Owner</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="p-3 font-mono text-slate-500 font-semibold">rec_9f814a2b</td>
                      <td className="p-3 font-mono font-bold text-slate-800">Primary Core Execution Payload</td>
                      <td className="p-3">Production Cluster 01</td>
                      <td className="p-3">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: accentColor }}
                        >
                          ACTIVE
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-400 text-[11px]">2 mins ago</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-slate-500 font-semibold">rec_3c779e10</td>
                      <td className="p-3 font-mono font-bold text-slate-800">Ingestion Ingress Stream</td>
                      <td className="p-3">Worker Node Beta</td>
                      <td className="p-3">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: accentColor }}
                        >
                          ACTIVE
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-400 text-[11px]">18 mins ago</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-slate-500 font-semibold">rec_1a0255f8</td>
                      <td className="p-3 font-mono font-bold text-slate-800">Staging Test Fixture</td>
                      <td className="p-3">QA Sandbox</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          PENDING
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-400 text-[11px]">1 hour ago</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SKELETON 5: AUDIT, REVIEWS & COMPLIANCE */}
          {activePageIndex === 4 && (
            <div className="max-w-5xl mx-auto space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: selectedFont.heading }}>
                    Audit Log & System Verification Stream
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cryptographically verifiable event stream and supervisor review records
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50"
                  >
                    Export Log (JSON/CSV)
                  </button>
                </div>
              </div>

              {/* Event Stream Wireframe */}
              <div className="space-y-3">
                {[
                  { event: "STATE_TRANSITION_VERIFIED", hash: "sha256_9a01f82b", time: "Just now", status: "Verified" },
                  { event: "OAUTH_BEARER_ISSUED", hash: "sha256_3b11ca0e", time: "12 mins ago", status: "Audited" },
                  { event: "ENCRYPTION_VAULT_ROTATED", hash: "sha256_ff8849c1", time: "1 hour ago", status: "Compliant" },
                ].map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="size-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                      <div>
                        <p className="text-xs font-bold text-slate-900 font-mono">{item.event}</p>
                        <p className="text-[11px] font-mono text-slate-400">{item.hash}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400">{item.time}</span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: accentColor }}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Floating Action Bubble (FAB) & Overlay Tool Window */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Floating Utility Overlay Window */}
        {isDockOpen && (
          <div className="w-[calc(100vw-2rem)] sm:w-[440px] max-h-[80vh] rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
            {/* Window Top Navigation Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 px-4 py-3">
              <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-slate-200/70">
                <button
                  type="button"
                  onClick={() => setActiveTab("theme")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "theme"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Palette className="size-3.5 text-blue-600" />
                  <span>Theme Forge</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("mentor")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "mentor"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Bot className="size-3.5 text-indigo-600" />
                  <span>UI/UX Mentor</span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <span
                  className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border ${wcagStatus.colorClass}`}
                >
                  {wcagStatus.badgeText}
                </span>
                <button
                  type="button"
                  onClick={() => setIsDockOpen(false)}
                  className="size-7 rounded-lg hover:bg-slate-200/60 grid place-items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Minimize floating dock"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Window Content Body */}
            <div className="overflow-y-auto p-4 flex-1 space-y-4 max-h-[calc(80vh-60px)]">
              {/* TAB 1: THEME FORGE */}
              {activeTab === "theme" && (
                <div className="space-y-4">
                  {/* AI Curated Presets Carousel */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-blue-600" />
                        <span>AI Curated Archetypes</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Click to apply</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {aiSuggestions.map((theme, idx) => {
                        const isSelected = !isCustom && selectedThemeId === theme.id;
                        return (
                          <div
                            key={theme.id + idx}
                            onClick={() => applyPreset(theme)}
                            className={`rounded-xl p-2.5 border transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20"
                                : "border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-blue-300"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1 mb-1.5">
                              <span className="font-bold text-[11px] text-slate-900 line-clamp-1">
                                {theme.name}
                              </span>
                              {isSelected && <Check className="size-3 text-blue-600 shrink-0" />}
                            </div>
                            {/* Swatches */}
                            <div className="flex items-center gap-1">
                              {theme.palette.map((c, cIdx) => (
                                <span
                                  key={cIdx}
                                  className="size-3.5 rounded-full border border-black/10 shadow-xs"
                                  style={{ backgroundColor: c }}
                                  title={c}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interactive Color Pickers */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3.5 space-y-3">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sliders className="size-3.5 text-slate-600" />
                      <span>Custom Precision Colors</span>
                    </span>

                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Primary Color */}
                      <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-2">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => {
                            setPrimaryColor(e.target.value);
                            setIsCustom(true);
                          }}
                          className="size-6 rounded border-0 cursor-pointer p-0 bg-transparent"
                        />
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase block">Primary</label>
                          <input
                            type="text"
                            value={primaryColor}
                            onChange={(e) => {
                              setPrimaryColor(e.target.value);
                              setIsCustom(true);
                            }}
                            className="font-mono text-xs text-slate-800 w-full focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Secondary Color */}
                      <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-2">
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => {
                            setSecondaryColor(e.target.value);
                            setIsCustom(true);
                          }}
                          className="size-6 rounded border-0 cursor-pointer p-0 bg-transparent"
                        />
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase block">Secondary</label>
                          <input
                            type="text"
                            value={secondaryColor}
                            onChange={(e) => {
                              setSecondaryColor(e.target.value);
                              setIsCustom(true);
                            }}
                            className="font-mono text-xs text-slate-800 w-full focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Accent Color */}
                      <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-2">
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => {
                            setAccentColor(e.target.value);
                            setIsCustom(true);
                          }}
                          className="size-6 rounded border-0 cursor-pointer p-0 bg-transparent"
                        />
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase block">Accent</label>
                          <input
                            type="text"
                            value={accentColor}
                            onChange={(e) => {
                              setAccentColor(e.target.value);
                              setIsCustom(true);
                            }}
                            className="font-mono text-xs text-slate-800 w-full focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Dark/Canvas Color */}
                      <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-2">
                        <input
                          type="color"
                          value={darkColor}
                          onChange={(e) => {
                            setDarkColor(e.target.value);
                            setIsCustom(true);
                          }}
                          className="size-6 rounded border-0 cursor-pointer p-0 bg-transparent"
                        />
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase block">Dark / Neutral</label>
                          <input
                            type="text"
                            value={darkColor}
                            onChange={(e) => {
                              setDarkColor(e.target.value);
                              setIsCustom(true);
                            }}
                            className="font-mono text-xs text-slate-800 w-full focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Typography Pairing Selector */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3.5 space-y-2">
                    <label className="text-xs font-bold text-slate-900 block">Typography Pairing</label>
                    <select
                      value={selectedFont.id}
                      onChange={(e) => {
                        const font = FONT_PAIRINGS.find((f) => f.id === e.target.value);
                        if (font) setSelectedFont(font);
                      }}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {FONT_PAIRINGS.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.heading} / {f.body})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action Shortcuts */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleCopyTailwind}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <Code2 className="size-3.5 text-blue-600" />
                      <span>Copy Tailwind Config</span>
                    </button>

                    <span className="text-[10px] font-mono text-slate-400">Updates skeletons live</span>
                  </div>
                </div>
              )}

              {/* TAB 2: DEDICATED UI/UX MENTOR */}
              {activeTab === "mentor" && (
                <div className="flex flex-col h-[380px] justify-between">
                  {/* Message Thread */}
                  <div className="overflow-y-auto overflow-x-hidden space-y-3 pr-1 flex-1 min-w-0">
                    {mentorMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex w-full min-w-0 ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`w-full max-w-[94%] sm:max-w-[88%] min-w-0 overflow-hidden break-words text-xs leading-relaxed ${
                            msg.role === "user"
                              ? "whitespace-pre-wrap rounded-2xl rounded-tr-xs bg-blue-600 px-3.5 py-2 text-white shadow-sm"
                              : "mentor-md rounded-2xl rounded-tl-xs border border-slate-200/80 bg-slate-50/90 p-3.5 text-slate-800 shadow-2xs"
                          }`}
                        >
                          {msg.role === "user" ? (
                            msg.text
                          ) : (
                            <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                              {formatMentorMarkdown(msg.text)}
                            </Markdown>
                          )}
                        </div>
                      </div>
                    ))}
                    {isMentorThinking && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 italic p-1">
                        <Bot className="size-3.5 animate-spin text-blue-600" />
                        <span>Evaluating design aesthetics against WCAG...</span>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Quick Design Prompts */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                      {UI_QUICK_PROMPTS.map((q, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSendMentorMessage(q)}
                          className="shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-medium transition-colors cursor-pointer border border-slate-200/60 shadow-2xs"
                        >
                          {q}
                        </button>
                      ))}
                    </div>

                    {/* Chat Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={mentorInput}
                        onChange={(e) => setMentorInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendMentorMessage();
                        }}
                        placeholder={`Ask UI/UX mentor about ${activePage.screen}...`}
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendMentorMessage()}
                        disabled={!mentorInput.trim() || isMentorThinking}
                        className="size-8 rounded-lg bg-blue-600 text-white grid place-items-center hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                      >
                        <Send className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating Bubble Pill Trigger */}
        <div className="flex items-center gap-2">
          {!isDockOpen && (
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-lg animate-in fade-in slide-in-from-right-4">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("theme");
                  setIsDockOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
              >
                <Palette className="size-3.5 text-amber-400" />
                <span>Theme Forge</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("mentor");
                  setIsDockOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white text-slate-700 hover:bg-slate-100 transition-all border border-slate-200/80 shadow-xs cursor-pointer"
              >
                <Bot className="size-3.5 text-indigo-600" />
                <span>AI Mentor</span>
              </button>
            </div>
          )}

          {/* Main FAB Toggle Button */}
          <button
            type="button"
            onClick={() => setIsDockOpen(!isDockOpen)}
            className="size-12 rounded-full text-white shadow-xl grid place-items-center cursor-pointer transition-all hover:scale-105 active:scale-95 ring-4 ring-white/80"
            style={{ backgroundColor: primaryColor }}
            title={isDockOpen ? "Minimize Design Dock" : "Open Theme & Mentor Dock"}
          >
            {isDockOpen ? (
              <Minimize2 className="size-5" />
            ) : (
              <Sparkles className="size-5 animate-pulse" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
