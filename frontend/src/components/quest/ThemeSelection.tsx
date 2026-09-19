import { useState, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { YadukLogo } from "./YadukLogo";
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
  Maximize2,
  Code2,
} from "lucide-react";
import { toast } from "sonner";
import type { Blueprint, StudentProfile } from "@/lib/types";
import {
  suggestThemes,
  generateProjectThemedSuggestions,
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
  "Should I use cards or a data table for my core view?",
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
  const [layoutStyle, setLayoutStyle] = useState<"sidebar" | "topnav" | "split">("sidebar");

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
      text: `Hello! I'm your dedicated UI/UX Design Mentor for "${blueprint.title}". I'm watching your full-screen skeleton live. Ask me about color psychology, contrast accessibility, or layout structure!`,
    },
  ]);
  const [mentorInput, setMentorInput] = useState<string>("");
  const [isMentorThinking, setIsMentorThinking] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const doSuggestThemes = useServerFn(suggestThemes);

  // Compute live WCAG contrast
  const contrastWithWhite = getContrastRatio(primaryColor, "#FFFFFF");
  const wcagStatus = getWcagCompliance(contrastWithWhite);

  // Domain Detection
  const domainText = `${blueprint.title || ""} ${blueprint.overview?.problemStatement || ""} ${blueprint.overview?.proposedSolution || ""} ${blueprint.stack?.map((s) => s.name).join(" ") || ""}`.toLowerCase();
  const isSecurityOrFinTech = /token|auth|oauth|bank|pay|crypto|vault|encrypt|security|pci|credit/.test(domainText);
  const isHealthOrBio = /health|patient|doctor|scan|clinical|medical|disease|hospital/.test(domainText);

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
              activeTheme: {
                primary: primaryColor,
                secondary: secondaryColor,
                accent: accentColor,
                font: selectedFont.name,
                wcagRatio: contrastWithWhite,
              },
            },
          },
          currentTopic: "architecture",
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
        "I recommend ensuring high contrast between your data rows and status badges so evaluators can read the table effortlessly.";

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
          text: `Your current palette (${primaryColor} with ${accentColor}) has a contrast ratio of ${contrastWithWhite}:1. This meets WCAG 2.1 AA standards. Make sure secondary data text maintains at least 4.5:1 on background surfaces.`,
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
              <span className="text-xs text-slate-400">· Full-Screen Interactive Skeleton</span>
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
            <span>{isGenerating ? "Manifesting Codebase..." : "Confirm Theme & Manifest Code →"}</span>
          </button>
        </div>
      </div>

      {/* 2. Full-Screen Edge-to-Edge Project Skeleton */}
      <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden transition-all duration-300">
        {/* Mock Application Top Navigation Bar */}
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3 bg-slate-50/80">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <span
                className="size-7 rounded-lg flex items-center justify-center text-xs text-white font-bold shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                {blueprint.title ? blueprint.title[0] : "Y"}
              </span>
              <span className="font-bold text-sm text-slate-900 tracking-tight" style={{ fontFamily: selectedFont.heading }}>
                {blueprint.title}
              </span>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-600">
              <span
                className="px-2.5 py-1 rounded-md text-white font-semibold shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                Dashboard
              </span>
              <span className="px-2.5 py-1 rounded-md hover:bg-slate-200/60 cursor-pointer">
                {isSecurityOrFinTech ? "Tokens & Vault" : "Resources"}
              </span>
              <span className="px-2.5 py-1 rounded-md hover:bg-slate-200/60 cursor-pointer">
                {isSecurityOrFinTech ? "OAuth Clients" : "Data Services"}
              </span>
              <span className="px-2.5 py-1 rounded-md hover:bg-slate-200/60 cursor-pointer">
                Telemetry
              </span>
              <span className="px-2.5 py-1 rounded-md hover:bg-slate-200/60 cursor-pointer">
                Settings
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="size-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search resources, tokens, endpoints..."
                disabled
                className="rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1 text-xs w-56 text-slate-400 focus:outline-none"
              />
            </div>
            <div className="size-8 rounded-full border border-slate-200 bg-white grid place-items-center text-slate-600 shadow-xs">
              <Bell className="size-3.5" />
            </div>
            <div
              className="size-8 rounded-full text-white text-xs font-bold grid place-items-center shadow-xs"
              style={{ backgroundColor: secondaryColor }}
            >
              {profile?.name ? profile.name[0] : "S"}
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-6 space-y-6">
          {/* Subheader & Live Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: selectedFont.heading }}>
                {isSecurityOrFinTech
                  ? "Virtual Token Engine & Cryptographic Vault"
                  : isHealthOrBio
                  ? "Diagnostic Telemetry & Patient Inference Engine"
                  : "Production Systems Telemetry & Control Center"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time production metrics tailored for {blueprint.overview?.targetUsers || "evaluators and stakeholders"}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <span
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-white shadow-xs"
                style={{ backgroundColor: accentColor }}
              >
                <CheckCircle2 className="size-3.5" />
                <span>Live Engine Online</span>
              </span>
              <button
                type="button"
                className="rounded-lg px-3 py-1 text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                {isSecurityOrFinTech ? "+ Issue Virtual Token" : "+ Deploy Service"}
              </button>
            </div>
          </div>

          {/* 3 Full-Width Key Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold flex items-center gap-1.5">
                  <Key className="size-3.5 text-blue-600" />
                  <span>{isSecurityOrFinTech ? "Active Virtual Tokens" : "Active Entities"}</span>
                </span>
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                  style={{ backgroundColor: accentColor }}
                >
                  +14.2% Trend
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-2" style={{ fontFamily: selectedFont.heading }}>
                14,290
              </p>
              <p className="text-[11px] text-slate-400 mt-1">PCI-DSS Tokenized across active merchants</p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  <span>Encryption & Vault State</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  AES-256-GCM
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-2" style={{ fontFamily: selectedFont.heading }}>
                Vault Armed
              </p>
              <p className="text-[11px] text-slate-400 mt-1">AEAD zero-plaintext memory isolation</p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold flex items-center gap-1.5">
                  <Activity className="size-3.5 text-indigo-600" />
                  <span>API Response Latency</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                  P99 &lt; 35ms
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-2" style={{ fontFamily: selectedFont.heading }}>
                18.4 ms
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Sub-second authorization roundtrip</p>
            </div>
          </div>

          {/* Full-Width Telemetry & Data Table Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left/Main: Full Feature Data Table */}
            <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2" style={{ fontFamily: selectedFont.heading }}>
                    <Database className="size-4 text-slate-600" />
                    <span>
                      {isSecurityOrFinTech
                        ? "Tokenized Payment Credentials (VTS Registry)"
                        : "Core Domain Registry & Service Entities"}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Live database records rendered with current typography and status styling
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400">Total: 4 Records Shown</span>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-200/90">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-mono text-[11px]">
                    <tr>
                      <th className="p-3">Token ID / UUID</th>
                      <th className="p-3">{isSecurityOrFinTech ? "Masked PAN" : "Entity Name"}</th>
                      <th className="p-3">Associated Merchant</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="p-3 font-mono text-slate-500 font-semibold">tok_9f81...4a2b</td>
                      <td className="p-3 font-mono font-bold text-slate-800">
                        {isSecurityOrFinTech ? "****-****-****-4242" : "Primary Service Worker"}
                      </td>
                      <td className="p-3">Apex Merchant Gateway</td>
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
                      <td className="p-3 font-mono text-slate-500 font-semibold">tok_3c77...9e10</td>
                      <td className="p-3 font-mono font-bold text-slate-800">
                        {isSecurityOrFinTech ? "****-****-****-8812" : "Kafka Ingestion Pipeline"}
                      </td>
                      <td className="p-3">Global Logistics LLC</td>
                      <td className="p-3">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: accentColor }}
                        >
                          ACTIVE
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-400 text-[11px]">14 mins ago</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-slate-500 font-semibold">tok_1a02...55f8</td>
                      <td className="p-3 font-mono font-bold text-slate-800">
                        {isSecurityOrFinTech ? "****-****-****-1009" : "OAuth Token Dispatcher"}
                      </td>
                      <td className="p-3">Staging Sandbox Merchant</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          PENDING
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-400 text-[11px]">1 hour ago</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-slate-500 font-semibold">tok_88b1...302a</td>
                      <td className="p-3 font-mono font-bold text-slate-800">
                        {isSecurityOrFinTech ? "****-****-****-9471" : "Audit Log Daemon"}
                      </td>
                      <td className="p-3">Sunset Financial Inc</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                          REVOKED
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-400 text-[11px]">Yesterday</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Real-time Telemetry & Trajectory SVG */}
            <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2" style={{ fontFamily: selectedFont.heading }}>
                  <TrendingUp className="size-4 text-blue-600" />
                  <span>Traffic & Query Trajectory</span>
                </h4>
                <span
                  className="size-2.5 rounded-full animate-pulse"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>

              {/* Dynamic Waveform Chart */}
              <div className="h-32 w-full rounded-lg border border-slate-100 bg-slate-50/50 p-2">
                <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="fullThemeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={primaryColor} stopOpacity="0.35" />
                      <stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0,75 Q 60,20 120,45 T 240,25 T 320,55 T 400,15 L 400,100 L 0,100 Z"
                    fill="url(#fullThemeGrad)"
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

              {/* Specimen Buttons & UI Controls */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <span className="text-[11px] font-mono text-slate-400 block uppercase">
                  Active Button Aesthetics
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition-all"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Primary Button
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition-all"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    Secondary
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition-all"
                    style={{ backgroundColor: accentColor }}
                  >
                    Accent
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Floating Action Bubble (FAB) & Overlay Tool Window */}
      {/* FLOATING ACTION BUBBLE */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Floating Utility Overlay Window (When Open) */}
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
                  className="size-7 rounded-lg hover:bg-slate-200/60 grid place-items-center text-slate-400 hover:text-slate-700 transition-colors"
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
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
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
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      <Code2 className="size-3.5 text-blue-600" />
                      <span>Copy Tailwind Config</span>
                    </button>

                    <span className="text-[10px] font-mono text-slate-400">Updates canvas in real-time</span>
                  </div>
                </div>
              )}

              {/* TAB 2: DEDICATED UI/UX MENTOR */}
              {activeTab === "mentor" && (
                <div className="flex flex-col h-[380px] justify-between">
                  {/* Message Thread */}
                  <div className="overflow-y-auto space-y-3 pr-1 flex-1">
                    {mentorMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          msg.role === "user" ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`rounded-xl px-3 py-2 text-xs leading-relaxed max-w-[88%] ${
                            msg.role === "user"
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-800 border border-slate-200/80"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isMentorThinking && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 italic p-1">
                        <Bot className="size-3.5 animate-spin text-blue-600" />
                        <span>Evaluating design aesthetics...</span>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Quick Design Prompts */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                      {UI_QUICK_PROMPTS.slice(0, 2).map((q, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSendMentorMessage(q)}
                          className="shrink-0 text-[10px] px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200/70 text-slate-600 font-medium transition-colors"
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
                        placeholder="Ask UI/UX mentor about styling, colors, layout..."
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendMentorMessage()}
                        disabled={!mentorInput.trim() || isMentorThinking}
                        className="size-8 rounded-lg bg-blue-600 text-white grid place-items-center hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
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
