import { useState } from "react";
import JSZip from "jszip";
import { toast } from "sonner";
import {
  Monitor,
  Tablet,
  Smartphone,
  Palette,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  RotateCcw,
  Zap,
  Github,
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  File,
  Terminal,
  Check,
  CheckCircle2,
  Database,
  Server,
  Play,
  Code2,
  Sliders,
  X,
  Copy,
  Layers,
  Box,
  Search,
  Download,
  RefreshCw,
} from "lucide-react";
import type {
  Blueprint,
  ProductionCodebase,
  ProductionManifest,
  PrototypeData,
  PrototypeFile,
  PrototypeScreen,
  StudentProfile,
} from "@/lib/types";
import { generateProductionBatch, generateProductionManifest } from "@/lib/quest.functions";
import { copyToClipboard } from "@/lib/clipboard";
import { SAMPLE_PRODUCTION_CODEBASE } from "@/lib/mock-quest-data";
import { RepoForgeModal } from "./RepoForgeModal";

interface FolderGroup {
  folderPath: string;
  folderName: string;
  files: {
    file: PrototypeFile;
    index: number;
    fileName: string;
    ext: string;
  }[];
}

function groupFilesByFolder(files: PrototypeFile[]): FolderGroup[] {
  const groups: Record<string, FolderGroup> = {};

  files.forEach((file, index) => {
    const parts = file.path.split("/");
    let folderPath = "";
    let folderName = "";
    let fileName = file.path;

    if (parts.length > 1) {
      folderPath = parts.slice(0, -1).join("/");
      folderName = folderPath + "/";
      fileName = parts[parts.length - 1];
    } else {
      folderPath = "root";
      folderName = "root / config/";
      fileName = file.path;
    }

    if (!groups[folderPath]) {
      groups[folderPath] = {
        folderPath,
        folderName,
        files: [],
      };
    }

    const ext = (fileName.split(".").pop() || "").toLowerCase();
    groups[folderPath].files.push({
      file,
      index,
      fileName,
      ext,
    });
  });

  return Object.values(groups);
}

function getFileLanguageInfo(fileName: string, ext: string) {
  if (fileName === "docker-compose.yml" || ext === "dockerfile" || ext === "yml" || ext === "yaml") {
    return { name: "Docker Compose", color: "text-sky-400 bg-sky-950/70 border-sky-800/60" };
  }
  if (ext === "py") {
    return { name: "Python 3.11", color: "text-amber-400 bg-amber-950/70 border-amber-800/60" };
  }
  if (ext === "sql") {
    return { name: "PostgreSQL DDL", color: "text-emerald-400 bg-emerald-950/70 border-emerald-800/60" };
  }
  if (ext === "ts" || ext === "tsx") {
    return { name: ext === "tsx" ? "React TypeScript" : "TypeScript", color: "text-blue-400 bg-blue-950/70 border-blue-800/60" };
  }
  if (ext === "json") {
    return { name: "JSON Manifest", color: "text-yellow-400 bg-yellow-950/70 border-yellow-800/60" };
  }
  if (ext === "md") {
    return { name: "Markdown Docs", color: "text-purple-400 bg-purple-950/70 border-purple-800/60" };
  }
  if (ext === "example" || ext === "env") {
    return { name: "Config / Env", color: "text-teal-400 bg-teal-950/70 border-teal-800/60" };
  }
  return { name: ext.toUpperCase(), color: "text-zinc-400 bg-zinc-900 border-zinc-700" };
}


type DeviceMode = "desktop" | "tablet" | "mobile";

interface ThemeStyleConfig {
  id: string;
  name: string;
  badge: string;
  container: string;
  deviceFrame: string;
  header: string;
  card: string;
  innerCard: string;
  button: string;
  badgeTag: string;
  input: string;
  metricValue: string;
  subtext: string;
  accentText: string;
  activeNavTab: string;
  inactiveNavTab: string;
  browserBg: string;
  browserDotRed: string;
  browserDotYellow: string;
  browserDotGreen: string;
  urlBar: string;
}

const THEME_STYLES: Record<string, ThemeStyleConfig> = {
  "neo-brutalism": {
    id: "neo-brutalism",
    name: "Neo-Brutalism",
    badge: "BRUTALIST VIBES",
    container: "bg-[#fef9c3] text-[#121212] font-sans",
    deviceFrame: "border-4 border-black shadow-[8px_8px_0_0_#000] bg-[#fef08a]",
    header: "border-b-4 border-black bg-[#facc15] text-black",
    card: "rounded-xl border-3 border-black bg-white shadow-[5px_5px_0_0_#000] text-black",
    innerCard: "rounded-lg border-2 border-black bg-[#fef08a]/60 shadow-[2px_2px_0_0_#000] text-black",
    button: "rounded-lg border-3 border-black bg-[#38bdf8] font-black text-black shadow-[3px_3px_0_0_#000] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_0_#000] active:translate-y-[2px] transition-all",
    badgeTag: "border-2 border-black bg-[#a7f3d0] font-mono text-black font-bold px-2 py-0.5 rounded",
    input: "rounded-lg border-3 border-black bg-white focus:bg-[#fef9c3] font-semibold text-black focus:outline-none p-2.5",
    metricValue: "font-display font-black text-black text-3xl",
    subtext: "text-zinc-800 font-medium",
    accentText: "text-black font-black",
    activeNavTab: "bg-black text-white shadow-[2px_2px_0_0_#444] border-2 border-black font-black",
    inactiveNavTab: "border-2 border-black bg-white text-black hover:bg-amber-200 font-bold",
    browserBg: "bg-[#fde047] border-b-4 border-black",
    browserDotRed: "bg-black border border-black",
    browserDotYellow: "bg-white border-2 border-black",
    browserDotGreen: "bg-[#4ade80] border-2 border-black",
    urlBar: "border-2 border-black bg-white text-black font-mono font-bold shadow-[2px_2px_0_0_#000]",
  },
  "cyberpunk": {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    badge: "HUD TELEMETRY",
    container: "bg-[#05050c] text-cyan-100 font-mono",
    deviceFrame: "border-2 border-cyan-500/60 shadow-[0_0_40px_rgba(0,240,255,0.25)] bg-[#070714]",
    header: "border-b border-cyan-500/50 bg-[#090918] text-cyan-300 shadow-[0_4px_20px_rgba(0,240,255,0.15)]",
    card: "rounded-lg border border-cyan-500/40 bg-[#0c0d20]/95 shadow-[0_0_20px_rgba(0,240,255,0.12)] text-cyan-100",
    innerCard: "rounded border border-cyan-500/30 bg-[#12132a]/90 text-cyan-200",
    button: "rounded border border-cyan-400 bg-cyan-500/25 text-cyan-300 font-bold shadow-[0_0_15px_rgba(0,240,255,0.35)] hover:bg-cyan-400 hover:text-black transition-all tracking-wider uppercase",
    badgeTag: "border border-pink-500/60 bg-pink-950/60 text-pink-400 shadow-[0_0_10px_rgba(255,0,128,0.4)] font-mono px-2 py-0.5 rounded",
    input: "rounded border border-cyan-500/50 bg-[#090a18] text-cyan-200 placeholder:text-cyan-700 focus:border-cyan-300 focus:shadow-[0_0_12px_rgba(0,240,255,0.5)] focus:outline-none p-2.5",
    metricValue: "font-mono font-black text-cyan-300 drop-shadow-[0_0_12px_rgba(0,240,255,0.6)] text-3xl",
    subtext: "text-cyan-400/70",
    accentText: "text-cyan-400",
    activeNavTab: "border border-cyan-400 bg-cyan-500/30 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.4)] font-bold",
    inactiveNavTab: "border border-cyan-500/20 bg-[#0c0d1e] text-cyan-500/80 hover:text-cyan-300 hover:border-cyan-500/50",
    browserBg: "bg-[#080816] border-b border-cyan-500/40",
    browserDotRed: "bg-red-500 shadow-[0_0_8px_#ef4444]",
    browserDotYellow: "bg-amber-400 shadow-[0_0_8px_#fbbf24]",
    browserDotGreen: "bg-cyan-400 shadow-[0_0_8px_#22d3ee]",
    urlBar: "border border-cyan-500/40 bg-[#050510] text-cyan-400 font-mono shadow-[inset_0_0_10px_rgba(0,240,255,0.1)]",
  },
  "modern-minimal": {
    id: "modern-minimal",
    name: "Modern Minimal SaaS",
    badge: "CLEAN GEOMETRIC",
    container: "bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans",
    deviceFrame: "border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900",
    header: "border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white backdrop-blur",
    card: "rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-slate-100",
    innerCard: "rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200",
    button: "rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm hover:shadow transition-all",
    badgeTag: "rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold px-2.5 py-0.5",
    input: "rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 focus:outline-none p-2.5",
    metricValue: "font-display font-extrabold text-slate-900 dark:text-white text-3xl",
    subtext: "text-slate-500 dark:text-slate-400",
    accentText: "text-indigo-600 dark:text-indigo-400 font-bold",
    activeNavTab: "bg-indigo-600 text-white shadow-sm font-semibold",
    inactiveNavTab: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
    browserBg: "bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800",
    browserDotRed: "bg-rose-400",
    browserDotYellow: "bg-amber-400",
    browserDotGreen: "bg-emerald-400",
    urlBar: "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono",
  },
  "glassmorphism": {
    id: "glassmorphism",
    name: "Glassmorphism & Aurora",
    badge: "FROSTED AURORA",
    container: "bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-slate-100 font-sans relative overflow-hidden",
    deviceFrame: "border border-white/20 shadow-2xl bg-white/5 backdrop-blur-2xl",
    header: "border-b border-white/15 bg-white/10 backdrop-blur-xl text-white shadow-lg",
    card: "rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-2xl text-white",
    innerCard: "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md text-white/90",
    button: "rounded-2xl border border-white/30 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg hover:shadow-purple-500/30 transition-all",
    badgeTag: "rounded-full border border-pink-400/40 bg-pink-500/20 text-pink-200 backdrop-blur-md font-semibold px-2.5 py-0.5",
    input: "rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/15 focus:outline-none p-2.5",
    metricValue: "font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-white text-3xl",
    subtext: "text-white/70",
    accentText: "text-pink-300 font-bold",
    activeNavTab: "border border-white/30 bg-white/25 text-white shadow-md backdrop-blur font-bold",
    inactiveNavTab: "border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10",
    browserBg: "bg-white/10 backdrop-blur-xl border-b border-white/15",
    browserDotRed: "bg-pink-400 shadow-[0_0_8px_#f472b6]",
    browserDotYellow: "bg-amber-300 shadow-[0_0_8px_#fcd34d]",
    browserDotGreen: "bg-cyan-300 shadow-[0_0_8px_#67e8f9]",
    urlBar: "border border-white/20 bg-white/10 backdrop-blur-md text-white/80 font-mono",
  },
  "warm-editorial": {
    id: "warm-editorial",
    name: "Warm Editorial & Craft",
    badge: "EDITORIAL CRAFT",
    container: "bg-[#faf8f5] text-[#2c2825] font-serif",
    deviceFrame: "border border-[#e4dfd7] shadow-xl bg-[#fdfcfa]",
    header: "border-b border-[#e4dfd7] bg-[#fdfcfa] text-[#1c1917]",
    card: "rounded-xl border border-[#e4dfd7] bg-white shadow-xs text-[#2c2825]",
    innerCard: "rounded-lg border border-[#eee9e2] bg-[#f8f6f2] text-[#44403c]",
    button: "rounded-lg bg-[#b45309] hover:bg-[#92400e] text-white font-serif font-bold shadow-xs transition-all",
    badgeTag: "rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a] font-sans font-medium px-2.5 py-0.5",
    input: "rounded-lg border border-[#d6cfc7] bg-white text-[#2c2825] focus:border-[#b45309] focus:outline-none p-2.5 font-sans",
    metricValue: "font-serif font-bold text-[#1c1917] text-3xl",
    subtext: "text-[#78716c] font-sans",
    accentText: "text-[#b45309] font-bold font-serif",
    activeNavTab: "bg-[#b45309] text-white shadow-xs font-serif",
    inactiveNavTab: "bg-[#f5f0ea] text-[#78716c] hover:text-[#1c1917]",
    browserBg: "bg-[#f5f0ea] border-b border-[#e4dfd7]",
    browserDotRed: "bg-stone-300",
    browserDotYellow: "bg-stone-400",
    browserDotGreen: "bg-stone-500",
    urlBar: "border border-[#e4dfd7] bg-white text-[#57534e] font-mono",
  },
};

function getThemeConfig(themeKey?: string): ThemeStyleConfig {
  if (!themeKey) return THEME_STYLES["modern-minimal"];
  const normalized = themeKey.toLowerCase().replace(/\s+/g, "-");
  if (THEME_STYLES[normalized]) return THEME_STYLES[normalized];

  if (/cyber/.test(normalized)) return THEME_STYLES["cyberpunk"];
  if (/glass/.test(normalized)) return THEME_STYLES["glassmorphism"];
  if (/brutal/.test(normalized)) return THEME_STYLES["neo-brutalism"];
  if (/editorial|craft|warm/.test(normalized)) return THEME_STYLES["warm-editorial"];

  return THEME_STYLES["modern-minimal"];
}

export function PrototypeSandbox({
  prototype,
  blueprint,
  profile,
  onBackToBlueprint,
  onSelectNewTheme,
}: {
  prototype: PrototypeData;
  blueprint: Blueprint;
  profile: StudentProfile | null;
  onBackToBlueprint: () => void;
  onSelectNewTheme?: () => void;
}) {
  const screens = prototype?.screens || [];
  const codeFiles = prototype?.codeFiles || [];
  const runInstructions = prototype?.runInstructions || [];

  const [activeTab, setActiveTab] = useState<"preview" | "code" | "guide" | "production">("preview");
  const [activeScreenId, setActiveScreenId] = useState<string>(
    screens[0]?.id || "dashboard"
  );
  const [activeThemeId, setActiveThemeId] = useState<string>(
    prototype?.theme || "modern-minimal"
  );
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const themeConfig = getThemeConfig(activeThemeId);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copiedFile, setCopiedFile] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isForgeModalOpen, setIsForgeModalOpen] = useState(false);

  // Production Engine State
  const [productionCodebase, setProductionCodebase] = useState<ProductionCodebase | null>(
    prototype?.productionCodebase || SAMPLE_PRODUCTION_CODEBASE
  );
  const [isBuildingProduction, setIsBuildingProduction] = useState(false);
  const [buildingBatchIndex, setBuildingBatchIndex] = useState<number>(-1);
  const [productionStepMsg, setProductionStepMsg] = useState<string>("");
  const [selectedProdFileIndex, setSelectedProdFileIndex] = useState<number>(0);
  const [isProdZipping, setIsProdZipping] = useState(false);
  const [copiedProdFile, setCopiedProdFile] = useState(false);
  const [prodViewMode, setProdViewMode] = useState<"explorer" | "layers" | "contracts">("explorer");
  const [activeContractTab, setActiveContractTab] = useState<"database" | "api" | "env">("database");
  const [fileSearchQuery, setFileSearchQuery] = useState("");
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [newlyGeneratedPath, setNewlyGeneratedPath] = useState<string | null>(null);

  // Telemetry & Explorer State
  const [explorerTab, setExplorerTab] = useState<"screens" | "files" | "layers">("screens");
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(true);

  // Interactive mock form state
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formFeedback, setFormFeedback] = useState<string | null>(null);
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Chart telemetry initialized (Active)`,
    `[${new Date().toLocaleTimeString()}] Fetching project_data (API 200 OK)`,
    `[${new Date().toLocaleTimeString()}] Rendered ${screens[0]?.title || "Dashboard.jsx"} (312ms)`,
  ]);

  const activeScreen: PrototypeScreen | undefined =
    screens.find((s) => s.id === activeScreenId) || screens[0];

  const selectedFile = codeFiles[selectedFileIndex] || codeFiles[0];

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      toast.loading("Preparing starter ZIP package...", { id: "starter-zip" });

      let zip: any;
      try {
        const C: any = typeof JSZip === "function" ? JSZip : (JSZip as any).default || JSZip;
        zip = new C();
      } catch {
        zip = new (JSZip as any)();
      }

      codeFiles.forEach((file) => {
        zip.file(file.path, file.code);
      });

      const readmeContent = `# ${prototype?.title || "Yaduk Project"}
> ${prototype?.tagline || ""}

## Architecture Overview
${prototype?.architectureSummary || ""}

## Recommended Tech Stack
${blueprint?.stack?.map((s) => `- **${s.name}**: ${s.role} (${s.why})`).join("\n") || ""}

## Getting Started
${runInstructions.map((inst, i) => `${i + 1}. ${inst}`).join("\n")}
`;
      zip.file("README.md", readmeContent);

      const blob = await zip.generateAsync({
        type: "blob",
        mimeType: "application/zip",
      });

      const url = window.URL.createObjectURL(blob);
      const sanitizedName = (prototype?.title || "yaduk-prototype")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-");

      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.setAttribute("download", `${sanitizedName}-starter.zip`);
      document.body.appendChild(a);
      a.click();

      window.setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        window.URL.revokeObjectURL(url);
      }, 4000);

      toast.success("Starter ZIP downloaded! Check your downloads folder.", { id: "starter-zip" });
    } catch (err) {
      console.error("Failed to create ZIP package:", err);
      toast.error(
        "Failed to create ZIP package: " + (err instanceof Error ? err.message : String(err)),
        { id: "starter-zip" },
      );
    } finally {
      setIsZipping(false);
    }
  };

  const handleCopyCode = async () => {
    if (!selectedFile) return;
    const ok = await copyToClipboard(selectedFile.code);
    if (ok) {
      setCopiedFile(true);
      toast.success(`Copied ${selectedFile.path} to clipboard!`);
      setTimeout(() => setCopiedFile(false), 2000);
    } else {
      toast.error("Failed to copy code to clipboard.");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeScreen?.inputForm) {
      const msg = activeScreen.inputForm.successMessage || "Action simulated successfully (200 OK)";
      setFormFeedback(msg);
      toast.success("Simulation update: " + msg);
      const logEntry = `[${new Date().toLocaleTimeString()}] Form submitted: ${JSON.stringify(formValues)}`;
      setSimulatedLogs((prev) => [logEntry, ...prev.slice(0, 7)]);
    }
  };

  const handleActionClick = (mockResponse: string, label: string) => {
    toast.success(`Triggered "${label}"!`);
    const logEntry = `[${new Date().toLocaleTimeString()}] Triggered "${label}": ${mockResponse}`;
    setSimulatedLogs((prev) => [logEntry, ...prev.slice(0, 7)]);
  };

  const handleStartProductionBuild = async () => {
    const effectiveProfile: StudentProfile = profile || {
      name: "Student Developer",
      fieldOfStudy: "Computer Science & Engineering",
      yearOfStudy: "Final Year",
      skills: ["Full Stack", "TypeScript", "Python"],
      careerRole: "Full Stack Developer",
      hoursPerWeek: 15,
      riskTolerance: "Medium",
    };

    setIsBuildingProduction(true);
    setBuildingBatchIndex(0);
    setProdViewMode("explorer");
    setProductionStepMsg("Initializing Architecture Contract & Topological Manifest...");

    const addLog = (msg: string) => {
      const entry = `[${new Date().toLocaleTimeString()}] ${msg}`;
      setSimulatedLogs((prev) => [entry, ...prev.slice(0, 15)]);
    };

    addLog("🚀 Starting Yaduk Production Grade Engine assembly...");

    try {
      let manifest: ProductionManifest;
      try {
        const manifestRes = await generateProductionManifest({
          data: {
            prototype,
            blueprint,
            profile: effectiveProfile,
          } as any,
        });
        manifest = manifestRes.manifest;
      } catch (manifestErr) {
        console.warn("Server manifest generator failed, using standard template contract:", manifestErr);
        manifest = SAMPLE_PRODUCTION_CODEBASE.manifest;
      }

      addLog(`📜 Manifest confirmed: ${manifest.batches.length} topological layers queued.`);
      setProductionStepMsg(`Manifest ready! Assembling ${manifest.batches.length} topological layers...`);

      let accumulatedFiles: PrototypeFile[] = [];
      const completedBatchIds: string[] = [];

      for (let i = 0; i < manifest.batches.length; i++) {
        const batch = manifest.batches[i];
        setBuildingBatchIndex(i);
        setProductionStepMsg(`Compiling Layer ${i + 1}/${manifest.batches.length}: ${batch.layerName}...`);
        addLog(`🔨 Compiling Layer ${i + 1}: ${batch.layerName}...`);

        let batchFiles: PrototypeFile[] = [];

        try {
          const batchRes = await generateProductionBatch({
            data: {
              batch,
              manifestContract: {
                databaseContract: manifest.databaseContract,
                apiContract: manifest.apiContract,
                envContract: manifest.envContract,
              },
              blueprint: blueprint || {
                title: prototype?.title || "Production App",
                tagline: prototype?.tagline || "",
                problem: "",
                solution: "",
                keyFeatures: [],
                stack: [],
                milestones: [],
                risks: [],
              },
              profile: effectiveProfile,
            } as any,
          });
          batchFiles = batchRes.files || [];
        } catch (batchErr) {
          console.warn(`Server batch call failed for ${batch.id}, using pre-configured production files:`, batchErr);
          const targetPaths = new Set(batch.targetFiles.map((t) => t.path));
          batchFiles = SAMPLE_PRODUCTION_CODEBASE.files.filter((f) => targetPaths.has(f.path));
          if (batchFiles.length === 0) {
            batchFiles = batch.targetFiles.map((t) => ({
              path: t.path,
              language: t.language,
              description: t.purpose,
              code: `// ${t.path}\n// ${t.purpose}\n// Generated by Yaduk Production Engine`,
            }));
          }
          await new Promise((r) => setTimeout(r, 450));
        }

        // Incrementally append each file so it appears dynamically in the folder explorer and code viewer
        for (const file of batchFiles) {
          accumulatedFiles = [...accumulatedFiles, file];
          const newIdx = accumulatedFiles.length - 1;
          setSelectedProdFileIndex(newIdx);
          setNewlyGeneratedPath(file.path);
          addLog(`📄 Generated ${file.path} (${file.code.split("\n").length} lines)`);

          setProductionCodebase({
            manifest,
            files: accumulatedFiles,
            completedBatchIds: [...completedBatchIds, batch.id],
            isGenerating: true,
            currentBatchIndex: i,
          });

          await new Promise((r) => setTimeout(r, 220));
        }

        completedBatchIds.push(batch.id);
      }

      setProductionCodebase({
        manifest,
        files: accumulatedFiles,
        completedBatchIds,
        isGenerating: false,
      });

      setProductionStepMsg(`Production Codebase complete (${accumulatedFiles.length} files generated)`);
      toast.success(`Production codebase assembled! All ${accumulatedFiles.length} files ready.`);
      addLog(`🎉 Assembled ${accumulatedFiles.length} production files across all 5 layers!`);
      setTimeout(() => setNewlyGeneratedPath(null), 3000);
    } catch (err) {
      console.error("Production compilation error:", err);
      toast.error("Failed to compile production codebase: " + String(err));
    } finally {
      setIsBuildingProduction(false);
      setBuildingBatchIndex(-1);
    }
  };

  const handleDownloadSingleFile = (file: PrototypeFile) => {
    const blob = new Blob([file.code], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.setAttribute("download", file.path.split("/").pop() || "file.txt");
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`Downloaded ${file.path.split("/").pop()}`);
  };

  const handleDownloadProductionZip = async () => {
    if (!productionCodebase || productionCodebase.files.length === 0) return;
    setIsProdZipping(true);
    toast.loading("Zipping production repository...", { id: "prod-zip" });
    try {
      let zip: any;
      try {
        const C: any = typeof JSZip === "function" ? JSZip : (JSZip as any).default || JSZip;
        zip = new C();
      } catch {
        zip = new (JSZip as any)();
      }

      productionCodebase.files.forEach((file) => {
        zip.file(file.path, file.code);
      });

      zip.file("schema.sql", productionCodebase.manifest.databaseContract);
      zip.file(".env.example", productionCodebase.manifest.envContract.join("\n"));

      const blob = await zip.generateAsync({ type: "blob", mimeType: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.setAttribute("download", `${(prototype?.title || "yaduk").toLowerCase().replace(/\s+/g, "-")}-production.zip`);
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Production repository downloaded!", { id: "prod-zip" });
    } catch (err) {
      toast.error("ZIP creation failed.", { id: "prod-zip" });
    } finally {
      setIsProdZipping(false);
    }
  };

  const handleCopyProdCode = async (code: string) => {
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopiedProdFile(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedProdFile(false), 2000);
    } else {
      toast.error("Failed to copy code to clipboard.");
    }
  };

  const stackItems = (blueprint?.stack || []).map((s: any) => (typeof s === "string" ? s : s?.name)).filter(Boolean);

  return (
    <div className="space-y-5">
      {/* 1. TOP DEVELOPER WORKSPACE TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        {/* Left: Status & Tech Stack */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Production Build</span>
          </span>

          <div className="hidden sm:flex items-center gap-1.5">
            {stackItems.slice(0, 3).map((tech: string) => (
              <span
                key={tech}
                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-mono font-semibold text-slate-700"
              >
                {tech}
              </span>
            ))}
          </div>

          <span className="text-xs text-slate-400 hidden md:inline">
            · {prototype.title}
          </span>
        </div>

        {/* Center: Device Viewport Controls */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setDeviceMode("desktop")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              deviceMode === "desktop"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
            title="Desktop Viewport"
          >
            <Monitor className="size-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode("tablet")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              deviceMode === "tablet"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
            title="Tablet Viewport"
          >
            <Tablet className="size-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode("mobile")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              deviceMode === "mobile"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
            title="Mobile Viewport"
          >
            <Smartphone className="size-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Right: Actions Cluster */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onBackToBlueprint}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            <span>← Back to Plan</span>
          </button>
          <button
            type="button"
            onClick={() => void handleDownloadZip()}
            disabled={isZipping}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Box className="size-3.5 text-blue-600" />
            <span>{isZipping ? "Packaging..." : "Download ZIP"}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsForgeModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-900 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs cursor-pointer"
          >
            <Github className="size-3.5" />
            <span>Export GitHub</span>
          </button>
          <button
            type="button"
            onClick={() => setIsForgeModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:from-amber-600 hover:to-orange-600 cursor-pointer"
          >
            <Zap className="size-3.5 text-yellow-100" />
            <span>StackBlitz</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE SPLIT: Explorer (Left) & Live Canvas / Hub (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Interactive Architecture & File Tree Explorer */}
        <div className="lg:col-span-4 space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3.5">
            {/* Sidebar Header & Sub-tab navigation */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Architecture & Explorer
                </h3>
                <p className="text-[11px] text-slate-500">Live navigation & code mapping</p>
              </div>
              <span className="font-mono text-[10px] rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">
                {screens.length} Screens
              </span>
            </div>

            {/* Segmented Explorer Filter */}
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 text-[11px] font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setExplorerTab("screens")}
                className={`py-1 rounded-lg text-center transition-all cursor-pointer ${
                  explorerTab === "screens" ? "bg-white text-slate-900 shadow-xs font-bold" : "hover:text-slate-900"
                }`}
              >
                Screens
              </button>
              <button
                type="button"
                onClick={() => {
                  setExplorerTab("files");
                  setActiveTab("code");
                }}
                className={`py-1 rounded-lg text-center transition-all cursor-pointer ${
                  explorerTab === "files" ? "bg-white text-slate-900 shadow-xs font-bold" : "hover:text-slate-900"
                }`}
              >
                Files ({codeFiles.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setExplorerTab("layers");
                  setActiveTab("production");
                }}
                className={`py-1 rounded-lg text-center transition-all cursor-pointer ${
                  explorerTab === "layers" ? "bg-white text-slate-900 shadow-xs font-bold" : "hover:text-slate-900"
                }`}
              >
                Engine
              </button>
            </div>

            {/* Tree View Body */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 font-mono text-xs space-y-1 max-h-[500px] overflow-y-auto">
              {/* Folder: app/ */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold py-1 px-1.5">
                  <FolderOpen className="size-3.5 text-blue-600" />
                  <span>app/</span>
                </div>

                {/* Subfolder: screens/ */}
                <div className="pl-4 space-y-0.5 border-l border-slate-200 ml-2">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] py-0.5 px-1.5">
                    <Folder className="size-3 text-slate-400" />
                    <span>screens/</span>
                  </div>

                  {screens.map((s) => {
                    const isCur = activeScreenId === s.id && activeTab === "preview";
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setActiveScreenId(s.id);
                          setActiveTab("preview");
                          setFormFeedback(null);
                        }}
                        className={`w-full text-left flex items-center justify-between gap-1.5 rounded-lg py-1 px-2 text-[11px] transition-all cursor-pointer ${
                          isCur
                            ? "bg-blue-600 text-white font-bold shadow-xs"
                            : "text-slate-700 hover:bg-slate-200/60"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <FileCode className="size-3 shrink-0" />
                          <span className="truncate">{s.title}.tsx</span>
                        </div>
                        {isCur && (
                          <span className="size-1.5 rounded-full bg-white shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Subfolder: components/ */}
                <div className="pl-4 space-y-0.5 border-l border-slate-200 ml-2">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] py-0.5 px-1.5">
                    <Folder className="size-3 text-slate-400" />
                    <span>components/</span>
                  </div>
                  <div className="text-[11px] text-slate-600 py-0.5 px-2 flex items-center gap-1.5">
                    <FileCode className="size-3 text-slate-400" />
                    <span>InputForm.tsx</span>
                  </div>
                  <div className="text-[11px] text-slate-600 py-0.5 px-2 flex items-center gap-1.5">
                    <FileCode className="size-3 text-slate-400" />
                    <span>TelemetryMetrics.tsx</span>
                  </div>
                </div>
              </div>

              {/* Folder: api/ */}
              <div className="space-y-0.5 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("code")}
                  className="w-full text-left flex items-center gap-1.5 text-slate-700 font-bold py-1 px-1.5 hover:bg-slate-200/60 rounded-lg cursor-pointer"
                >
                  <Folder className="size-3.5 text-emerald-600" />
                  <span>api/</span>
                  <span className="text-[10px] text-slate-400 font-normal ml-auto">FastAPI</span>
                </button>
                <div className="pl-4 space-y-0.5 border-l border-slate-200 ml-2 text-[11px] text-slate-600">
                  <div className="py-0.5 px-2 flex items-center gap-1.5">
                    <FileCode className="size-3 text-slate-400" />
                    <span>main.py</span>
                  </div>
                  <div className="py-0.5 px-2 flex items-center gap-1.5">
                    <FileCode className="size-3 text-slate-400" />
                    <span>endpoints.py</span>
                  </div>
                </div>
              </div>

              {/* Folder: database/ */}
              <div className="space-y-0.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("production");
                    setProdViewMode("contract");
                  }}
                  className="w-full text-left flex items-center gap-1.5 text-slate-700 font-bold py-1 px-1.5 hover:bg-slate-200/60 rounded-lg cursor-pointer"
                >
                  <Database className="size-3.5 text-amber-600" />
                  <span>database/</span>
                  <span className="text-[10px] text-slate-400 font-normal ml-auto">PostgreSQL</span>
                </button>
                <div className="pl-4 space-y-0.5 border-l border-slate-200 ml-2 text-[11px] text-slate-600">
                  <div className="py-0.5 px-2 flex items-center gap-1.5">
                    <FileCode className="size-3 text-slate-400" />
                    <span>schema.sql</span>
                  </div>
                </div>
              </div>

              {/* Folder: config/ */}
              <div className="space-y-0.5 pt-1">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold py-1 px-1.5">
                  <Box className="size-3.5 text-purple-600" />
                  <span>config/</span>
                </div>
                <div className="pl-4 space-y-0.5 border-l border-slate-200 ml-2 text-[11px] text-slate-600">
                  <div className="py-0.5 px-2 flex items-center gap-1.5">
                    <FileCode className="size-3 text-slate-400" />
                    <span>docker-compose.yml</span>
                  </div>
                  <div className="py-0.5 px-2 flex items-center gap-1.5">
                    <FileCode className="size-3 text-slate-400" />
                    <span>package.json</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Mode Switcher + Live App Canvas / Code / Hub */}
        <div className="lg:col-span-8 space-y-4">
          {/* Main Navigation Mode Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "preview"
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>🖥️</span>
                <span>Live Workspace</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("code")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "code"
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>💻</span>
                <span>Code Explorer</span>
                <span className="rounded-full bg-slate-100 text-slate-700 px-1.5 py-0.2 text-[10px] font-mono">
                  {codeFiles.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("production")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "production"
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>⚡</span>
                <span>Production Hub</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("guide")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "guide"
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>🚀</span>
                <span>Setup Guide</span>
              </button>
            </div>

            {/* Quick Theme Switcher */}
            {onSelectNewTheme && (
              <button
                type="button"
                onClick={onSelectNewTheme}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
              >
                <Palette className="size-3" />
                <span>Change Theme</span>
              </button>
            )}
          </div>

          {/* TAB 1: LIVE WORKSPACE CANVAS */}
          {activeTab === "preview" && (
            <div className="space-y-4">
              <div
                className={`mx-auto transition-all duration-300 ${
                  deviceMode === "mobile"
                    ? "max-w-[420px] p-3 rounded-[40px] border-8 border-slate-900 bg-slate-950 shadow-2xl"
                    : deviceMode === "tablet"
                    ? "max-w-2xl rounded-2xl border-4 border-slate-800 shadow-xl overflow-hidden"
                    : "w-full rounded-2xl overflow-hidden shadow-xl"
                }`}
              >
                {/* Browser Frame Window */}
                <div className={`overflow-hidden transition-all ${themeConfig.deviceFrame}`}>
                  {/* Browser Chrome Bar */}
                  <div
                    className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 ${themeConfig.browserBg}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className={`size-2.5 rounded-full ${themeConfig.browserDotRed}`} />
                        <div className={`size-2.5 rounded-full ${themeConfig.browserDotYellow}`} />
                        <div className={`size-2.5 rounded-full ${themeConfig.browserDotGreen}`} />
                      </div>
                      <div
                        className={`ml-2 flex items-center gap-2 rounded-md px-2.5 py-0.5 text-[11px] ${themeConfig.urlBar}`}
                      >
                        <span className="text-emerald-500">🔒</span>
                        <span className="truncate max-w-[160px] sm:max-w-none">
                          https://app.yaduk.live/{activeScreen?.id}
                        </span>
                      </div>
                    </div>

                    {/* In-App Screen Navigation Tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto">
                      {screens.map((screen) => (
                        <button
                          key={screen.id}
                          onClick={() => {
                            setActiveScreenId(screen.id);
                            setFormFeedback(null);
                          }}
                          className={`rounded-lg px-2.5 py-0.5 text-[11px] transition-all cursor-pointer ${
                            activeScreenId === screen.id
                              ? themeConfig.activeNavTab
                              : themeConfig.inactiveNavTab
                          }`}
                        >
                          {screen.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Screen Mockup Content */}
                  {activeScreen && (
                    <div className={`p-5 sm:p-7 space-y-6 ${themeConfig.container}`}>
                      {/* Screen Header */}
                      <div className="space-y-1">
                        <span className={`text-[10px] font-mono font-bold ${themeConfig.badgeTag}`}>
                          {activeScreen.title.toUpperCase()} VIEW
                        </span>
                        <h3 className="text-2xl font-black font-display">{activeScreen.title}</h3>
                        <p className={`text-xs ${themeConfig.subtext}`}>{activeScreen.description}</p>
                      </div>

                      {/* Screen Metrics Grid */}
                      {activeScreen.metrics && activeScreen.metrics.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {activeScreen.metrics.map((metric, i) => (
                            <div key={metric.label + i} className={`p-4 ${themeConfig.card}`}>
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] uppercase font-bold ${themeConfig.subtext}`}>
                                  {metric.label}
                                </span>
                                {metric.badge && (
                                  <span className={`text-[10px] font-bold ${themeConfig.badgeTag}`}>
                                    {metric.badge}
                                  </span>
                                )}
                              </div>
                              <p className={`mt-1.5 ${themeConfig.metricValue}`}>{metric.value}</p>
                              {metric.subtext && (
                                <p className={`mt-0.5 text-[10px] ${themeConfig.subtext}`}>
                                  {metric.subtext}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Interactive Form & Simulation Triggers */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Input Form Simulator */}
                        {activeScreen.inputForm ? (
                          <div className={`p-5 space-y-4 ${themeConfig.card}`}>
                            <div>
                              <h4 className={`text-base font-bold ${themeConfig.accentText}`}>
                                {activeScreen.inputForm.title}
                              </h4>
                              <p className={`text-xs ${themeConfig.subtext}`}>
                                {activeScreen.inputForm.description}
                              </p>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-3">
                              {activeScreen.inputForm.fields.map((field) => (
                                <div key={field.name} className="space-y-1">
                                  <label className={`text-xs font-semibold ${themeConfig.subtext}`}>
                                    {field.label}
                                  </label>
                                  {field.type === "textarea" ? (
                                    <textarea
                                      rows={2}
                                      value={formValues[field.name] || ""}
                                      onChange={(e) =>
                                        setFormValues({ ...formValues, [field.name]: e.target.value })
                                      }
                                      placeholder={field.placeholder}
                                      className={`w-full text-xs ${themeConfig.input}`}
                                    />
                                  ) : (
                                    <input
                                      type={field.type}
                                      value={formValues[field.name] || ""}
                                      onChange={(e) =>
                                        setFormValues({ ...formValues, [field.name]: e.target.value })
                                      }
                                      placeholder={field.placeholder}
                                      className={`w-full text-xs ${themeConfig.input}`}
                                    />
                                  )}
                                </div>
                              ))}

                              <button
                                type="submit"
                                className={`w-full py-2 text-xs font-bold ${themeConfig.button} cursor-pointer`}
                              >
                                {activeScreen.inputForm.submitLabel}
                              </button>
                            </form>

                            {formFeedback && (
                              <div className={`p-3 text-xs rounded-lg border ${themeConfig.innerCard}`}>
                                <p className="font-bold flex items-center gap-1.5 text-emerald-600">
                                  <span>✓</span> State Updated Successfully
                                </p>
                                <p className="mt-1 opacity-90">{formFeedback}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className={`p-5 space-y-4 ${themeConfig.card}`}>
                            <h4 className={`text-base font-bold ${themeConfig.accentText}`}>
                              Interactive Simulation Triggers
                            </h4>
                            <p className={`text-xs ${themeConfig.subtext}`}>
                              Simulate async operations, analytics feeds, and mock state transitions.
                            </p>
                            {activeScreen.actions && activeScreen.actions.length > 0 ? (
                              <div className="space-y-2">
                                {activeScreen.actions.map((act) => (
                                  <div
                                    key={act.id}
                                    className={`flex items-center justify-between p-2.5 transition-all ${themeConfig.innerCard}`}
                                  >
                                    <div>
                                      <p className="text-xs font-bold">{act.label}</p>
                                      <p className={`text-[11px] ${themeConfig.subtext}`}>{act.description}</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleActionClick(act.mockResponse, act.label)}
                                      className={`text-xs px-2.5 py-1 ${themeConfig.button} cursor-pointer`}
                                    >
                                      Run
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className={`text-xs italic ${themeConfig.subtext}`}>
                                No triggers configured for this screen.
                              </p>
                            )}
                          </div>
                        )}

                        {/* Sample Activity Feeds */}
                        <div className="space-y-3">
                          {activeScreen.sampleItems && activeScreen.sampleItems.length > 0 && (
                            <div className={`p-5 space-y-3 ${themeConfig.card}`}>
                              <h4 className={`text-base font-bold ${themeConfig.accentText}`}>
                                Live Telemetry Stream
                              </h4>
                              <div className="space-y-2">
                                {activeScreen.sampleItems.map((item, idx) => (
                                  <div
                                    key={item.title + idx}
                                    className={`flex items-start justify-between p-2.5 text-xs ${themeConfig.innerCard}`}
                                  >
                                    <div className="space-y-0.5">
                                      <p className="font-bold text-xs">{item.title}</p>
                                      <p className={`text-[11px] ${themeConfig.subtext}`}>{item.detail}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className={`text-[9px] font-bold ${themeConfig.badgeTag}`}>
                                        {item.category}
                                      </span>
                                      <p className={`text-[9px] mt-1 font-mono ${themeConfig.subtext}`}>
                                        {item.status}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CODEBASE EXPLORER */}
          {activeTab === "code" && (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="grid lg:grid-cols-12 min-h-[500px]">
                {/* File list sub-pane */}
                <div className="lg:col-span-4 border-r border-slate-200 bg-slate-50 p-4 space-y-2">
                  <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    PROJECT FILES ({codeFiles.length})
                  </span>
                  <div className="space-y-1">
                    {codeFiles.map((f, i) => (
                      <button
                        key={f.path}
                        onClick={() => {
                          setSelectedFileIndex(i);
                          setCopiedFile(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left font-mono text-xs transition-all cursor-pointer ${
                          selectedFileIndex === i
                            ? "bg-blue-600 text-white font-bold shadow-xs"
                            : "hover:bg-slate-200/70 text-slate-700"
                        }`}
                      >
                        <span className="truncate">{f.path}</span>
                        <span className="text-[10px] opacity-75">{f.language}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Code display */}
                <div className="lg:col-span-8 flex flex-col bg-zinc-950 text-zinc-100">
                  {selectedFile && (
                    <>
                      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs">
                        <span className="font-mono font-bold text-emerald-400">
                          {selectedFile.path}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs text-zinc-200 hover:bg-zinc-700 cursor-pointer shadow-xs"
                        >
                          <Copy className="size-3" />
                          <span>{copiedFile ? "Copied!" : "Copy"}</span>
                        </button>
                      </div>
                      <div className="flex-1 p-4 font-mono text-xs overflow-x-auto leading-relaxed max-h-[520px]">
                        <pre className="whitespace-pre">
                          <code>{selectedFile.code}</code>
                        </pre>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTION HUB - MULTI-FOLDER VISUAL WORKSPACE */}
          {activeTab === "production" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
                {/* 1. Header Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-display text-lg font-bold text-slate-900">
                        Full-Stack Production Repository
                      </h3>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                        <span
                          className={`size-1.5 rounded-full ${
                            isBuildingProduction
                              ? "bg-amber-500 animate-ping"
                              : "bg-emerald-500 animate-pulse"
                          }`}
                        />
                        <span>{isBuildingProduction ? "Compiling Layers..." : "Production Ready"}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Topological multi-layer assembly with live folder hierarchy, real-time code inspector & architectural contracts.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleStartProductionBuild}
                      disabled={isBuildingProduction}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 cursor-pointer transition-all"
                    >
                      {isBuildingProduction ? (
                        <RefreshCw className="size-3.5 animate-spin text-white" />
                      ) : (
                        <Zap className="size-3.5 text-amber-300" />
                      )}
                      <span>{isBuildingProduction ? "Compiling Codebase..." : "Manifest & Build"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsForgeModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 px-3.5 py-2 text-xs font-bold text-blue-700 shadow-xs hover:bg-blue-100 transition-all cursor-pointer"
                    >
                      <Github className="size-3.5 text-blue-700" />
                      <span>Forge GitHub / StackBlitz</span>
                    </button>

                    {productionCodebase && productionCodebase.files.length > 0 && (
                      <button
                        type="button"
                        onClick={handleDownloadProductionZip}
                        disabled={isProdZipping}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-all cursor-pointer"
                      >
                        <Download className="size-3.5 text-slate-600" />
                        <span>Download ZIP</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Live Progressive Generation HUD Banner */}
                {isBuildingProduction && (
                  <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/80 via-emerald-50/60 to-blue-50/80 p-4 space-y-3 animate-in fade-in duration-300">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="grid size-7 place-items-center rounded-xl bg-emerald-600 text-white shadow-xs">
                          <Zap className="size-4 animate-pulse text-amber-200" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span>Layer {buildingBatchIndex + 1} of 5 In Progress:</span>
                            <span className="text-emerald-700 font-mono">
                              {productionCodebase?.manifest.batches[buildingBatchIndex]?.layerName || "Architectural Layer"}
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {productionStepMsg}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-700">
                          {productionCodebase?.files.length || 0} Files Materialized
                        </span>
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 transition-all duration-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(15, ((buildingBatchIndex + 1) / 5) * 100))}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* 3. Sub-View Nav Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setProdViewMode("explorer")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        prodViewMode === "explorer"
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <FolderOpen className="size-3.5" />
                      <span>Code & Folder Hierarchy</span>
                      <span className="ml-1 rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] text-emerald-300">
                        {productionCodebase?.files.length || 0}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setProdViewMode("layers")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        prodViewMode === "layers"
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Layers className="size-3.5" />
                      <span>Architectural Layers</span>
                      <span className="ml-1 rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] text-slate-700">
                        5
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setProdViewMode("contracts")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        prodViewMode === "contracts"
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Database className="size-3.5" />
                      <span>Contracts & DDL</span>
                    </button>
                  </div>

                  {/* Quick Summary Pill */}
                  <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                    <span>Stack: PostgreSQL • FastAPI • React 18 • Docker</span>
                  </div>
                </div>

                {/* 4. MAIN VIEW: CODE & FOLDER EXPLORER */}
                {prodViewMode === "explorer" && (
                  <div className="grid lg:grid-cols-12 rounded-2xl border border-slate-200 overflow-hidden min-h-[520px] shadow-xs">
                    {/* LEFT COLUMN: FOLDER & FILE EXPLORER */}
                    <div className="lg:col-span-4 border-r border-slate-200 bg-slate-50/80 flex flex-col">
                      {/* Search / Filter Header */}
                      <div className="p-3 border-b border-slate-200/80 bg-white/60 space-y-2">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-400" />
                          <input
                            type="text"
                            value={fileSearchQuery}
                            onChange={(e) => setFileSearchQuery(e.target.value)}
                            placeholder="Filter files across folders..."
                            className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider px-0.5">
                          <span>EXPLORER TREE</span>
                          <span>{productionCodebase?.files.length || 0} FILES</span>
                        </div>
                      </div>

                      {/* Folder Tree List */}
                      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[520px]">
                        {(() => {
                          const allFiles = productionCodebase?.files || [];
                          const filteredFiles = fileSearchQuery.trim()
                            ? allFiles.filter((f) =>
                                f.path.toLowerCase().includes(fileSearchQuery.toLowerCase())
                              )
                            : allFiles;

                          const groups = groupFilesByFolder(filteredFiles);

                          if (groups.length === 0) {
                            return (
                              <div className="p-6 text-center text-xs text-slate-400">
                                {isBuildingProduction
                                  ? "Materializing folders & files..."
                                  : "No files found matching search."}
                              </div>
                            );
                          }

                          return groups.map((group) => {
                            const isCollapsed = Boolean(collapsedFolders[group.folderPath]);
                            return (
                              <div key={group.folderPath} className="space-y-1">
                                {/* Folder Header Row */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCollapsedFolders((prev) => ({
                                      ...prev,
                                      [group.folderPath]: !prev[group.folderPath],
                                    }))
                                  }
                                  className="w-full flex items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer select-none group"
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    {isCollapsed ? (
                                      <ChevronRight className="size-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                                    ) : (
                                      <ChevronDown className="size-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                                    )}
                                    {isCollapsed ? (
                                      <Folder className="size-4 text-amber-500 shrink-0" />
                                    ) : (
                                      <FolderOpen className="size-4 text-amber-500 shrink-0" />
                                    )}
                                    <span className="truncate font-mono text-[11px] text-slate-800">
                                      {group.folderName}
                                    </span>
                                  </div>
                                  <span className="rounded-md bg-slate-200/80 px-1.5 py-0.5 text-[9px] font-mono text-slate-600">
                                    {group.files.length}
                                  </span>
                                </button>

                                {/* Files in this Folder */}
                                {!isCollapsed && (
                                  <div className="pl-4 space-y-0.5 border-l-2 border-slate-200/60 ml-2.5">
                                    {group.files.map((item) => {
                                      const isSelected = selectedProdFileIndex === item.index;
                                      const isJustGenerated = newlyGeneratedPath === item.file.path;
                                      const lang = getFileLanguageInfo(item.fileName, item.ext);

                                      return (
                                        <button
                                          key={item.file.path}
                                          type="button"
                                          onClick={() => setSelectedProdFileIndex(item.index)}
                                          className={`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-left font-mono text-xs transition-all cursor-pointer ${
                                            isSelected
                                              ? "bg-blue-600 text-white font-bold shadow-xs"
                                              : isJustGenerated
                                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300 animate-pulse"
                                              : "text-slate-700 hover:bg-slate-200/60"
                                          }`}
                                        >
                                          <div className="flex items-center gap-1.5 min-w-0">
                                            <FileCode className={`size-3.5 shrink-0 ${isSelected ? "text-white" : "text-slate-400"}`} />
                                            <span className="truncate text-[11px]">
                                              {item.fileName}
                                            </span>
                                          </div>

                                          <div className="flex items-center gap-1 shrink-0 ml-1">
                                            {isJustGenerated && (
                                              <span className="rounded bg-emerald-500 px-1 py-0.2 text-[8px] font-bold text-white uppercase">
                                                NEW
                                              </span>
                                            )}
                                            <span
                                              className={`rounded px-1.5 py-0.2 text-[9px] font-mono border ${
                                                isSelected
                                                  ? "bg-blue-700/80 text-blue-100 border-blue-500"
                                                  : lang.color
                                              }`}
                                            >
                                              {item.ext.toUpperCase() || "FILE"}
                                            </span>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* RIGHT COLUMN: LIVE CODE INSPECTOR ON SCREEN */}
                    <div className="lg:col-span-8 flex flex-col bg-zinc-950 text-zinc-100">
                      {(() => {
                        const file = productionCodebase?.files[selectedProdFileIndex] || productionCodebase?.files[0];
                        if (!file) {
                          return (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-zinc-500 space-y-2">
                              <Code2 className="size-8 text-zinc-600" />
                              <p className="text-xs">No file selected. Click "Manifest & Build" to generate the codebase.</p>
                            </div>
                          );
                        }

                        const ext = (file.path.split(".").pop() || "").toLowerCase();
                        const fileName = file.path.split("/").pop() || file.path;
                        const langInfo = getFileLanguageInfo(fileName, ext);
                        const lines = file.code.split("\n");

                        return (
                          <>
                            {/* Code Header Bar */}
                            <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2.5 gap-2 text-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-mono text-emerald-400 font-bold text-xs truncate">
                                  {file.path}
                                </span>
                                <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono border ${langInfo.color}`}>
                                  {langInfo.name}
                                </span>
                                <span className="text-zinc-500 font-mono text-[10px] hidden sm:inline">
                                  {lines.length} lines • {(file.code.length / 1024).toFixed(1)} KB
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleCopyProdCode(file.code)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs text-zinc-200 hover:bg-zinc-700 cursor-pointer shadow-xs transition-all"
                                >
                                  {copiedProdFile ? (
                                    <>
                                      <Check className="size-3 text-emerald-400" />
                                      <span className="text-emerald-400 font-bold">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="size-3 text-zinc-400" />
                                      <span>Copy Code</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDownloadSingleFile(file)}
                                  title="Download this file"
                                  className="grid size-7 place-items-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 cursor-pointer transition-all"
                                >
                                  <Download className="size-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Code Editor Body with Line Numbers */}
                            <div className="flex-1 overflow-x-auto max-h-[520px] font-mono text-xs flex">
                              {/* Line Numbers Gutter */}
                              <div className="select-none py-3 px-3 text-right bg-zinc-950/80 border-r border-zinc-800/60 text-zinc-600 min-w-[42px] leading-relaxed">
                                {lines.map((_, idx) => (
                                  <div key={idx}>{idx + 1}</div>
                                ))}
                              </div>

                              {/* Code lines */}
                              <pre className="p-3 text-zinc-100 leading-relaxed overflow-x-auto flex-1 whitespace-pre">
                                <code>{file.code}</code>
                              </pre>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* 5. ARCHITECTURAL LAYERS VIEW */}
                {prodViewMode === "layers" && (
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {(productionCodebase?.manifest.batches || []).map((batch, index) => {
                        const isCompleted = productionCodebase?.completedBatchIds.includes(batch.id);
                        const isCurrent = isBuildingProduction && buildingBatchIndex === index;

                        return (
                          <div
                            key={batch.id}
                            className={`rounded-xl border p-4 space-y-2.5 transition-all ${
                              isCurrent
                                ? "border-amber-400 bg-amber-50/50 shadow-md ring-2 ring-amber-300/50"
                                : isCompleted
                                ? "border-emerald-200 bg-emerald-50/30"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                                Layer {index + 1}
                              </span>
                              {isCompleted ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                  <Check className="size-3" />
                                  <span>Completed</span>
                                </span>
                              ) : isCurrent ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 animate-pulse">
                                  <RefreshCw className="size-3 animate-spin" />
                                  <span>Compiling</span>
                                </span>
                              ) : (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                  Queued
                                </span>
                              )}
                            </div>

                            <h4 className="font-display text-sm font-bold text-slate-900">
                              {batch.layerName}
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {batch.description}
                            </p>

                            <div className="border-t border-slate-100 pt-2 space-y-1">
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                                Target Files ({batch.targetFiles.length})
                              </span>
                              {batch.targetFiles.map((target) => (
                                <div
                                  key={target.path}
                                  onClick={() => {
                                    const matchIdx = productionCodebase?.files.findIndex(
                                      (f) => f.path === target.path
                                    );
                                    if (matchIdx !== undefined && matchIdx >= 0) {
                                      setSelectedProdFileIndex(matchIdx);
                                      setProdViewMode("explorer");
                                    }
                                  }}
                                  className="flex items-center justify-between text-[11px] font-mono text-slate-700 bg-white/80 border border-slate-100 p-1.5 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer"
                                >
                                  <span className="truncate">{target.path}</span>
                                  <span className="text-[9px] uppercase px-1 rounded bg-slate-100 text-slate-500">
                                    {target.language}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 6. ARCHITECTURE CONTRACTS (DDL & REST) */}
                {prodViewMode === "contracts" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setActiveContractTab("database")}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          activeContractTab === "database"
                            ? "bg-slate-900 text-white font-bold"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        PostgreSQL DDL Contract
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveContractTab("api")}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          activeContractTab === "api"
                            ? "bg-slate-900 text-white font-bold"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        REST Endpoints Contract ({productionCodebase?.manifest.apiContract.length || 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveContractTab("env")}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          activeContractTab === "env"
                            ? "bg-slate-900 text-white font-bold"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Environment Contract (.env)
                      </button>
                    </div>

                    {activeContractTab === "database" && (
                      <div className="rounded-xl bg-zinc-950 p-4 font-mono text-xs text-zinc-100 overflow-x-auto max-h-[500px]">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                          <span className="text-emerald-400 font-bold">schema.sql Contract</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyProdCode(productionCodebase?.manifest.databaseContract || "")
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs text-zinc-200 hover:bg-zinc-700 cursor-pointer"
                          >
                            <Copy className="size-3" />
                            <span>Copy DDL</span>
                          </button>
                        </div>
                        <pre className="whitespace-pre leading-relaxed">
                          <code>{productionCodebase?.manifest.databaseContract}</code>
                        </pre>
                      </div>
                    )}

                    {activeContractTab === "api" && (
                      <div className="space-y-2">
                        {(productionCodebase?.manifest.apiContract || []).map((ep, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2 font-mono text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded px-2 py-0.5 font-bold text-white text-[10px] ${
                                  ep.method === "GET"
                                    ? "bg-blue-600"
                                    : ep.method === "POST"
                                    ? "bg-emerald-600"
                                    : ep.method === "PUT"
                                    ? "bg-amber-600"
                                    : "bg-purple-600"
                                }`}
                              >
                                {ep.method}
                              </span>
                              <span className="font-bold text-slate-900">{ep.path}</span>
                              <span className="text-slate-500 font-sans text-xs ml-auto">
                                {ep.summary}
                              </span>
                            </div>

                            {ep.requestBody && (
                              <div className="bg-slate-50 p-2 rounded-lg text-slate-700">
                                <span className="text-[10px] text-slate-400 uppercase block">Request Body</span>
                                <code>{ep.requestBody}</code>
                              </div>
                            )}

                            {ep.responseBody && (
                              <div className="bg-slate-50 p-2 rounded-lg text-slate-700">
                                <span className="text-[10px] text-slate-400 uppercase block">Response Body</span>
                                <code>{ep.responseBody}</code>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {activeContractTab === "env" && (
                      <div className="rounded-xl bg-zinc-950 p-4 font-mono text-xs text-zinc-100 overflow-x-auto max-h-[400px]">
                        <pre className="whitespace-pre leading-relaxed">
                          <code>{(productionCodebase?.manifest.envContract || []).join("\n")}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SETUP GUIDE */}
          {activeTab === "guide" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Local Setup & Verification Guide
                </h3>
                <p className="text-xs text-slate-500">
                  Step-by-step instructions to execute and test this repository locally.
                </p>
              </div>

              <ol className="space-y-2.5">
                {runInstructions.map((instruction, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs"
                  >
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                      {index + 1}
                    </span>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-800">Step {index + 1}</p>
                      <p className="font-mono text-slate-600 bg-white p-2 rounded border border-slate-200">
                        {instruction}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* 3. COLLAPSIBLE BOTTOM TELEMETRY & CONSOLE DRAWER */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div
              onClick={() => setIsTelemetryOpen(!isTelemetryOpen)}
              className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100 cursor-pointer select-none"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 font-mono">
                {isTelemetryOpen ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
                <Terminal className="size-3.5 text-blue-600" />
                <span>Bottom Telemetry & Diagnostics</span>
                <span className="rounded-md bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[9px] font-bold">
                  {simulatedLogs.length} events
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSimulatedLogs([]);
                }}
                className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 underline"
              >
                Clear
              </button>
            </div>

            {isTelemetryOpen && (
              <div className="bg-zinc-950 p-3.5 font-mono text-[11px] text-zinc-300 space-y-1.5 max-h-36 overflow-y-auto">
                {simulatedLogs.map((log, i) => (
                  <p key={i} className="flex items-center gap-2 opacity-90 leading-relaxed">
                    <span className="text-emerald-400">▸</span>
                    <span>{log}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Repo Forge Modal for GitHub & StackBlitz */}
      <RepoForgeModal
        open={isForgeModalOpen}
        onClose={() => setIsForgeModalOpen(false)}
        prototype={prototype}
        blueprint={blueprint}
        profile={profile}
        productionCodebase={productionCodebase}
        onDownloadZip={() => {
          if (productionCodebase && productionCodebase.files.length > 0) {
            void handleDownloadProductionZip();
          } else {
            void handleDownloadZip();
          }
        }}
      />
    </div>
  );
}
