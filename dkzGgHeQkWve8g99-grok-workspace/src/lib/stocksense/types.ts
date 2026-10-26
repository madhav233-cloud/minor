export type Horizon = "1m" | "3m" | "12m";
export type Stance = "bullish" | "neutral" | "bearish" | "insufficient_data";
export type RiskLevel = "low" | "moderate" | "elevated" | "high" | "insufficient_data";
export type Pole = "support" | "caution" | "context";
export type AgentId = "technical" | "news" | "fundamental" | "risk";

export const STANCE_THRESHOLD = 0.22;

export const HORIZON_META: Record<
  Horizon,
  { label: string; short: string; days: number; blurb: string }
> = {
  "1m": {
    label: "1 month",
    short: "1M",
    days: 21,
    blurb: "Near-term price and headlines weigh more than the annual statements.",
  },
  "3m": {
    label: "3 months",
    short: "3M",
    days: 63,
    blurb: "Momentum, headlines, and the business share the decision.",
  },
  "12m": {
    label: "12 months",
    short: "12M",
    days: 252,
    blurb: "The business and valuation weigh more than short-term momentum.",
  },
};

export interface EvidenceItem {
  id: string;
  claim: string;
  source: string;
  observedAt: string | null;
  sourceUrl: string | null;
  pole: Pole;
}

export interface MetricRow {
  label: string;
  value: string;
}

export interface AnalystReport {
  agent: AgentId;
  title: string;
  assessment: Stance;
  signal: number | null;
  riskLevel: RiskLevel | null;
  summary: string;
  evidence: EvidenceItem[];
  limitations: string[];
  dataAsOf: string | null;
  metrics: MetricRow[];
}

export interface Disagreement {
  title: string;
  detail: string;
  agents: string[];
}

export interface WeightRow {
  agent: string;
  weight: number;
  stance: Stance;
  signal: number;
}

export interface CommitteeReport {
  assessment: Stance;
  riskLevel: RiskLevel;
  summary: string;
  supporting: string[];
  opposing: string[];
  disagreements: Disagreement[];
  missing: string[];
  changeConditions: string[];
  weights: WeightRow[];
  rawScore: number | null;
  finalScore: number | null;
  capNote: string | null;
  narrativeSource: "rules";
}

export interface SeriesPoint {
  d: string;
  c: number;
}

export interface Headline {
  title: string;
  publisher: string;
  url: string | null;
  publishedAt: string | null;
  sentiment: number;
  events: string[];
}

export interface MetricPack {
  name: string;
  symbol: string;
  exchange: string;
  currency: string;
  sector: string | null;
  industry: string | null;
  instrument: string | null;
  last: number | null;
  prev: number | null;
  dayChange: number | null;
  sma20: number | null;
  sma50: number | null;
  rsi: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHist: number | null;
  macdCross: "bullish" | "bearish" | "none";
  atr: number | null;
  volumeChange: number | null;
  return21: number | null;
  return63: number | null;
  return252: number | null;
  bars: number;
  priceAsOf: string | null;
  vol252: number | null;
  volSample: number;
  mddHorizon: number | null;
  mddFull: number | null;
  var95: number | null;
  varSample: number;
  beta: number | null;
  drift: number | null;
  driftLow: number | null;
  driftHigh: number | null;
  driftSample: number;
  newsScore: number | null;
  newsCount: number;
  severeNegative: boolean;
  headlines: Headline[];
  revenueGrowth: number | null;
  earningsGrowth: number | null;
  revenueGrowthDetail: string | null;
  earningsGrowthDetail: string | null;
  operatingMargin: number | null;
  profitMargin: number | null;
  grossMargin: number | null;
  roe: number | null;
  debtToEquity: number | null;
  trailingPE: number | null;
  priceToBook: number | null;
  evToEbitda: number | null;
  revenue: number | null;
  priorRevenue: number | null;
  netIncome: number | null;
  priorNetIncome: number | null;
  totalDebt: number | null;
  totalCash: number | null;
  statementAsOf: string | null;
  priorStatementAsOf: string | null;
  statementCount: number;
  isFinancial: boolean;
  fundamentalsAvailable: boolean;
  warnings: string[];
}

export interface ModelProse {
  technical: string | null;
  news: string | null;
  fundamental: string | null;
  risk: string | null;
  committee: string | null;
  changeConditions: string[] | null;
}

export interface AnalysisBundle {
  id: string;
  generatedAt: string;
  horizon: Horizon;
  company: {
    symbol: string;
    name: string;
    exchange: string;
    currency: string;
    sector: string | null;
    industry: string | null;
    instrument: string | null;
  };
  pack: MetricPack;
  reports: Record<AgentId, AnalystReport>;
  committee: CommitteeReport;
  series: SeriesPoint[];
  modelProse: ModelProse | null;
  modelNote: string | null;
}

export interface ScenarioInput {
  revenueGrowthDelta: number;
  volMultiplier: number;
  newsShift: number;
}

export const NEUTRAL_SCENARIO: ScenarioInput = {
  revenueGrowthDelta: 0,
  volMultiplier: 1,
  newsShift: 0,
};

export function scenarioActive(s: ScenarioInput): boolean {
  return (
    Math.abs(s.revenueGrowthDelta) > 0.0001 ||
    Math.abs(s.volMultiplier - 1) > 0.001 ||
    Math.abs(s.newsShift) > 0.001
  );
}
