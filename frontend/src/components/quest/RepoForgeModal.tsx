import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  X,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Github,
  Zap,
  Terminal,
  Lock,
  Globe,
  CheckCircle2,
  AlertCircle,
  FolderTree,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import type { Blueprint, ProductionCodebase, PrototypeData, StudentProfile } from "@/lib/types";
import {
  buildForgeFileTree,
  launchStackBlitzProject,
  pushToGitHubRepo,
  generateGitQuickstartScript,
  type ForgeProgressCallback,
} from "@/lib/forge-service";
import { copyToClipboard } from "@/lib/clipboard";
import { YadukLogo } from "./YadukLogo";

interface RepoForgeModalProps {
  open: boolean;
  onClose: () => void;
  prototype: PrototypeData;
  blueprint?: Blueprint | null;
  profile?: StudentProfile | null;
  productionCodebase?: ProductionCodebase | null;
  onDownloadZip?: () => void;
}

type TabType = "stackblitz" | "github" | "terminal";

export function RepoForgeModal({
  open,
  onClose,
  prototype,
  blueprint,
  profile,
  productionCodebase,
  onDownloadZip,
}: RepoForgeModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("stackblitz");

  // Project defaults
  const projectTitle = prototype?.title || blueprint?.title || "Yaduk Project";
  const defaultRepoName = `yaduk-${(prototype?.title || blueprint?.title || "app")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 36)}`;

  // GitHub Form State
  const [repoName, setRepoName] = useState(defaultRepoName);
  const [description, setDescription] = useState(
    prototype?.tagline || prototype?.architectureSummary || "Scaffolded with Yaduk AI Architect"
  );
  const [isPrivate, setIsPrivate] = useState(false);
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [rememberToken, setRememberToken] = useState(true);

  // GitHub Progress State
  const [isPushing, setIsPushing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [pushResult, setPushResult] = useState<{
    success: boolean;
    repoUrl?: string;
    cloneUrl?: string;
    defaultBranch?: string;
    error?: string;
  } | null>(null);

  // Terminal Script State
  const [cliFormat, setCliFormat] = useState<"bash" | "powershell">("bash");
  const [copiedCli, setCopiedCli] = useState(false);
  const [copiedClone, setCopiedClone] = useState(false);

  // Load saved token from localStorage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("yaduk_github_token") || localStorage.getItem("sarthi_github_token");
      if (savedToken) {
        setToken(savedToken);
      }
    }
  }, []);

  // Update repoName if prototype title changes
  useEffect(() => {
    setRepoName(defaultRepoName);
    setDescription(
      prototype?.tagline || prototype?.architectureSummary || "Scaffolded with Yaduk AI Architect"
    );
    setPushResult(null);
  }, [prototype?.title, blueprint?.title]);

  if (!open) return null;

  // Build the unified file tree
  const files = buildForgeFileTree({
    prototype,
    blueprint,
    profile,
    productionCodebase,
  });

  const fileCount = Object.keys(files).length;
  const isProductionReady = Boolean(productionCodebase && productionCodebase.files.length > 0);

  const handleLaunchStackBlitz = () => {
    try {
      toast.info("Preparing WebContainer workspace for StackBlitz...");
      launchStackBlitzProject({
        title: projectTitle,
        description: description,
        files,
      });
      toast.success("StackBlitz opened in a new tab! Starting virtual dev server.");
    } catch (err) {
      toast.error("Failed to launch StackBlitz: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handlePushToGitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error("Please provide a GitHub Personal Access Token.");
      return;
    }

    if (rememberToken) {
      localStorage.setItem("yaduk_github_token", token.trim());
    } else {
      localStorage.removeItem("yaduk_github_token");
      localStorage.removeItem("sarthi_github_token");
    }

    setIsPushing(true);
    setPushResult(null);

    const onProgress: ForgeProgressCallback = (step, message) => {
      setCurrentStep(message);
    };

    try {
      const result = await pushToGitHubRepo(
        {
          name: repoName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-"),
          description: description.trim(),
          isPrivate,
          token: token.trim(),
        },
        files,
        onProgress
      );

      setPushResult(result);
      if (result.success) {
        toast.success("Repository created and committed successfully on GitHub! 🚀");
      } else {
        toast.error("GitHub forge encountered an issue: " + result.error);
      }
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : String(err);
      setPushResult({ success: false, error: msg });
      toast.error(msg);
    } finally {
      setIsPushing(false);
    }
  };

  const terminalScript = generateGitQuickstartScript({
    repoName: repoName.trim(),
    isPrivate,
    format: cliFormat,
  });

  const handleCopyScript = async () => {
    const ok = await copyToClipboard(terminalScript);
    if (ok) {
      setCopiedCli(true);
      toast.success("Terminal script copied to clipboard!");
      setTimeout(() => setCopiedCli(false), 2000);
    } else {
      toast.error("Failed to copy script.");
    }
  };

  const handleCopyClone = async (cloneUrl: string) => {
    const ok = await copyToClipboard(`git clone ${cloneUrl}`);
    if (ok) {
      setCopiedClone(true);
      toast.success("Clone command copied!");
      setTimeout(() => setCopiedClone(false), 2000);
    } else {
      toast.error("Failed to copy clone command.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-blue-200/80 bg-white/95 shadow-2xl shadow-blue-500/10 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-1.5 backdrop-blur-md border border-white/20">
              <YadukLogo size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/20 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-white">
                  Developer Hub
                </span>
                <span className="text-[11px] text-blue-100 hidden sm:inline">
                  {isProductionReady ? "Full-Stack Manifest" : "Interactive Prototype"} · {fileCount} Files
                </span>
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
                Direct GitHub Repo & StackBlitz Forge
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200/80 bg-slate-50/80 px-6">
          <button
            type="button"
            onClick={() => setActiveTab("stackblitz")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "stackblitz"
                ? "border-blue-600 text-blue-600 bg-white shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Zap className="size-4 text-amber-500" />
            <span>StackBlitz (WebContainer)</span>
            <span className="rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2">
              1-Click
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("github")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "github"
                ? "border-blue-600 text-blue-600 bg-white shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Github className="size-4 text-slate-800" />
            <span>Push to GitHub Repo</span>
            <span className="rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.2">
              Direct API
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("terminal")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "terminal"
                ? "border-blue-600 text-blue-600 bg-white shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Terminal className="size-4 text-emerald-600" />
            <span>Terminal & gh CLI</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: STACKBLITZ */}
          {activeTab === "stackblitz" && (
            <div className="space-y-5">
              {/* Feature highlight card */}
              <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-white to-blue-50/50 p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 font-mono text-[10px] font-bold text-amber-900 uppercase">
                      <Sparkles className="size-3 text-amber-600" />
                      Zero-Installation Cloud Sandbox
                    </span>
                    <h4 className="font-display text-xl font-bold text-slate-900">
                      Launch instantly in StackBlitz WebContainer
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      StackBlitz runs a full Node.js virtual machine directly inside your browser. No Docker, no node_modules downloading on your computer — instant hot-reloading in seconds.
                    </p>
                  </div>
                  <div className="hidden sm:flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-300/60 shadow-inner">
                    <Zap className="size-8 text-amber-500" />
                  </div>
                </div>

                {/* Workspace stats pill grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Files Ready</span>
                    <span className="text-base font-bold text-slate-900 font-mono">{fileCount} files</span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Dev Server</span>
                    <span className="text-base font-bold text-blue-600 font-mono">Vite 5</span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Frontend</span>
                    <span className="text-base font-bold text-slate-900 font-mono">React 18 + TS</span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Environment</span>
                    <span className="text-base font-bold text-emerald-600 font-mono">WebContainer</span>
                  </div>
                </div>

                {/* Launch Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleLaunchStackBlitz}
                    className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6 py-4 font-display text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 cursor-pointer"
                  >
                    <Zap className="size-4 text-amber-300" />
                    <span>Launch in StackBlitz Workspace (New Tab)</span>
                    <ExternalLink className="size-4 opacity-80" />
                  </button>
                </div>
              </div>

              {/* Quick file tree preview */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FolderTree className="size-3.5 text-blue-600" />
                    Included Project Files
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Auto-configured package.json & Vite</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                  {Object.keys(files).map((f) => (
                    <span
                      key={f}
                      className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-mono text-slate-700 shadow-2xs"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GITHUB DIRECT PUSH */}
          {activeTab === "github" && (
            <div className="space-y-5">
              {!pushResult?.success ? (
                <form onSubmit={handlePushToGitHub} className="space-y-4">
                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 text-xs text-slate-700 flex items-start gap-2.5">
                    <Github className="size-4 text-slate-900 mt-0.5 shrink-0" />
                    <p className="leading-relaxed">
                      Yaduk will connect to GitHub via the official REST API, create the repository under your account, commit the complete architecture tree, and set up CI/CD workflows.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Repo Name */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Repository Name</label>
                      <input
                        type="text"
                        value={repoName}
                        onChange={(e) => setRepoName(e.target.value)}
                        placeholder="yaduk-my-project"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Privacy */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Visibility</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setIsPrivate(false)}
                          className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold cursor-pointer transition-all ${
                            !isPrivate
                              ? "border-blue-600 bg-blue-50 text-blue-700 font-bold"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <Globe className="size-3.5" />
                          <span>Public</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsPrivate(true)}
                          className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold cursor-pointer transition-all ${
                            isPrivate
                              ? "border-blue-600 bg-blue-50 text-blue-700 font-bold"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <Lock className="size-3.5" />
                          <span>Private</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Repository Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="High-performance system scaffolded by Yaduk AI"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* GitHub Token Input */}
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <KeyRound className="size-3.5 text-blue-600" />
                        GitHub Personal Access Token (PAT)
                      </label>
                      <a
                        href="https://github.com/settings/tokens/new?scopes=repo&description=Yaduk+AI+Forge"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Generate Token on GitHub ↗
                      </a>
                    </div>
                    <div className="relative">
                      <input
                        type={showToken ? "text" : "password"}
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx or github_pat_..."
                        required
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        title={showToken ? "Hide token" : "Show token"}
                      >
                        {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberToken}
                          onChange={(e) => setRememberToken(e.target.checked)}
                          className="size-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>Remember token in local browser</span>
                      </label>
                      <span className="text-[10px] text-slate-400">Tokens are kept in browser only</span>
                    </div>
                  </div>

                  {/* Progress Step or Error message */}
                  {isPushing && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-3.5 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-800">
                        <Loader2 className="size-4 animate-spin text-blue-600" />
                        <span>{currentStep || "Forging repository on GitHub..."}</span>
                      </div>
                    </div>
                  )}

                  {pushResult && !pushResult.success && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2">
                      <AlertCircle className="size-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Forge failed</p>
                        <p className="mt-0.5">{pushResult.error}</p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isPushing}
                      className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-slate-900 hover:bg-black px-6 py-3.5 font-display text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
                    >
                      <Github className="size-4" />
                      <span>{isPushing ? "Forging on GitHub..." : "🚀 Forge & Push to GitHub"}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Celebration Success View */
                <div className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/60 to-white p-6 text-center space-y-4">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 border border-emerald-300">
                    <CheckCircle2 className="size-8 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-display text-xl font-bold text-slate-900">
                      Repository Forged Successfully! 🦚
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
                      Your full system architecture and code files have been committed to GitHub under branch{" "}
                      <span className="font-mono font-bold text-slate-800">{pushResult.defaultBranch || "main"}</span>.
                    </p>
                  </div>

                  {/* Action Links */}
                  <div className="pt-2 flex flex-wrap justify-center gap-3">
                    <a
                      href={pushResult.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-black px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5"
                    >
                      <Github className="size-4" />
                      <span>Open on GitHub ↗</span>
                    </a>

                    {pushResult.cloneUrl && (
                      <button
                        type="button"
                        onClick={() => handleCopyClone(pushResult.cloneUrl!)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs cursor-pointer"
                      >
                        {copiedClone ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5 text-slate-500" />}
                        <span>{copiedClone ? "Copied Clone Command" : "Copy Clone Command"}</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setPushResult(null)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      ← Push another repository or update
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TERMINAL & GH CLI */}
          {activeTab === "terminal" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-600">
                  Prefer using your local terminal? Use the official GitHub CLI (<code className="font-mono text-blue-600">gh</code>) to forge your repo in one command.
                </p>
                <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setCliFormat("bash")}
                    className={`rounded-md px-3 py-1 cursor-pointer transition-all ${
                      cliFormat === "bash" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500"
                    }`}
                  >
                    Bash / macOS / Linux
                  </button>
                  <button
                    type="button"
                    onClick={() => setCliFormat("powershell")}
                    className={`rounded-md px-3 py-1 cursor-pointer transition-all ${
                      cliFormat === "powershell" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500"
                    }`}
                  >
                    PowerShell / Windows
                  </button>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-100 shadow-inner">
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 text-[11px] font-semibold text-slate-200 transition-colors cursor-pointer"
                >
                  {copiedCli ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5 text-slate-400" />}
                  <span>{copiedCli ? "Copied!" : "Copy Script"}</span>
                </button>
                <pre className="overflow-x-auto whitespace-pre leading-relaxed pr-24 text-emerald-400">
                  <code>{terminalScript}</code>
                </pre>
              </div>

              {/* Starter zip download helper */}
              {onDownloadZip && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-slate-700">Need the project files first?</span>
                  <button
                    type="button"
                    onClick={onDownloadZip}
                    className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    <span>Download Project ZIP Archive ↓</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <span className="text-[11px] text-slate-500">
            Powered by Yaduk AI Architecture Engine
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
