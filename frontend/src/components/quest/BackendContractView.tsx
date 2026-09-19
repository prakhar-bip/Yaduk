import { useState } from "react";
import {
  Database,
  Server,
  Globe,
  Lock,
  Check,
  Copy,
  Download,
  Code2,
  ArrowRight,
  ArrowLeft,
  Layers,
  Key,
  FileText,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Cpu,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import type {
  BackendContractDoc,
  Blueprint,
  StudentProfile,
} from "@/lib/types";

type ActiveTab = "matrix" | "routes" | "database" | "services" | "env" | "markdown";

export function BackendContractView({
  contract,
  blueprint,
  profile,
  selectedTheme,
  onBackToTheme,
  onProceedToPrototype,
  isGenerating = false,
}: {
  contract: BackendContractDoc;
  blueprint: Blueprint;
  profile: StudentProfile;
  selectedTheme?: string | undefined;
  onBackToTheme: () => void;
  onProceedToPrototype: () => void;
  isGenerating?: boolean | undefined;
}) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("matrix");
  const [copiedDdl, setCopiedDdl] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [methodFilter, setMethodFilter] = useState<string>("ALL");
  const [expandedRoutes, setExpandedRoutes] = useState<Record<string, boolean>>({});

  const toggleRouteExpanded = (routeKey: string) => {
    setExpandedRoutes((prev) => ({
      ...prev,
      [routeKey]: !prev[routeKey],
    }));
  };

  const handleCopyDdl = () => {
    navigator.clipboard.writeText(contract.databaseSchema.rawSqlDdl);
    setCopiedDdl(true);
    toast.success("SQL DDL copied to clipboard!");
    setTimeout(() => setCopiedDdl(false), 2000);
  };

  const handleCopyEnv = () => {
    const envContent = contract.environmentVariables
      .map((ev) => `${ev.key}=${ev.example}`)
      .join("\n");
    navigator.clipboard.writeText(envContent);
    setCopiedEnv(true);
    toast.success("Environment configuration (.env) copied!");
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(contract.markdownSpec);
    setCopiedMd(true);
    toast.success("Complete backend specification markdown copied!");
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([contract.markdownSpec], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BACKEND_SPEC_${(contract.title || "project").replace(/[^a-zA-Z0-9]/g, "_")}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Downloaded BACKEND_SPEC.md!");
  };

  const filteredRoutes =
    methodFilter === "ALL"
      ? contract.apiRoutes
      : contract.apiRoutes.filter((r) => r.method === methodFilter);

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "POST":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "PUT":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "DELETE":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      {/* 1. Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Server className="size-3" />
                Step 7.5: Architecture Contract & Backend Specification
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="size-3" />
                Theme Locked: {selectedTheme || "Neo-Brutalism"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              Backend Architecture & System Contract
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Derived directly from your Blueprint features and 5 user workflow screens.
              This technical contract specifies the REST APIs, relational database DDL,
              service modules, and security parameters before code generation.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleCopyDdl}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
            >
              {copiedDdl ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
              <span>{copiedDdl ? "DDL Copied!" : "Copy SQL DDL"}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
            >
              <Download className="size-3.5" />
              <span>Export .md</span>
            </button>
            <button
              type="button"
              onClick={onProceedToPrototype}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:opacity-95 active:scale-98 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="size-3.5" />
              <span>{isGenerating ? "Forging Codebase..." : "Proceed to Code Generation →"}</span>
            </button>
          </div>
        </div>

        {/* Tech Stack Metadata Pills */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2.5 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 font-medium text-slate-700">
            <Cpu className="size-3.5 text-blue-600" />
            <span className="text-slate-400">Framework:</span>
            <span className="font-semibold text-slate-900">{contract.framework}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 font-medium text-slate-700">
            <Database className="size-3.5 text-indigo-600" />
            <span className="text-slate-400">Database:</span>
            <span className="font-semibold text-slate-900">{contract.databaseEngine}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 font-medium text-slate-700">
            <Layers className="size-3.5 text-emerald-600" />
            <span className="text-slate-400">Pattern:</span>
            <span className="font-semibold text-slate-900 truncate max-w-[280px]">
              {contract.architecturePattern}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("matrix")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "matrix"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <Globe className="size-3.5" />
          <span>Screen-to-API Matrix</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/15 font-mono">
            {contract.screenMappings.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("routes")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "routes"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <Server className="size-3.5" />
          <span>REST API Endpoints</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/15 font-mono">
            {contract.apiRoutes.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("database")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "database"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <Database className="size-3.5" />
          <span>Database & SQL DDL</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/15 font-mono">
            {contract.databaseSchema.tables.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "services"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <ShieldCheck className="size-3.5" />
          <span>Services & Security</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/15 font-mono">
            {contract.services.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("env")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "env"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <Key className="size-3.5" />
          <span>Environment (.env)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("markdown")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "markdown"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <FileText className="size-3.5" />
          <span>Full Spec Markdown</span>
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: SCREEN-TO-API MATRIX */}
      {activeTab === "matrix" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 leading-relaxed flex items-start gap-2.5">
            <Globe className="size-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Screen-to-Backend Contract:</strong> Each of the
              5 application journey screens below is wired directly to concrete backend endpoints and
              relational database entities, ensuring complete full-stack continuity.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contract.screenMappings.map((mapping, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      Step {idx + 1}
                    </span>
                    <span className="text-xs font-mono font-semibold text-blue-600">
                      {mapping.route}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 font-display mb-3">
                    {mapping.screen}
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Invoked API Endpoints:
                      </span>
                      <div className="space-y-1">
                        {mapping.apiEndpoints.map((ep, epIdx) => (
                          <div
                            key={epIdx}
                            className="font-mono text-[11px] bg-slate-50 border border-slate-200/80 px-2 py-1 rounded text-slate-700 flex items-center gap-1.5"
                          >
                            <span className="size-1.5 rounded-full bg-blue-500" />
                            <span>{ep}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Database Entities Read / Written:
                      </span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {mapping.dbEntities.map((ent, entIdx) => (
                          <span
                            key={entIdx}
                            className="font-mono text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md font-semibold"
                          >
                            {ent}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: REST API ENDPOINTS */}
      {activeTab === "routes" && (
        <div className="space-y-4">
          {/* Method Filter Buttons */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500 mr-1">Filter by Method:</span>
              {["ALL", "GET", "POST", "PUT", "DELETE"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethodFilter(m)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                    methodFilter === m
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <span className="text-xs font-medium text-slate-500">
              Showing {filteredRoutes.length} of {contract.apiRoutes.length} endpoints
            </span>
          </div>

          <div className="space-y-3">
            {filteredRoutes.map((route, idx) => {
              const routeKey = `${route.method}-${route.route}`;
              const isExpanded = Boolean(expandedRoutes[routeKey]);

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-slate-300 transition-all"
                >
                  <div
                    onClick={() => toggleRouteExpanded(routeKey)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer bg-slate-50/50 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold font-mono border ${getMethodBadgeColor(
                          route.method
                        )}`}
                      >
                        {route.method}
                      </span>
                      <div>
                        <span className="font-mono text-sm font-bold text-slate-900">
                          {route.route}
                        </span>
                        <p className="text-xs text-slate-500 mt-0.5">{route.summary}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-[11px] font-medium text-slate-500 hidden md:inline">
                        {route.screenName}
                      </span>
                      {route.authRequired ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <Lock className="size-3" />
                          JWT Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Globe className="size-3" />
                          Public
                        </span>
                      )}
                      <button
                        type="button"
                        className="p-1 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 border-t border-slate-100 bg-white space-y-3 text-xs">
                      {route.statusCodes && route.statusCodes.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            HTTP Status Codes:
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            {route.statusCodes.map((sc, scIdx) => (
                              <span
                                key={scIdx}
                                className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200"
                              >
                                <strong className="text-slate-900">{sc.code}</strong>: {sc.description}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {route.requestPayload && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Request Body JSON:
                          </span>
                          <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto">
                            {route.requestPayload}
                          </pre>
                        </div>
                      )}

                      {route.responsePayload && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Response Payload JSON:
                          </span>
                          <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto">
                            {route.responsePayload}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DATABASE & SQL DDL */}
      {activeTab === "database" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 flex items-start gap-2.5">
            <Database className="size-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Relational Database Architecture:</strong>{" "}
              {contract.databaseSchema.overview}
            </div>
          </div>

          {/* Table Cards Grid */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Relational Tables ({contract.databaseSchema.tables.length})
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {contract.databaseSchema.tables.map((tbl, tblIdx) => (
                <div
                  key={tblIdx}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs"
                >
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="size-4 text-indigo-600" />
                      <span className="font-mono text-sm font-bold text-slate-900">
                        {tbl.tableName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{tbl.description}</p>
                  </div>

                  <div className="p-4 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-mono text-[10px] uppercase">
                          <th className="pb-2">Column Name</th>
                          <th className="pb-2">Data Type</th>
                          <th className="pb-2">Key / Constraints</th>
                          <th className="pb-2">Nullable</th>
                          <th className="pb-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {tbl.columns.map((col, colIdx) => (
                          <tr key={colIdx} className="hover:bg-slate-50/80">
                            <td className="py-2 font-bold text-slate-900">{col.name}</td>
                            <td className="py-2 text-indigo-700">{col.type}</td>
                            <td className="py-2">
                              {col.isPrimary && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold mr-1">
                                  PK
                                </span>
                              )}
                              {col.isForeign && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                                  FK → {col.references}
                                </span>
                              )}
                            </td>
                            <td className="py-2 text-slate-500">
                              {col.nullable ? "YES" : "NOT NULL"}
                            </td>
                            <td className="py-2 font-sans text-slate-600 text-[11px]">
                              {col.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {tbl.indexes && tbl.indexes.length > 0 && (
                    <div className="px-4 py-2.5 bg-slate-50/50 border-t border-slate-100 flex items-center gap-2 text-xs">
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                        Indexes:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {tbl.indexes.map((idxStr, iIdx) => (
                          <span
                            key={iIdx}
                            className="font-mono text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600"
                          >
                            {idxStr}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Raw SQL DDL Code View */}
          <div className="rounded-xl border border-slate-200 bg-slate-900 overflow-hidden shadow-md">
            <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 text-xs font-mono font-semibold">
                <Code2 className="size-4 text-emerald-400" />
                <span>Production SQL DDL Script (schema.sql)</span>
              </div>
              <button
                type="button"
                onClick={handleCopyDdl}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-700 text-slate-200 hover:bg-slate-600 transition-all cursor-pointer"
              >
                {copiedDdl ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                <span>{copiedDdl ? "Copied!" : "Copy SQL"}</span>
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed max-h-[420px]">
              {contract.databaseSchema.rawSqlDdl}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: SERVICES & SECURITY */}
      {activeTab === "services" && (
        <div className="space-y-6">
          {/* Security Specification Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="size-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900 font-display">
                Authentication & Security Architecture
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 font-mono text-[10px] uppercase block mb-1">
                  Auth Strategy:
                </span>
                <span className="font-semibold text-slate-800 leading-relaxed block">
                  {contract.securitySpec.authStrategy}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 font-mono text-[10px] uppercase block mb-1">
                  Token Expiry & Rotation:
                </span>
                <span className="font-semibold text-slate-800 leading-relaxed block">
                  {contract.securitySpec.tokenExpiry}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 font-mono text-[10px] uppercase block mb-1">
                  Password Hashing:
                </span>
                <span className="font-semibold text-slate-800 leading-relaxed block">
                  {contract.securitySpec.passwordHashing}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 font-mono text-[10px] uppercase block mb-1">
                  Access Control (RBAC):
                </span>
                <span className="font-semibold text-slate-800 leading-relaxed block">
                  {contract.securitySpec.rbacDescription}
                </span>
              </div>
            </div>
          </div>

          {/* Backend Service Modules Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Backend Service Layer ({contract.services.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contract.services.map((srv, srvIdx) => (
                <div
                  key={srvIdx}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="size-4 text-blue-600" />
                      <h4 className="text-sm font-bold text-slate-900 font-display">
                        {srv.name}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">{srv.purpose}</p>

                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Key Responsibilities:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {srv.responsibilities.map((resp, rIdx) => (
                        <li key={rIdx} className="flex items-start gap-1.5">
                          <span className="text-blue-500 font-bold">•</span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Associated Routes:
                    </span>
                    <div className="flex items-center gap-1 flex-wrap">
                      {srv.associatedRoutes.map((rt, rtIdx) => (
                        <span
                          key={rtIdx}
                          className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {rt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ENVIRONMENT (.env) */}
      {activeTab === "env" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Standardized environment configuration required to run the backend and database.
            </p>
            <button
              type="button"
              onClick={handleCopyEnv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              {copiedEnv ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
              <span>{copiedEnv ? "Copied!" : "Copy .env File"}</span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-mono text-[10px] uppercase">
                  <th className="p-3">Variable Name</th>
                  <th className="p-3">Default Example Value</th>
                  <th className="p-3">Purpose / Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {contract.environmentVariables.map((ev, evIdx) => (
                  <tr key={evIdx} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-blue-700">{ev.key}</td>
                    <td className="p-3 text-slate-800">{ev.example}</td>
                    <td className="p-3 font-sans text-slate-600 text-[11px]">{ev.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: FULL SPEC MARKDOWN */}
      {activeTab === "markdown" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Complete, export-ready Technical Design Document (TDD) for project documentation and viva defense.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
              >
                {copiedMd ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                <span>{copiedMd ? "Copied!" : "Copy Markdown"}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer"
              >
                <Download className="size-3.5" />
                <span>Download .md</span>
              </button>
            </div>
          </div>

          <pre className="p-5 rounded-xl border border-slate-200 bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed max-h-[500px]">
            {contract.markdownSpec}
          </pre>
        </div>
      )}

      {/* 4. Bottom Action Dock */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onBackToTheme}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="size-3.5" />
          <span>← Back to Theme Studio</span>
        </button>

        <button
          type="button"
          onClick={onProceedToPrototype}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:opacity-95 active:scale-98 shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="size-3.5" />
          <span>{isGenerating ? "Forging Codebase..." : "Proceed to Code Generation →"}</span>
        </button>
      </div>
    </div>
  );
}
