import { useState, useMemo } from "react";
import JSZip from "jszip";
import type { Blueprint, GeneratedCodeFile, ProjectCodebase, StudentProfile } from "@/lib/types";
import {
  Folder,
  FileCode,
  Download,
  Copy,
  Check,
  Sparkles,
  Zap,
  Terminal,
  Layers,
  ArrowLeft,
  Search,
  CheckCircle2,
  Loader2,
  RefreshCw,
  FolderTree,
  FileText,
  Code2,
  Database,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface CodebaseExplorerViewProps {
  codebase: ProjectCodebase;
  blueprint: Blueprint;
  profile?: StudentProfile | null | undefined;
  onBackToSetup: () => void;
  onRegenerateBackend?: () => void;
  onRegenerateFrontend?: () => void;
  isGenerating?: boolean;
}

export function CodebaseExplorerView({
  codebase,
  blueprint,
  profile,
  onBackToSetup,
  onRegenerateBackend,
  onRegenerateFrontend,
  isGenerating = false,
}: CodebaseExplorerViewProps) {
  const [selectedPath, setSelectedPath] = useState<string>(
    codebase.files[0]?.path || "backend/app/main.py"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLayer, setSelectedLayer] = useState<string>("all");
  const [showRunbookModal, setShowRunbookModal] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const activeFile: GeneratedCodeFile | undefined = useMemo(() => {
    return codebase.files.find((f) => f.path === selectedPath) || codebase.files[0];
  }, [codebase.files, selectedPath]);

  const filteredFiles = useMemo(() => {
    return codebase.files.filter((file) => {
      const matchesSearch = file.path.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLayer = selectedLayer === "all" || file.layer === selectedLayer;
      return matchesSearch && matchesLayer;
    });
  }, [codebase.files, searchQuery, selectedLayer]);

  const handleCopyCode = (code: string) => {
    void navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success("File content copied to clipboard");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyPath = (path: string) => {
    void navigator.clipboard.writeText(path);
    setCopiedPath(true);
    toast.success("Path copied");
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      toast.info("Packaging complete codebase into ZIP archive...");
      const zip = new JSZip();

      // Add all generated code files
      codebase.files.forEach((file) => {
        zip.file(file.path, file.code);
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const slug = (blueprint.title || "project").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}-fullstack-suite.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Project ZIP downloaded successfully!");
    } catch (err) {
      console.error("ZIP creation failed:", err);
      toast.error("Failed to generate ZIP archive");
    } finally {
      setIsZipping(false);
    }
  };

  const getFileIcon = (path: string) => {
    const ext = path.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "py":
        return <span className="text-blue-400 font-bold text-[10px]">PY</span>;
      case "ts":
      case "tsx":
        return <span className="text-sky-400 font-bold text-[10px]">TS</span>;
      case "js":
      case "jsx":
        return <span className="text-amber-400 font-bold text-[10px]">JS</span>;
      case "sql":
        return <Database className="size-3.5 text-emerald-400" />;
      case "json":
        return <span className="text-yellow-400 font-bold text-[10px]">{}</span>;
      case "css":
        return <span className="text-indigo-400 font-bold text-[10px]">#</span>;
      case "html":
        return <span className="text-orange-400 font-bold text-[10px]">&lt;&gt;</span>;
      case "md":
        return <FileText className="size-3.5 text-slate-400" />;
      default:
        return <FileCode className="size-3.5 text-slate-400" />;
    }
  };

  const backendCount = codebase.files.filter((f) => f.layer === "backend" || f.layer === "database").length;
  const frontendCount = codebase.files.filter((f) => f.layer === "frontend" || f.layer === "root").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Telemetry */}
      <div className="panel q-rise rounded-3xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/80 p-6 sm:p-8 shadow-xl shadow-blue-500/5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 font-mono text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                <CheckCircle2 className="size-3 text-emerald-600" />
                Two-Engine Full-Stack Codebase Ready
              </span>
              <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                Grounded on Approved Dependencies
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {blueprint.title || "Full-Stack Software Suite"}
            </h2>
            <p className="max-w-2xl text-xs sm:text-sm text-slate-600 leading-relaxed">
              Explore the synthesized source code files, copy implementation modules, or download the complete ready-to-run ZIP archive with local setup runbooks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowRunbookModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Terminal className="size-3.5 text-blue-600" />
              <span>Quickstart Runbook</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isZipping || codebase.files.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isZipping ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              <span>Download Complete Project (.ZIP)</span>
            </button>
          </div>
        </div>

        {/* Two-Engine Status Cards */}
        <div className="mt-6 pt-5 border-t border-blue-100/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-blue-200/80 bg-white/90 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Layers className="size-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">Engine 1</span>
                <h4 className="font-display text-sm font-bold text-slate-900">Backend & Database</h4>
                <p className="text-[11px] text-slate-500">{backendCount} files synthesized</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                <Check className="size-3" /> Ready
              </span>
              {onRegenerateBackend && (
                <button
                  type="button"
                  onClick={onRegenerateBackend}
                  disabled={isGenerating}
                  title="Regenerate Backend Engine"
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  <RefreshCw className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-200/80 bg-white/90 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Code2 className="size-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Engine 2</span>
                <h4 className="font-display text-sm font-bold text-slate-900">Frontend & UI Shell</h4>
                <p className="text-[11px] text-slate-500">{frontendCount} files synthesized</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                <Check className="size-3" /> Ready
              </span>
              {onRegenerateFrontend && (
                <button
                  type="button"
                  onClick={onRegenerateFrontend}
                  disabled={isGenerating}
                  title="Regenerate Frontend Engine"
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  <RefreshCw className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Workbench: File Explorer + Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: File Tree Explorer (4 cols) */}
        <div className="lg:col-span-4 panel rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FolderTree className="size-4 text-blue-600" />
              <h3 className="font-display text-sm font-bold text-slate-900">Project Files</h3>
            </div>
            <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {filteredFiles.length} files
            </span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="size-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search file path..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Layer Filter Pills */}
          <div className="flex flex-wrap gap-1">
            {["all", "backend", "frontend", "database", "root"].map((layer) => (
              <button
                key={layer}
                type="button"
                onClick={() => setSelectedLayer(layer)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                  selectedLayer === layer
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {layer}
              </button>
            ))}
          </div>

          {/* File List */}
          <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
            {filteredFiles.map((file) => {
              const isSelected = file.path === selectedPath;
              return (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setSelectedPath(file.path)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-50 border border-blue-200 text-blue-900 font-bold shadow-2xs"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="shrink-0">{getFileIcon(file.path)}</div>
                    <span className="truncate font-mono">{file.path}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">
                    {file.layer}
                  </span>
                </button>
              );
            })}
            {filteredFiles.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-6">No matching files found.</p>
            )}
          </div>
        </div>

        {/* Right Column: Code Viewer (8 cols) */}
        <div className="lg:col-span-8 panel rounded-3xl border border-slate-800 bg-slate-950 shadow-xl overflow-hidden text-slate-200">
          {activeFile ? (
            <div>
              {/* Code Viewer Header */}
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-5 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="shrink-0">{getFileIcon(activeFile.path)}</div>
                  <div className="min-w-0">
                    <span className="font-mono text-xs font-bold text-slate-100 truncate block">
                      {activeFile.path}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block">
                      {activeFile.description}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyPath(activeFile.path)}
                    title="Copy Path"
                    className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs transition-colors cursor-pointer"
                  >
                    {copiedPath ? <Check className="size-3.5 text-emerald-400" /> : <Folder className="size-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyCode(activeFile.code)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer shadow-sm shadow-blue-500/20"
                  >
                    {copiedCode ? <Check className="size-3.5 text-white" /> : <Copy className="size-3.5" />}
                    <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
                  </button>
                </div>
              </div>

              {/* Code Content Area with Line Numbers */}
              <div className="p-4 overflow-x-auto max-h-[620px] font-mono text-xs leading-relaxed text-slate-300">
                <pre className="grid grid-cols-[auto_1fr] gap-x-4">
                  <span className="select-none text-slate-600 text-right pr-2 border-r border-slate-800">
                    {activeFile.code.split("\n").map((_, i) => (
                      <span key={i} className="block leading-relaxed">
                        {i + 1}
                      </span>
                    ))}
                  </span>
                  <code className="block leading-relaxed">
                    {activeFile.code}
                  </code>
                </pre>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-sm">
              Select a file from the explorer to view its source code.
            </div>
          )}
        </div>
      </div>

      {/* Quickstart Runbook Modal */}
      {showRunbookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="size-4 text-blue-600" />
                <span>Local Development Runbook</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowRunbookModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Follow these commands after extracting your downloaded project ZIP to run the database, backend, and frontend locally.
            </p>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {codebase.setupSpec.runInstructions.map((inst) => (
                <div key={inst.step} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900">
                      Step {inst.step}: {inst.title}
                    </span>
                    <span className="text-[11px] text-slate-500">{inst.note}</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 text-slate-200 rounded-xl px-3 py-2 font-mono text-xs">
                    <code>{inst.command}</code>
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(inst.command);
                        toast.success("Command copied");
                      }}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <Copy className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRunbookModal(false)}
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer shadow-md shadow-blue-500/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBackToSetup}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>← Back to Setup & Dependencies</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-700 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer transition-all disabled:opacity-50"
          >
            <Download className="size-4" />
            <span>Download All Code (.ZIP)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
