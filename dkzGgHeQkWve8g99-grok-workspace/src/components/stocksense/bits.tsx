import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { riskLabel, stanceLabel } from "@/lib/stocksense/format";
import type { AgentId, AnalysisBundle, AnalystReport, RiskLevel, Stance } from "@/lib/stocksense/types";

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-3xl border border-line bg-panel p-4 md:p-5", className)}>{children}</section>
  );
}

export function StancePill({ stance }: { stance: Stance }) {
  const cls =
    stance === "bullish" ? "pill-bull" : stance === "bearish" ? "pill-bear" : stance === "neutral" ? "pill-neutral" : "pill-caution";
  return <span className={cn("pill", cls)}>{stanceLabel(stance)}</span>;
}

export function RiskPill({ level }: { level: RiskLevel }) {
  const cls =
    level === "low" ? "pill-bull" : level === "moderate" || level === "insufficient_data" ? "pill-neutral" : level === "elevated" ? "pill-caution" : "pill-bear";
  return <span className={cn("pill", cls)}>Risk {riskLabel(level)}</span>;
}

export function proseFor(report: AnalystReport, bundle: AnalysisBundle, mode: "model" | "rules"): string {
  if (mode === "model" && bundle.modelProse) {
    const text = bundle.modelProse[report.agent];
    if (text) return text;
  }
  return report.summary;
}

export function committeeProse(bundle: AnalysisBundle, mode: "model" | "rules"): string {
  if (mode === "model" && bundle.modelProse?.committee) return bundle.modelProse.committee;
  return bundle.committee.summary;
}

export function changeLines(bundle: AnalysisBundle, mode: "model" | "rules"): string[] {
  if (mode === "model" && bundle.modelProse?.changeConditions?.length) return bundle.modelProse.changeConditions;
  return bundle.committee.changeConditions;
}

export const AGENT_ORDER: AgentId[] = ["technical", "news", "fundamental", "risk"];
