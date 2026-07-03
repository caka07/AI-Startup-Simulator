export type Quarter = 1 | 2 | 3 | 4;

export type MetricId =
  | "cash"
  | "runway"
  | "arr"
  | "mrr"
  | "pmf"
  | "modelPower"
  | "productQuality"
  | "computeSupply"
  | "computeCost"
  | "grossMargin"
  | "techDebt"
  | "reputation"
  | "morale"
  | "complianceRisk"
  | "globalReadiness"
  | "boardPressure"
  | "founderHealth"
  | "founderEquity"
  | "valuation"
  | "marketHeat";

export type CompanyMetrics = Record<MetricId, number>;

export type FounderAttributeId =
  | "tech"
  | "sales"
  | "fundraising"
  | "management"
  | "ethics"
  | "stamina"
  | "hype"
  | "luck";

export type FounderAttributes = Record<FounderAttributeId, number>;

export type BackgroundId =
  | "ex-bigtech-pm"
  | "former-llm-researcher"
  | "serial-founder"
  | "overseas-phd"
  | "open-source-maintainer"
  | "failed-incubation-team"
  | "rich-kid-founder"
  | "indie-hacker";

export type TrackId =
  | "foundation-model"
  | "ai-agent"
  | "ai-coding"
  | "enterprise-knowledge"
  | "ai-education"
  | "ai-companion"
  | "ai-hardware"
  | "ai-security"
  | "medical-ai"
  | "finance-ai"
  | "manufacturing-ai"
  | "local-life-agent";

export type AttributePresetId = "operator" | "researcher" | "rainmaker" | "global";

export type MarketId = "china" | "sea" | "middle-east" | "europe" | "us";

export type FactionId =
  | "deepduck"
  | "openmind"
  | "moralmachine"
  | "green-furnace"
  | "cloudsoft"
  | "byteplanet"
  | "tencentacle"
  | "alicloud-temple";

export type InvestorId =
  | "alice-chen"
  | "old-zhou"
  | "maya-cloud"
  | "victor-furnace"
  | "omar-oasis"
  | "ms-lin"
  | "kevin-founder"
  | "grace-ma"
  | "leo-banker"
  | "nora-open"
  | "byteplanet-capital"
  | "hard-term-capital";

export type EmployeeRoleId =
  | "researcher"
  | "engineer"
  | "product-manager"
  | "sales"
  | "compliance"
  | "finance"
  | "cfo"
  | "overseas-bd";

export type EmployeeOperationId =
  | "raise-salary"
  | "refresh-options"
  | "pua-incentive"
  | "vacation"
  | "layoff";

export type FounderActionId =
  | "deep-work"
  | "investor-dinner"
  | "customer-roadtrip"
  | "take-vacation"
  | "public-thread"
  | "therapy";

export type ActionId =
  | "build-product"
  | "train-model"
  | "sell"
  | "fundraise"
  | "hire"
  | "retain"
  | "govern-compliance"
  | "expand-global"
  | "pr-launch"
  | "cut-costs"
  | "publish-paper"
  | "buy-compute"
  | "open-source-model"
  | "security-audit"
  | "poach-researcher"
  | "academic-fraud"
  | "gray-data-deal"
  | "inflate-arr";

export type ActionCategory = "research" | "product" | "commercial" | "finance" | "people" | "global" | "risk";

export type AchievementId = string;
export type EndingId = string;
export type EventId = string;

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRoleId;
  level: "junior" | "mid" | "senior" | "lead" | "cxo";
  ability: number;
  salary: number;
  options: number;
  loyalty: number;
  ambition: number;
  fatigue: number;
  scarcity: number;
  tags: string[];
}

export interface FounderProfile {
  name: string;
  backgroundId: BackgroundId;
  trackId: TrackId;
  attributes: FounderAttributes;
}

export interface MarketState {
  id: MarketId;
  unlocked: boolean;
  revenueShare: number;
  localization: number;
}

export interface GameState {
  seed: number;
  year: number;
  quarter: Quarter;
  founder: FounderProfile;
  metrics: CompanyMetrics;
  employees: Employee[];
  markets: Record<MarketId, MarketState>;
  investorRelations: Record<InvestorId, number>;
  factionRelations: Record<FactionId, number>;
  completedAchievements: AchievementId[];
  resolvedEventIds: EventId[];
  endingId: EndingId | null;
  log: string[];
}

export interface NewGameInput {
  seed: number;
  founderName: string;
  backgroundId: BackgroundId;
  trackId: TrackId;
  presetId?: AttributePresetId;
  attributes?: FounderAttributes;
}

export interface MetricEffect {
  metric: MetricId;
  delta: number;
}

export interface ActionEfficiencyRule {
  attributes?: Partial<Record<FounderAttributeId, number>>;
  metrics?: Partial<Record<MetricId, number>>;
}

export interface Condition {
  metric: MetricId;
  op: ">=" | ">" | "<=" | "<" | "===";
  value: number;
}

export interface NamedContent<TId extends string = string> {
  id: TId;
  name: string;
  description: string;
}

export interface Faction extends NamedContent<FactionId> {
  role: string;
  pressure: string;
}

export interface Investor extends NamedContent<InvestorId> {
  type: string;
  likes: string[];
  hates: string[];
  termStyle: "friendly" | "normal" | "pressure" | "predatory";
}

export interface EmployeeRole extends NamedContent<EmployeeRoleId> {
  salaryBase: number;
  strengths: MetricEffect[];
  risks: string[];
}

export interface FounderAction extends NamedContent<FounderActionId> {
  effects: MetricEffect[];
  attributeEffects: Partial<Record<FounderAttributeId, number>>;
}

export interface PlayerAction extends NamedContent<ActionId> {
  category: ActionCategory;
  risk: "low" | "medium" | "high" | "extreme";
  effects: MetricEffect[];
  healthCost: number;
  efficiency: ActionEfficiencyRule;
  visibleSummary: string[];
}

export interface EmployeeOperationAssignment {
  employeeId: string;
  operationId: EmployeeOperationId;
}

export interface TurnSubmission {
  companyActions: ActionId[];
  extraCompanyAction?: ActionId | null;
  founderAction?: FounderActionId | null;
  employeeOperations?: EmployeeOperationAssignment[];
}

export interface ActionPreview {
  actionId: ActionId;
  efficiencyMultiplier: number;
  effects: MetricEffect[];
  summary: string[];
}

export interface GameEventChoice {
  id: string;
  label: string;
  effects: MetricEffect[];
  log: string;
}

export interface GameEvent {
  id: EventId;
  title: string;
  category: "funding" | "employee" | "giant" | "customer" | "regulation" | "tech" | "pr" | "global" | "health";
  trigger: Condition[];
  choices: GameEventChoice[];
}

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  conditionText: string;
  tier: "普通" | "稀有" | "史诗" | "隐藏";
  hiddenCondition?: boolean;
  trigger: Condition[];
}

export interface Ending {
  id: EndingId;
  name: string;
  description: string;
  priority: number;
  trigger: Condition[];
}
