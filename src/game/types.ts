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
  | "cut-costs";

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

export interface PlayerAction extends NamedContent<ActionId> {
  effects: MetricEffect[];
  healthCost: number;
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
