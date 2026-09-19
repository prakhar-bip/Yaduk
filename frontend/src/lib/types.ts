export type StudentProfile = {
  name: string;
  fieldOfStudy: string;
  yearOfStudy: string;
  skills: string[];
  languages: string[];
  frameworks: string[];
  aiKnowledge: string;
  previousProjects: string;
  experienceLevel: string;
  interests: string[];
  domains: string[];
  careerGoal: string;
  projectType: string;
  hoursPerWeek: number;
  weeks: number;
  teamSize: string;
  resources: string[];
  complexity: string;
  ownIdeas: string;
  summary?: string;
  strengths?: string[];
  watchOuts?: string[];
};

export type MatchScores = {
  skill: number;
  interest: number;
  feasibility: number;
  career: number;
  portfolio: number;
  time: number;
};

export type ProjectIdea = {
  id: string;
  name: string;
  tagline: string;
  problem: string;
  solution: string;
  targetUsers: string;
  difficulty: string;
  estimatedTime: string;
  requiredSkills: string[];
  match: MatchScores;
  overall: number;
  why: string;
  rarity?: "common" | "rare" | "epic" | "legendary";
};

export type Feasibility = {
  achievable: boolean;
  verdict: string;
  reasoning: string;
  skillGaps: string[];
  timeVerdict: string;
  resourceVerdict: string;
  simplified: { name: string; summary: string };
  learningRoadmap: { skill: string; how: string; weeks: number }[];
  alternative: { name: string; summary: string };
};

export type UserWorkflowStep = {
  step: number;
  screen: string;
  route: string;
  userAction: string;
  keyComponents: string[];
};

export type Blueprint = {
  id?: string;
  title: string;
  overview: {
    summary: string;
    problemStatement: string;
    proposedSolution: string;
    objectives: string[];
    targetUsers: string;
    expectedImpact: string;
  };
  mvpFeatures: { name: string; detail: string }[];
  advancedFeatures: { name: string; detail: string }[];
  futureImprovements: string[];
  stack: { name: string; category: string; why: string; howUsed: string; isNew: boolean }[];
  architecture: { layers: { name: string; parts: string[] }[]; dataFlow: string };
  userWorkflow?: UserWorkflowStep[];
  roadmap: { phase: string; title: string; weeks: string; tasks: string[] }[];
  challenges: { challenge: string; solution: string }[];
};

export type Stage =
  | "intro"
  | "discovery"
  | "profile"
  | "ideas"
  | "feasibility"
  | "blueprint"
  | "theme"
  | "contract"
  | "mentor";


export type ApiRouteSpec = {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  route: string;
  screenName: string;
  summary: string;
  authRequired: boolean;
  requestPayload?: string;
  responsePayload?: string;
  statusCodes?: { code: number; description: string }[];
};

export type DatabaseColumnSpec = {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  references?: string;
  nullable?: boolean;
  description?: string;
};

export type DatabaseTableSpec = {
  tableName: string;
  description: string;
  columns: DatabaseColumnSpec[];
  indexes?: string[];
};

export type BackendServiceSpec = {
  name: string;
  purpose: string;
  responsibilities: string[];
  associatedRoutes: string[];
};

export type BackendContractDoc = {
  title: string;
  framework: string;
  databaseEngine: string;
  architecturePattern: string;
  screenMappings: {
    screen: string;
    route: string;
    apiEndpoints: string[];
    dbEntities: string[];
  }[];
  apiRoutes: ApiRouteSpec[];
  databaseSchema: {
    overview: string;
    tables: DatabaseTableSpec[];
    rawSqlDdl: string;
  };
  services: BackendServiceSpec[];
  securitySpec: {
    authStrategy: string;
    tokenExpiry: string;
    passwordHashing: string;
    rbacDescription?: string;
  };
  environmentVariables: {
    key: string;
    example: string;
    purpose: string;
  }[];
  markdownSpec: string;
};

export type JourneyState = {
  stage: Stage;
  profile: StudentProfile | null;
  ideas: ProjectIdea[];
  selectedIdeaId: string | null;
  feedbackLog: string[];
  feasibility: Feasibility | null;
  blueprint: Blueprint | null;
  selectedTheme?: string | undefined;
  backendContract?: BackendContractDoc | null | undefined;
  scroll: QuestScroll | null;
  changeLog: string[];
  xp: number;
  badges: string[];
};

export const emptyJourney: JourneyState = {
  stage: "intro",
  profile: null,
  ideas: [],
  selectedIdeaId: null,
  feedbackLog: [],
  feasibility: null,
  blueprint: null,
  selectedTheme: undefined,
  backendContract: null,
  scroll: null,
  changeLog: [],
  xp: 0,
  badges: [],
};

export const BADGES: Record<string, { label: string; hint: string }> = {
  explorer: { label: "Profile", hint: "Finished the discovery questions" },
  strategist: { label: "Ideas", hint: "Generated your first set of ideas" },
  tinkerer: { label: "Refined", hint: "Refined the ideas with your feedback" },
  realist: { label: "Checked", hint: "Ran a reality check on your project" },
  architect: { label: "Plan", hint: "Unlocked your full project plan" },
  stylist: { label: "Theme", hint: "Crafted the visual identity of your software" },
  engineer: { label: "Contract", hint: "Inspected and locked the backend API & database contracts" },
  apprentice: { label: "Mentor", hint: "Talked things through with your mentor" },
  shipwright: { label: "Updated", hint: "Updated the plan after a mentor chat" },
  loremaster: { label: "Summary", hint: "Created a short summary of your plan" },
};

export function levelFromXp(xp: number) {
  const level = Math.floor(xp / 250) + 1;
  const into = xp % 250;
  return { level, into, needed: 250, pct: Math.round((into / 250) * 100) };
}

export type QuestScroll = {
  tldr: string;
  pitch: string;
  keyMoves: { move: string; why: string }[];
  loadout: string[];
  nextThreeMoves: string[];
  bossRisks: string[];
};

export type AuthUser = {
  id: number | string;
  email: string;
  fullName: string;
  isGuest?: boolean | undefined;
  createdAt?: string | undefined;
};
