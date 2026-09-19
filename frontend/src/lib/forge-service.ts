import type { Blueprint, ProductionCodebase, PrototypeData, PrototypeFile, StudentProfile } from "./types";

export interface GitHubRepoConfig {
  name: string;
  description: string;
  isPrivate: boolean;
  token: string;
  includeWorkflows?: boolean;
}

export interface ForgeProgressCallback {
  (step: "validating" | "creating_repo" | "building_tree" | "committing" | "finalizing" | "success" | "error", message: string): void;
}

export interface ForgeResult {
  success: boolean;
  repoUrl?: string;
  cloneUrl?: string;
  defaultBranch?: string;
  error?: string;
}

/**
 * Normalizes project files from either starter prototype or full production codebase
 * into a complete, runnable full-stack / frontend workspace.
 */
export function buildForgeFileTree(options: {
  prototype: PrototypeData;
  blueprint?: Blueprint | null;
  profile?: StudentProfile | null;
  productionCodebase?: ProductionCodebase | null;
}): Record<string, string> {
  const { prototype, blueprint, profile, productionCodebase } = options;
  const files: Record<string, string> = {};

  const projectTitle = prototype?.title || blueprint?.title || "Yaduk Project";
  const projectSlug = projectTitle.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  const projectSummary = prototype?.architectureSummary || blueprint?.overview?.summary || "Project crafted with Yaduk AI by Yaduka";

  // 1. Check if production codebase files exist
  const sourceFiles: PrototypeFile[] =
    productionCodebase && productionCodebase.files.length > 0
      ? productionCodebase.files
      : prototype?.codeFiles || [];

  for (const f of sourceFiles) {
    if (f?.path && typeof f?.code === "string") {
      const cleanPath = f.path.replace(/^[/\\]+/, "");
      files[cleanPath] = f.code;
    }
  }

  // 2. Ensure package.json exists if web frontend files are present
  const hasPackageJson = Object.keys(files).some((p) => p.endsWith("package.json"));
  if (!hasPackageJson) {
    const pkgObj = {
      name: projectSlug,
      private: true,
      version: "0.1.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "tsc && vite build",
        preview: "vite preview",
      },
      dependencies: {
        react: "^18.3.1",
        "react-dom": "^18.3.1",
        "lucide-react": "^0.395.0",
        axios: "^1.7.2",
      },
      devDependencies: {
        "@types/react": "^18.3.3",
        "@types/react-dom": "^18.3.0",
        "@vitejs/plugin-react": "^4.3.1",
        typescript: "^5.4.5",
        vite: "^5.3.1",
      },
    };
    files["package.json"] = JSON.stringify(pkgObj, null, 2);
  }

  // 3. Ensure index.html
  const hasIndexHtml = Object.keys(files).some((p) => p.endsWith("index.html"));
  if (!hasIndexHtml) {
    files["index.html"] = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectTitle}</title>
    <link rel="icon" type="image/svg+xml" href="https://lucide.dev/favicon.ico" />
  </head>
  <body class="bg-slate-50 text-slate-900 antialiased min-h-screen">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
  }

  // 4. Ensure src/main.tsx if src/App.tsx exists but not main.tsx
  const hasMain = Object.keys(files).some((p) => p.endsWith("main.tsx") || p.endsWith("main.jsx"));
  if (!hasMain) {
    const appPath = Object.keys(files).find((p) => p.endsWith("App.tsx") || p.endsWith("App.jsx"));
    const importApp = appPath ? (appPath.startsWith("src/") ? "./App" : `./${appPath}`) : "./App";
    files["src/main.tsx"] = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '${importApp}';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
  }

  // 5. Ensure index.css
  const hasCss = Object.keys(files).some((p) => p.endsWith("index.css") || p.endsWith("style.css"));
  if (!hasCss) {
    files["src/index.css"] = `@layer base {
  body {
    margin: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }
}`;
  }

  // 6. Ensure vite.config.ts
  const hasViteConfig = Object.keys(files).some((p) => p.includes("vite.config"));
  if (!hasViteConfig) {
    files["vite.config.ts"] = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
});`;
  }

  // 7. Ensure tsconfig.json
  const hasTsConfig = Object.keys(files).some((p) => p.includes("tsconfig.json"));
  if (!hasTsConfig) {
    files["tsconfig.json"] = `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": false
  },
  "include": ["src"]
}`;
  }

  // 8. Ensure .gitignore
  if (!files[".gitignore"]) {
    files[".gitignore"] = `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing & Coverage
coverage/

# Production build artifacts
dist/
build/

# Misc
.DS_Store
*.pem

# Local Environment Variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Python
__pycache__/
*.py[cod]
*$py.class
venv/
.venv/
env/
`;
  }

  // 9. Ensure comprehensive README.md
  if (!files["README.md"]) {
    const techStackSection = blueprint?.stack
      ? blueprint.stack.map((t) => `- **${t.name}** (${t.category}): ${t.why}`).join("\n")
      : "- Modern React + TypeScript\n- Vite Development Server\n- Tailwind CSS / Lucide Icons";

    const mvpFeaturesSection = blueprint?.mvpFeatures
      ? blueprint.mvpFeatures.map((f) => `- **${f.name}**: ${f.detail}`).join("\n")
      : "- Core interactive user workflows and responsive dashboard interface.";

    files["README.md"] = `# 🦚 ${projectTitle}

> ${projectSummary}

[![Built with Yaduk AI](https://img.shields.io/badge/Architected%20by-Yaduk%20AI%20(Yaduka)-0284c7.svg)](https://github.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-007acc.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18.0 or higher recommended)
- npm or pnpm or yarn

### 1. Installation
\`\`\`bash
npm install
\`\`\`

### 2. Development Server
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:5173](http://localhost:5173) in your browser to start developing!

### 3. Production Build
\`\`\`bash
npm run build
\`\`\`

---

## 🛠️ Architecture & Tech Stack

${techStackSection}

---

## 🎯 MVP Feature Scope

${mvpFeaturesSection}

---

## 🏛️ Generated with Yaduk AI (by Yaduka)
*Crafted for student innovators and capstone creators.*
`;
  }

  // 10. Ensure CI/CD Workflow (.github/workflows/ci.yml)
  if (!files[".github/workflows/ci.yml"]) {
    files[".github/workflows/ci.yml"] = `name: Yaduk CI Build & Verify

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci || npm install

      - name: TypeScript Build Check
        run: npm run build
`;
  }

  // 11. Ensure LICENSE
  if (!files["LICENSE"]) {
    const year = new Date().getFullYear();
    const student = profile?.name || "Student Innovator";
    files["LICENSE"] = `MIT License

Copyright (c) ${year} ${student}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
  }

  return files;
}

/**
 * Launch an interactive WebContainer workspace on StackBlitz
 * using the official StackBlitz POST API.
 */
export function launchStackBlitzProject(options: {
  title: string;
  description: string;
  files: Record<string, string>;
}) {
  const { title, description, files } = options;

  // Create an invisible form to POST to https://stackblitz.com/run
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "https://stackblitz.com/run";
  form.target = "_blank";

  const appendField = (name: string, value: string) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  };

  appendField("project[title]", title);
  appendField("project[description]", description);
  appendField("project[template]", "node");

  // Filter out any unwanted paths or binary files, only send text files
  for (const [path, content] of Object.entries(files)) {
    if (typeof content === "string") {
      appendField(`project[files][${path}]`, content);
    }
  }

  document.body.appendChild(form);
  form.submit();

  window.setTimeout(() => {
    if (document.body.contains(form)) {
      document.body.removeChild(form);
    }
  }, 2000);
}

/**
 * Push all files directly to a new or existing GitHub Repository using
 * the official GitHub REST Git Data API.
 */
export async function pushToGitHubRepo(
  config: GitHubRepoConfig,
  files: Record<string, string>,
  onProgress?: ForgeProgressCallback
): Promise<ForgeResult> {
  const token = config.token.trim();
  if (!token) {
    return { success: false, error: "GitHub Personal Access Token is required." };
  }

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };

  try {
    // 1. Verify User
    onProgress?.("validating", "Validating GitHub credentials...");
    const userRes = await fetch("https://api.github.com/user", { headers: authHeaders });
    if (!userRes.ok) {
      if (userRes.status === 401) {
        throw new Error("Invalid GitHub token. Please verify your token has 'repo' permissions.");
      }
      throw new Error(`GitHub Authentication failed: HTTP ${userRes.status}`);
    }
    const userData = await userRes.json();
    const owner = userData.login;

    // 2. Create the Repository
    onProgress?.("creating_repo", `Creating repository '${config.name}' under @${owner}...`);
    const createRepoRes = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: config.name,
        description: config.description || "Scaffolded with Yaduk AI Architect by Yaduka",
        private: config.isPrivate,
        auto_init: true, // initializes with an initial commit on 'main'
      }),
    });

    let repoData: any;
    if (createRepoRes.ok) {
      repoData = await createRepoRes.json();
    } else {
      const errorData = await createRepoRes.json().catch(() => ({}));
      // Check if repo already exists
      if (
        createRepoRes.status === 422 &&
        errorData.errors?.some((e: any) => e.message?.includes("already exists"))
      ) {
        onProgress?.("creating_repo", `Repository '${config.name}' already exists. Preparing update...`);
        const fetchExisting = await fetch(`https://api.github.com/repos/${owner}/${config.name}`, {
          headers: authHeaders,
        });
        if (!fetchExisting.ok) {
          throw new Error(`Repository '${config.name}' exists but could not be accessed.`);
        }
        repoData = await fetchExisting.json();
      } else {
        throw new Error(errorData.message || `Failed to create repository: HTTP ${createRepoRes.status}`);
      }
    }

    const repoName = repoData.name;
    const defaultBranch = repoData.default_branch || "main";

    // Allow GitHub's internal database 1.5 seconds to propagate the newly initialized branch
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 3. Get Reference to latest commit on default branch
    onProgress?.("building_tree", `Fetching default branch (${defaultBranch}) HEAD...`);
    const refRes = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/git/ref/heads/${defaultBranch}`,
      { headers: authHeaders }
    );

    let baseCommitSha: string | null = null;
    let baseTreeSha: string | null = null;

    if (refRes.ok) {
      const refData = await refRes.json();
      baseCommitSha = refData.object?.sha || null;
      if (baseCommitSha) {
        const commitRes = await fetch(
          `https://api.github.com/repos/${owner}/${repoName}/git/commits/${baseCommitSha}`,
          { headers: authHeaders }
        );
        if (commitRes.ok) {
          const commitData = await commitRes.json();
          baseTreeSha = commitData.tree?.sha || null;
        }
      }
    }

    // 4. Construct Git Tree with all files
    onProgress?.("building_tree", `Packaging ${Object.keys(files).length} project files...`);
    const treeItems = Object.entries(files).map(([path, content]) => ({
      path,
      mode: "100644",
      type: "blob",
      content,
    }));

    const treePayload: any = {
      tree: treeItems,
    };
    if (baseTreeSha) {
      treePayload.base_tree = baseTreeSha;
    }

    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/trees`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(treePayload),
    });

    if (!treeRes.ok) {
      const treeErr = await treeRes.json().catch(() => ({}));
      throw new Error(treeErr.message || `Failed to create Git tree: HTTP ${treeRes.status}`);
    }

    const treeData = await treeRes.json();
    const newTreeSha = treeData.sha;

    // 5. Create Commit
    onProgress?.("committing", "Creating Git commit: 'Initial commit: Yaduk AI Forge'...");
    const commitPayload: any = {
      message: "Initial commit: Architecture & starter codebase forged with Yaduk AI by Yaduka",
      tree: newTreeSha,
      parents: baseCommitSha ? [baseCommitSha] : [],
    };

    const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/commits`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(commitPayload),
    });

    if (!commitRes.ok) {
      const commitErr = await commitRes.json().catch(() => ({}));
      throw new Error(commitErr.message || `Failed to create commit: HTTP ${commitRes.status}`);
    }

    const commitData = await commitRes.json();
    const newCommitSha = commitData.sha;

    // 6. Update Branch Reference
    onProgress?.("finalizing", `Updating ${defaultBranch} branch pointer...`);
    let updateRefRes = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/git/refs/heads/${defaultBranch}`,
      {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({
          sha: newCommitSha,
          force: true,
        }),
      }
    );

    // If ref didn't exist yet, create it
    if (!updateRefRes.ok && updateRefRes.status === 404) {
      updateRefRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/refs`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          ref: `refs/heads/${defaultBranch}`,
          sha: newCommitSha,
        }),
      });
    }

    if (!updateRefRes.ok) {
      const refErr = await updateRefRes.json().catch(() => ({}));
      throw new Error(refErr.message || `Failed to update branch reference: HTTP ${updateRefRes.status}`);
    }

    onProgress?.("success", "Successfully forged repository on GitHub!");

    return {
      success: true,
      repoUrl: repoData.html_url,
      cloneUrl: repoData.clone_url,
      defaultBranch,
    };
  } catch (err: any) {
    const msg = err instanceof Error ? err.message : String(err);
    onProgress?.("error", msg);
    return { success: false, error: msg };
  }
}

/**
 * Generate terminal commands for students who prefer running standard
 * git or GitHub CLI (gh) on their own local machine.
 */
export function generateGitQuickstartScript(options: {
  repoName: string;
  isPrivate: boolean;
  format: "bash" | "powershell";
}): string {
  const { repoName, isPrivate, format } = options;
  const visibilityFlag = isPrivate ? "--private" : "--public";

  if (format === "powershell") {
    return `# 1. Create and enter your project folder
New-Item -ItemType Directory -Force -Path "./${repoName}" | Out-Null
Set-Location "./${repoName}"

# 2. Extract your downloaded Yaduk starter ZIP here, then initialize Git:
git init -b main
git add .
git commit -m "Initial commit from Yaduk AI Architecture Forge by Yaduka"

# 3. Use the official GitHub CLI to forge and push your repository in 1 step:
gh repo create ${repoName} ${visibilityFlag} --source=. --remote=origin --push

# (Or link to an existing repository):
# git remote add origin https://github.com/<your-username>/${repoName}.git
# git push -u origin main
`;
  }

  return `#!/usr/bin/env bash
# 1. Create and enter your project folder
mkdir -p "${repoName}" && cd "${repoName}"

# 2. Extract your downloaded Yaduk starter ZIP here, then initialize Git:
git init -b main
git add .
git commit -m "Initial commit from Yaduk AI Architecture Forge by Yaduka"

# 3. Use GitHub CLI to create and push your remote repository:
gh repo create "${repoName}" ${visibilityFlag} --source=. --remote=origin --push

# (Or link to an existing repository):
# git remote add origin "https://github.com/<your-username>/${repoName}.git"
# git push -u origin main
`;
}
