import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import type { Blueprint, StudentProfile } from "@/lib/types";
import {
  suggestThemes,
  generateProjectThemedSuggestions,
  type AiThemeSuggestion,
} from "@/lib/quest.functions";

export type ThemeOption = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  bestFor: string;
  badge: string;
  palette: string[];
  cardPreviewClass: string;
  sampleMetric: { label: string; value: string; badge: string };
  themeRationale?: string;
};

function getFontPairing(themeName: string): { heading: string; body: string } {
  const name = themeName.toLowerCase();
  if (name.includes("cyber") || name.includes("terminal") || name.includes("code") || name.includes("matrix")) {
    return { heading: "JetBrains Mono", body: "Roboto Mono" };
  }
  if (name.includes("fintech") || name.includes("bank") || name.includes("precision") || name.includes("slate") || name.includes("clinical")) {
    return { heading: "Lora", body: "Inter" };
  }
  if (name.includes("glass") || name.includes("modern") || name.includes("glow") || name.includes("vision")) {
    return { heading: "Poppins", body: "Lato" };
  }
  return { heading: "Source Sans Pro", body: "Inter" };
}

function getAiBenefitBadge(theme: AiThemeSuggestion, index: number): string {
  if (theme.themeRationale) {
    const r = theme.themeRationale.toLowerCase();
    if (r.includes("engagement") || r.includes("user")) return "AI: Boosts Engagement";
    if (r.includes("trust") || r.includes("clinical") || r.includes("reliable")) return "AI: Trustworthy & Modern";
    if (r.includes("technical") || r.includes("density") || r.includes("deep")) return "AI: Technical & Bold";
    if (r.includes("retention") || r.includes("clarity")) return "AI: High Visual Retention";
  }
  const defaults = ["AI: Boosts Engagement", "AI: Trustworthy & Modern", "AI: Technical & Bold", "AI: High Visual Retention"];
  return defaults[index % defaults.length];
}

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
  const [customTheme, setCustomTheme] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);

  const doSuggestThemes = useServerFn(suggestThemes);

  useEffect(() => {
    let isSubscribed = true;
    const fetchBespokeThemes = async () => {
      if (!blueprint) return;
      setIsSuggesting(true);
      try {
        const res = await doSuggestThemes({
          data: { profile: profile || ({} as any), blueprint },
        });
        if (isSubscribed && res?.suggestions && res.suggestions.length > 0) {
          setAiSuggestions(res.suggestions);
          setSelectedThemeId(res.suggestions[0].id);
          setIsCustom(false);
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

  const handleRerollThemes = async () => {
    if (!blueprint) return;
    setIsSuggesting(true);
    try {
      const res = await doSuggestThemes({
        data: { profile: profile || ({} as any), blueprint },
      });
      if (res?.suggestions && res.suggestions.length > 0) {
        setAiSuggestions(res.suggestions);
        setSelectedThemeId(res.suggestions[0].id);
        setIsCustom(false);
        toast.success(`Yaduk designed fresh bespoke themes for "${blueprint.title}"!`);
      }
    } catch (err) {
      console.error("Failed to regenerate themes:", err);
      toast.error("Could not reach AI model. Using tailored project themes.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const selectedTheme =
    aiSuggestions.find((t) => t.id === selectedThemeId) || aiSuggestions[0] || initialProjectThemes[0];

  const primaryColor = selectedTheme?.palette?.[0] || "#0f766e";
  const secondaryColor = selectedTheme?.palette?.[1] || "#0284c7";
  const accentColor = selectedTheme?.palette?.[2] || "#0d9488";
  const darkColor = selectedTheme?.palette?.[3] || "#0f172a";

  const fontPairing = getFontPairing(isCustom ? (customTheme || "Custom") : (selectedTheme?.name || "Standard"));

  const handleProceed = () => {
    if (isCustom && customTheme.trim()) {
      onSelectTheme(customTheme.trim());
    } else if (selectedTheme) {
      const richThemeDesc = `${selectedTheme.name} (${selectedTheme.tagline} — colors: ${selectedTheme.palette.join(", ")})`;
      onSelectTheme(richThemeDesc);
    } else {
      onSelectTheme("modern-minimal");
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <YadukLogo size={44} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-700">
                STEP 6: VISUAL DESIGN STUDIO
              </span>
              <span className="text-xs text-slate-400">· Theme & Aesthetic Selection</span>
            </div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Visual Design Studio for <span className="text-blue-600">"{blueprint.title}"</span>
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
        </div>
      </div>

      {/* Main Split Screen: Left (Theme & Aesthetic Forge) / Right (Live Component Canvas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Curated Theme & Aesthetic Forge */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <Palette className="size-4 text-blue-600" />
                <span>Curated Theme & Aesthetic Forge</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Formulated from your tech stack and target users. Select an aesthetic to preview live.
              </p>
            </div>

            {/* Theme Presets Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {aiSuggestions.map((theme, idx) => {
                const isSelected = !isCustom && selectedThemeId === theme.id;
                const fonts = getFontPairing(theme.name);
                const aiBadge = getAiBenefitBadge(theme, idx);

                return (
                  <div
                    key={theme.id + idx}
                    onClick={() => {
                      setSelectedThemeId(theme.id);
                      setIsCustom(false);
                    }}
                    className={`relative rounded-xl p-3.5 transition-all cursor-pointer flex flex-col justify-between border ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/40 shadow-sm ring-2 ring-blue-500/20"
                        : "border-slate-200/90 bg-slate-50/40 hover:border-blue-300 hover:bg-white"
                    }`}
                  >
                    {/* Top row: Title + Radio */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-display text-xs font-bold text-slate-900 leading-snug">
                          {theme.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                          {theme.tagline}
                        </p>
                      </div>
                      <div
                        className={`size-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="size-2.5 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Palette Swatches */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/70">
                      <div className="flex items-center gap-1.5">
                        {theme.palette.map((color, cIdx) => (
                          <div key={cIdx} className="flex flex-col items-center gap-0.5">
                            <span
                              className="size-4 rounded-full border border-black/10 shadow-xs"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                            <span className="font-mono text-[8px] text-slate-400">
                              {color.slice(0, 4)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Typography Pairing */}
                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-600">
                      <span className="font-semibold text-slate-800">{fonts.heading}</span>
                      <span className="text-slate-400">/ {fonts.body}</span>
                    </div>

                    {/* AI Rationale Tag */}
                    <div className="mt-2">
                      <span className="inline-block rounded-md bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-700">
                        {aiBadge}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Style Prompt Box */}
            <div
              onClick={() => setIsCustom(true)}
              className={`rounded-xl border p-3.5 transition-all cursor-pointer ${
                isCustom
                  ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20"
                  : "border-dashed border-slate-300 bg-slate-50/50 hover:border-slate-400"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Sparkles className="size-3.5 text-blue-600" />
                  <span>Custom Style Prompt</span>
                </div>
                {isCustom && (
                  <span className="rounded-full bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Describe your custom design vision (e.g., 'Warm and organic with playful illustrations' or 'Apple Frosted Dark Mode').
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={customTheme}
                  onChange={(e) => {
                    setCustomTheme(e.target.value);
                    setIsCustom(true);
                  }}
                  onFocus={() => setIsCustom(true)}
                  placeholder="e.g. Clinical High-Contrast Dark Mode with Cyan Highlights"
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customTheme.trim()) {
                      setIsCustom(true);
                      toast.success(`Custom aesthetic set to "${customTheme.trim()}"`);
                    }
                  }}
                  disabled={!customTheme.trim()}
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  Generate Theme
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Instant Application Mockup (Live Component Canvas) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Instant Application Mockup</span>
                <span className="rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-mono font-bold">
                  LIVE CANVAS
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {isCustom
                  ? `Custom aesthetic applied: "${customTheme || "Custom"}"`
                  : `${selectedTheme?.name} applied across layout, typography, charts & components.`}
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <span className="font-mono text-[10px] text-slate-400">
                Font: <strong className="text-slate-700">{fontPairing.heading}</strong>
              </span>
            </div>
          </div>

          {/* Real-time Dynamic Styled Canvas */}
          <div
            className="rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden transition-all duration-300"
            style={
              {
                "--theme-primary": primaryColor,
                "--theme-secondary": secondaryColor,
                "--theme-accent": accentColor,
                "--theme-dark": darkColor,
              } as React.CSSProperties
            }
          >
            {/* Mock Header Inside Preview */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 font-display font-bold text-xs text-slate-900">
                  <span
                    className="size-3.5 rounded-full flex items-center justify-center text-[8px] text-white font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    S
                  </span>
                  <span>{blueprint.title.slice(0, 20)}</span>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400">
                  <span>Setup</span>
                  <span>&gt;</span>
                  <span>Branding</span>
                  <span>&gt;</span>
                  <span className="font-semibold text-slate-700">Visual Design</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative hidden md:block">
                  <Search className="size-3 text-slate-400 absolute left-2 top-1.5" />
                  <input
                    type="text"
                    placeholder="Search systems..."
                    disabled
                    className="rounded-md border border-slate-200 bg-white pl-6 pr-2 py-0.5 text-[10px] w-28 text-slate-400"
                  />
                </div>
                <div className="size-6 rounded-full border border-slate-200 bg-white grid place-items-center text-slate-600">
                  <Bell className="size-3" />
                </div>
                <div
                  className="size-6 rounded-full text-white text-[10px] font-bold grid place-items-center shadow-xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  {profile?.name ? profile.name[0] : "A"}
                </div>
              </div>
            </div>

            {/* Mock Dashboard Body */}
            <div className="p-4 sm:p-5 space-y-4">
              {/* Top Subheader with action button */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-display text-sm sm:text-base font-bold text-slate-900">
                    Analytics & Telemetry Overview
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Real-time metrics tailored for {blueprint.overview?.targetUsers || "evaluators"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white shadow-xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    + New Campaign
                  </span>
                </div>
              </div>

              {/* Charts Row: Line Chart + Bar Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Line Chart Component */}
                <div className="md:col-span-8 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <TrendingUp className="size-3 text-emerald-600" />
                      <span>Traffic & Query Trajectory</span>
                    </span>
                    <div className="flex items-center gap-2 text-[10px]">
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

                  {/* SVG Wavy Line Chart */}
                  <div className="h-28 w-full">
                    <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="themeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={primaryColor} stopOpacity="0.35" />
                          <stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Fill area */}
                      <path
                        d="M 0,80 Q 50,20 100,50 T 200,30 T 300,60 T 400,20 L 400,100 L 0,100 Z"
                        fill="url(#themeGrad)"
                      />
                      {/* Primary line */}
                      <path
                        d="M 0,80 Q 50,20 100,50 T 200,30 T 300,60 T 400,20"
                        fill="none"
                        stroke={primaryColor}
                        strokeWidth="2.5"
                      />
                      {/* Secondary line */}
                      <path
                        d="M 0,90 Q 50,60 100,75 T 200,55 T 300,80 T 400,45"
                        fill="none"
                        stroke={secondaryColor}
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                      />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                    <span>Jul</span>
                  </div>
                </div>

                {/* Bar Chart Component */}
                <div className="md:col-span-4 rounded-xl border border-slate-100 bg-slate-50/50 p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700">Cluster Users</span>
                    <span className="text-[10px] font-mono font-bold" style={{ color: primaryColor }}>
                      +14.8%
                    </span>
                  </div>
                  {/* Vertical bars */}
                  <div className="flex items-end justify-between gap-1 h-24 pt-2">
                    {[35, 60, 45, 80, 65, 90].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t-sm transition-all duration-300"
                          style={{
                            height: `${h}%`,
                            backgroundColor: i === 5 ? primaryColor : secondaryColor,
                            opacity: i === 5 ? 1 : 0.75,
                          }}
                        />
                        <span className="text-[8px] font-mono text-slate-400">
                          {["J", "F", "M", "A", "M", "J"][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3 Metric Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Total Sales / Output</span>
                    <span className="rounded bg-emerald-50 px-1 py-0.2 text-emerald-700 font-bold">
                      +5.68%
                    </span>
                  </div>
                  <p className="text-lg font-bold text-slate-900 mt-1">$45,670</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Automated telemetry</p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Active Users / Sessions</span>
                    <span className="rounded bg-emerald-50 px-1 py-0.2 text-emerald-700 font-bold">
                      +1.58%
                    </span>
                  </div>
                  <p className="text-lg font-bold text-slate-900 mt-1">1,234</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">High retention index</p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Active Builds</span>
                    <span className="rounded bg-blue-50 px-1 py-0.2 text-blue-700 font-bold">
                      Ready
                    </span>
                  </div>
                  <p className="text-lg font-bold text-slate-900 mt-1">58 Projects</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Multi-layer architecture</p>
                </div>
              </div>

              {/* Component Specimen Matrix: Table + Live Form Elements */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3 space-y-3">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                  Interactive Specimen: Table & Form Controls
                </span>

                {/* Mini Table */}
                <div className="overflow-x-auto rounded-lg border border-slate-200/80 bg-white">
                  <table className="w-full text-left text-[11px]">
                    <thead className="border-b border-slate-100 bg-slate-50/60 text-slate-400 font-mono text-[10px]">
                      <tr>
                        <th className="p-2">ID</th>
                        <th className="p-2">Entity Name</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="p-2 font-mono text-slate-400">#101</td>
                        <td className="p-2 font-semibold">User Authentication Service</td>
                        <td className="p-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Passed
                          </span>
                        </td>
                        <td className="p-2 font-mono text-slate-400 text-[10px]">Apr 13</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono text-slate-400">#102</td>
                        <td className="p-2 font-semibold">Database Persistence Layer</td>
                        <td className="p-2">
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold text-white shadow-xs"
                            style={{ backgroundColor: primaryColor }}
                          >
                            Active
                          </span>
                        </td>
                        <td className="p-2 font-mono text-slate-400 text-[10px]">Apr 15</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Form Controls Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-3 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 text-[11px]">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-slate-300 text-blue-600 focus:ring-0"
                      />
                      <span>Auto-sync</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 text-[11px]">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-blue-600 focus:ring-0"
                      />
                      <span>Telemetry</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-3 py-1 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
                    >
                      Secondary
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 rounded-lg text-xs font-semibold text-white shadow-xs transition-all"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Primary Action
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Floating Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-md p-4 pr-36 sm:pr-44 flex flex-wrap items-center justify-between gap-4 sticky bottom-4 z-20 shadow-xl">
        <div className="flex items-center gap-3">
          <span
            className="size-3.5 rounded-full animate-pulse"
            style={{ backgroundColor: primaryColor }}
          />
          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-900">
              Active Aesthetic:{" "}
              <span className="font-extrabold" style={{ color: primaryColor }}>
                {isCustom ? (customTheme.trim() || "Custom Aesthetic") : selectedTheme?.name}
              </span>
            </p>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Yaduk will manifest full frontend screens, Tailwind styling, and production code in this identity.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs transition-all [&_svg]:pointer-events-none [&_span]:pointer-events-none"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Plan</span>
          </button>
          <button
            type="button"
            onClick={handleProceed}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-sm transition-all cursor-pointer disabled:opacity-50 relative z-10 [&_svg]:pointer-events-none [&_span]:pointer-events-none hover:opacity-90 active:scale-98"
            style={{ backgroundColor: primaryColor }}
          >
            <Wand2 className={`size-4 ${isGenerating ? "animate-spin" : ""}`} />
            <span>
              {isGenerating
                ? "Manifesting Prototype with Yaduk AI..."
                : `Confirm Theme & Continue →`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
