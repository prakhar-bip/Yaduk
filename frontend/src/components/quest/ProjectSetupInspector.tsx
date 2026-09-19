import { useState } from "react";
import type { Blueprint, DependencyItem, ProjectSetupSpec, StudentProfile } from "@/lib/types";
import { generateProjectSetupFallback } from "@/lib/quest.functions";
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  Check,
  Sparkles,
  Layers,
  Terminal,
  Key,
  FolderTree,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Copy,
  Folder,
  FileText,
  X,
  Code2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

interface ProjectSetupInspectorProps {
  setupSpec: ProjectSetupSpec;
  blueprint: Blueprint;
  profile?: StudentProfile | null | undefined;
  onLockSetupAndProceed: (finalSetup: ProjectSetupSpec) => void;
  onBackToContract: () => void;
  isGenerating?: boolean;
}

export function ProjectSetupInspector({
  setupSpec,
  blueprint,
  profile,
  onLockSetupAndProceed,
  onBackToContract,
  isGenerating = false,
}: ProjectSetupInspectorProps) {
  const [setup, setSetup] = useState<ProjectSetupSpec>(setupSpec);
  const [activeTab, setActiveTab] = useState<"backend" | "frontend" | "scripts" | "env" | "tree">("backend");

  // Add dependency modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLayer, setAddLayer] = useState<"backend" | "frontend">("backend");
  const [newPkgName, setNewPkgName] = useState("");
  const [newPkgVersion, setNewPkgVersion] = useState("");
  const [newPkgPurpose, setNewPkgPurpose] = useState("");
  const [newPkgIsDev, setNewPkgIsDev] = useState(false);
  const [newPkgCategory, setNewPkgCategory] = useState<DependencyItem["category"]>("core");

  // Inline editing state for version
  const [editingPkgKey, setEditingPkgKey] = useState<string | null>(null);
  const [editingVersionVal, setEditingVersionVal] = useState("");

  const copyToClipboard = (text: string, label: string) => {
    void navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleRemoveDependency = (layer: "backend" | "frontend", name: string) => {
    if (layer === "backend") {
      setSetup((prev) => ({
        ...prev,
        backendDependencies: prev.backendDependencies.filter((d) => d.name !== name),
      }));
    } else {
      setSetup((prev) => ({
        ...prev,
        frontendDependencies: prev.frontendDependencies.filter((d) => d.name !== name),
      }));
    }
    toast.info(`Removed ${name} from ${layer} dependencies`);
  };

  const handleStartEditVersion = (name: string, currentVersion: string) => {
    setEditingPkgKey(name);
    setEditingVersionVal(currentVersion);
  };

  const handleSaveEditVersion = (layer: "backend" | "frontend", name: string) => {
    if (layer === "backend") {
      setSetup((prev) => ({
        ...prev,
        backendDependencies: prev.backendDependencies.map((d) =>
          d.name === name ? { ...d, version: editingVersionVal.trim() || d.version } : d
        ),
      }));
    } else {
      setSetup((prev) => ({
        ...prev,
        frontendDependencies: prev.frontendDependencies.map((d) =>
          d.name === name ? { ...d, version: editingVersionVal.trim() || d.version } : d
        ),
      }));
    }
    setEditingPkgKey(null);
    toast.success(`Updated version for ${name}`);
  };

  const handleAddDependencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgName.trim()) {
      toast.error("Package name is required");
      return;
    }

    const newDep: DependencyItem = {
      name: newPkgName.trim(),
      version: newPkgVersion.trim() || "latest",
      purpose: newPkgPurpose.trim() || "User-added dependency",
      isDev: newPkgIsDev,
      category: newPkgCategory || "core",
    };

    if (addLayer === "backend") {
      if (setup.backendDependencies.some((d) => d.name.toLowerCase() === newDep.name.toLowerCase())) {
        toast.error(`${newDep.name} is already in backend dependencies`);
        return;
      }
      setSetup((prev) => ({
        ...prev,
        backendDependencies: [...prev.backendDependencies, newDep],
      }));
    } else {
      if (setup.frontendDependencies.some((d) => d.name.toLowerCase() === newDep.name.toLowerCase())) {
        toast.error(`${newDep.name} is already in frontend dependencies`);
        return;
      }
      setSetup((prev) => ({
        ...prev,
        frontendDependencies: [...prev.frontendDependencies, newDep],
      }));
    }

    toast.success(`Added ${newDep.name} to ${addLayer} dependencies`);
    setNewPkgName("");
    setNewPkgVersion("");
    setNewPkgPurpose("");
    setNewPkgIsDev(false);
    setShowAddModal(false);
  };

  const handleResetToDefaults = () => {
    const fresh = generateProjectSetupFallback(blueprint, profile);
    setSetup(fresh);
    toast.info("Reset setup dependencies to recommended defaults");
  };

  const getCategoryBadgeClass = (category?: string) => {
    switch (category) {
      case "core":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "database":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "auth":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "utility":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "testing":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="panel q-rise rounded-3xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/80 p-6 sm:p-8 shadow-xl shadow-blue-500/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 border border-blue-200 px-3 py-1 font-mono text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                <Sparkles className="size-3 text-blue-600" />
                Phase 1: Project Setup & Dependency Contract
              </span>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                Fully Dynamic & Editable
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Project Setup & Dependency Inspector
            </h2>
            <p className="max-w-2xl text-xs sm:text-sm text-slate-600 leading-relaxed">
              Review and curate the exact libraries and tooling for your stack. When you lock this setup, Yaduk
              synthesizes the full codebase across two synchronized engines strictly adhering to your approved dependencies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="size-3.5 text-slate-500" />
              <span>Reset Defaults</span>
            </button>
            <button
              type="button"
              onClick={() => onLockSetupAndProceed(setup)}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap className="size-4" />
              <span>{isGenerating ? "Synthesizing Codebase..." : "Lock Setup & Launch Two-Engine Generator →"}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Tech Stack Telemetry Pills */}
        <div className="mt-6 pt-5 border-t border-blue-100/80 flex flex-wrap items-center gap-2.5 text-xs">
          <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider mr-1">
            Detected Stack:
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200/90 px-3 py-1 font-semibold text-slate-800 shadow-2xs">
            <Layers className="size-3.5 text-blue-600" />
            <span>Backend: {setup.backendFramework} ({setup.backendLanguage})</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200/90 px-3 py-1 font-semibold text-slate-800 shadow-2xs">
            <Code2 className="size-3.5 text-indigo-600" />
            <span>Frontend: {setup.frontendFramework}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50/80 border border-blue-200 px-3 py-1 font-mono font-bold text-blue-700">
            <Package className="size-3.5 text-blue-600" />
            <span>{setup.backendDependencies.length} Backend + {setup.frontendDependencies.length} Frontend Packages</span>
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white/70 backdrop-blur-md rounded-2xl p-1 shadow-2xs gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("backend")}
          className={`flex-1 py-2.5 px-3 rounded-xl font-display text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "backend"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
          }`}
        >
          <Package className="size-4" />
          <span>Backend ({setup.backendManifestName})</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${activeTab === "backend" ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-700"}`}>
            {setup.backendDependencies.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("frontend")}
          className={`flex-1 py-2.5 px-3 rounded-xl font-display text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "frontend"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
          }`}
        >
          <Code2 className="size-4" />
          <span>Frontend ({setup.frontendManifestName})</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${activeTab === "frontend" ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-700"}`}>
            {setup.frontendDependencies.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("scripts")}
          className={`flex-1 py-2.5 px-3 rounded-xl font-display text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "scripts"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
          }`}
        >
          <Terminal className="size-4" />
          <span>Run Scripts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("env")}
          className={`flex-1 py-2.5 px-3 rounded-xl font-display text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "env"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
          }`}
        >
          <Key className="size-4" />
          <span>Environment (.env)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tree")}
          className={`flex-1 py-2.5 px-3 rounded-xl font-display text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "tree"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
          }`}
        >
          <FolderTree className="size-4" />
          <span>File Tree</span>
        </button>
      </div>

      {/* Tab 1: Backend Dependencies */}
      {activeTab === "backend" && (
        <div className="panel q-rise rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Backend Dependencies ({setup.backendManifestName})
              </h3>
              <p className="text-xs text-slate-500">
                Libraries installed for the {setup.backendFramework} application server. Engine 1 will strictly use these packages.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAddLayer("backend");
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-3.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="size-3.5" />
              <span>Add Package</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {setup.backendDependencies.map((dep) => (
              <div
                key={dep.name}
                className="group relative rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 transition-all hover:bg-white hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900 truncate">
                        {dep.name}
                      </span>
                      {editingPkgKey === dep.name ? (
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="text"
                            value={editingVersionVal}
                            onChange={(e) => setEditingVersionVal(e.target.value)}
                            className="w-20 px-1.5 py-0.5 text-xs font-mono rounded border border-blue-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditVersion("backend", dep.name)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="size-3" />
                          </button>
                        </div>
                      ) : (
                        <span
                          onClick={() => handleStartEditVersion(dep.name, dep.version)}
                          title="Click to edit version"
                          className="font-mono text-xs text-slate-500 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 px-2 py-0.5 rounded cursor-pointer transition-colors"
                        >
                          {dep.version}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-slate-600 line-clamp-2">
                      {dep.purpose}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleStartEditVersion(dep.name, dep.version)}
                      title="Edit version"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveDependency("backend", dep.name)}
                      title="Remove package"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px]">
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getCategoryBadgeClass(dep.category)}`}>
                    {dep.category || "core"}
                  </span>
                  {dep.isDev && (
                    <span className="font-mono text-slate-400">devDependency</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Frontend Dependencies */}
      {activeTab === "frontend" && (
        <div className="panel q-rise rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Frontend Dependencies ({setup.frontendManifestName})
              </h3>
              <p className="text-xs text-slate-500">
                Client libraries, icons, and tooling for {setup.frontendFramework}. Engine 2 will strictly use these packages.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAddLayer("frontend");
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-3.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="size-3.5" />
              <span>Add Package</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {setup.frontendDependencies.map((dep) => (
              <div
                key={dep.name}
                className="group relative rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 transition-all hover:bg-white hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900 truncate">
                        {dep.name}
                      </span>
                      {editingPkgKey === dep.name ? (
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="text"
                            value={editingVersionVal}
                            onChange={(e) => setEditingVersionVal(e.target.value)}
                            className="w-20 px-1.5 py-0.5 text-xs font-mono rounded border border-blue-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditVersion("frontend", dep.name)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="size-3" />
                          </button>
                        </div>
                      ) : (
                        <span
                          onClick={() => handleStartEditVersion(dep.name, dep.version)}
                          title="Click to edit version"
                          className="font-mono text-xs text-slate-500 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 px-2 py-0.5 rounded cursor-pointer transition-colors"
                        >
                          {dep.version}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-slate-600 line-clamp-2">
                      {dep.purpose}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleStartEditVersion(dep.name, dep.version)}
                      title="Edit version"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveDependency("frontend", dep.name)}
                      title="Remove package"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px]">
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getCategoryBadgeClass(dep.category)}`}>
                    {dep.category || "core"}
                  </span>
                  {dep.isDev && (
                    <span className="font-mono text-slate-400">devDependency</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Run Scripts & Commands */}
      {activeTab === "scripts" && (
        <div className="panel q-rise rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-display text-lg font-bold text-slate-900">
              Run Scripts & Lifecycle Commands
            </h3>
            <p className="text-xs text-slate-500">
              Standard terminal commands to install, run, build, and test this project locally.
            </p>
          </div>

          <div className="space-y-3">
            {setup.devScripts.map((script) => (
              <div
                key={script.command}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100/70 border border-blue-200 px-2.5 py-0.5 rounded-md">
                      {script.command}
                    </span>
                    <span className="text-xs font-medium text-slate-600">{script.purpose}</span>
                  </div>
                  <div className="font-mono text-xs text-slate-800 bg-slate-900 text-slate-200 px-3 py-2 rounded-xl">
                    <code>{script.script}</code>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard(script.script, script.command)}
                  className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <Copy className="size-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            ))}
          </div>

          {/* Quickstart Step-by-Step runbook */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h4 className="font-display text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Terminal className="size-4 text-blue-600" />
              <span>Step-by-Step Setup Runbook</span>
            </h4>
            <div className="space-y-2">
              {setup.runInstructions.map((inst) => (
                <div key={inst.step} className="flex items-start gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-white font-mono text-[10px] font-bold shrink-0 mt-0.5">
                    {inst.step}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-slate-800 font-semibold">{inst.title}</strong>
                      <span className="text-slate-400 text-[11px]">{inst.note}</span>
                    </div>
                    <code className="block mt-1 font-mono text-slate-700 bg-white px-2.5 py-1 rounded border border-slate-200">
                      {inst.command}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Environment Variables */}
      {activeTab === "env" && (
        <div className="panel q-rise rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Environment Variables (.env.example)
              </h3>
              <p className="text-xs text-slate-500">
                Configuration template required by the backend, database connection, and frontend clients.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const fullEnv = setup.environmentVariables.map((v) => `# ${v.purpose}\n${v.key}=${v.example}`).join("\n\n");
                copyToClipboard(fullEnv, ".env file");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <Copy className="size-3.5" />
              <span>Copy .env Template</span>
            </button>
          </div>

          <div className="space-y-3">
            {setup.environmentVariables.map((env) => (
              <div
                key={env.key}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded">
                    {env.key}
                  </span>
                  <span className="text-[11px] text-slate-500">{env.purpose}</span>
                </div>
                <div className="font-mono text-xs text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  <code>{env.key}={env.example}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: File Tree Preview */}
      {activeTab === "tree" && (
        <div className="panel q-rise rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-display text-lg font-bold text-slate-900">
              Scaffolded Project Directory Tree
            </h3>
            <p className="text-xs text-slate-500">
              The organized directory hierarchy minted by the two-engine code generator.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 font-mono text-xs text-slate-300 space-y-2.5">
            {setup.fileTreePreview.map((item) => (
              <div key={item.path} className="flex items-center justify-between gap-3 py-1 border-b border-slate-800/60 last:border-none">
                <div className="flex items-center gap-2">
                  {item.path.includes("/") ? (
                    <Folder className="size-3.5 text-blue-400 shrink-0" />
                  ) : (
                    <FileText className="size-3.5 text-amber-400 shrink-0" />
                  )}
                  <span className="text-slate-100">{item.path}</span>
                </div>
                <span className="text-[11px] text-slate-500 hidden sm:inline">{item.purpose}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Dependency Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="size-4 text-blue-600" />
                <span>Add {addLayer === "backend" ? "Backend" : "Frontend"} Package</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleAddDependencySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Package Name</label>
                <input
                  type="text"
                  placeholder={addLayer === "backend" ? "e.g. redis or celery" : "e.g. framer-motion or zustand"}
                  value={newPkgName}
                  onChange={(e) => setNewPkgName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Version Constraint</label>
                <input
                  type="text"
                  placeholder="e.g. >=5.0.0 or ^4.1.0"
                  value={newPkgVersion}
                  onChange={(e) => setNewPkgVersion(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Purpose / Rationale</label>
                <input
                  type="text"
                  placeholder="Why is this library needed for your project?"
                  value={newPkgPurpose}
                  onChange={(e) => setNewPkgPurpose(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newPkgCategory}
                    onChange={(e) => setNewPkgCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="core">Core</option>
                    <option value="database">Database</option>
                    <option value="auth">Auth & Security</option>
                    <option value="utility">Utility</option>
                    <option value="testing">Testing / Dev</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPkgIsDev}
                      onChange={(e) => setNewPkgIsDev(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 size-4"
                    />
                    <span className="font-semibold text-slate-700">Dev Dependency</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 cursor-pointer shadow-md shadow-blue-500/20"
                >
                  Add Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBackToContract}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>← Back to Backend Spec</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onLockSetupAndProceed(setup)}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer transition-all disabled:opacity-50"
          >
            <ShieldCheck className="size-4" />
            <span>{isGenerating ? "Synthesizing Full-Stack App..." : "Lock Setup & Launch Two-Engine Generator →"}</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
