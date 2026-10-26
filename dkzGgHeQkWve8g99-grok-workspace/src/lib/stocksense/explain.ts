import { num, pct, stanceLabel } from "./format";
import { HORIZON_META, STANCE_THRESHOLD, type AnalysisBundle } from "./types";

export function answerFromEvidence(bundle: AnalysisBundle, question: string): string {
  const q = question.toLowerCase();
  const c = bundle.committee;
  const horizon = HORIZON_META[bundle.horizon].label.toLowerCase();
  const weights = c.weights
    .map((w) => `${w.agent} ${Math.round(w.weight * 100)}% (signal ${num(w.signal, 2)}, ${stanceLabel(w.stance).toLowerCase()})`)
    .join(", ");

  if (/vote|majority|three|count the|outweigh/.test(q)) {
    return `The chair does not count votes. On a ${horizon} horizon the renormalized weights are ${weights || "unavailable"}. A bullish or bearish label needs a weighted score beyond ±${STANCE_THRESHOLD.toFixed(2)}. ${
      c.rawScore == null
        ? "There was not enough directional evidence to score."
        : `The directional score was ${num(c.rawScore, 2)}${c.finalScore != null && c.rawScore !== c.finalScore ? `, and after the risk rule it was ${num(c.finalScore, 2)}` : ""}.`
    } ${c.capNote ?? "No risk cap changed the result."}`;
  }

  if (/risk|volatil|drawdown|var|downside/.test(q)) {
    const r = bundle.reports.risk;
    return `${r.summary} The grade is a constraint on the chair, not a fourth vote. ${r.evidence
      .slice(0, 3)
      .map((e) => e.claim)
      .join(" ")}`;
  }

  if (/missing|gap|unverified|disagree|inconsistent|why not|insufficient/.test(q)) {
    const gaps = c.missing.slice(0, 4);
    return gaps.length
      ? `What this run could not use: ${gaps.join(" ")} Missing inputs were not filled with a negative assumption.`
      : "No data gap was flagged on this run. That does not mean the sources are complete, only that the checks in this app did not fire.";
  }

  if (/flip|change|would|alter|what if|trigger/.test(q)) {
    return `The conclusion would be revisited if: ${c.changeConditions.join(" ")} Those are conditions, not predictions.`;
  }

  if (/news|headline|sentiment|regulat/.test(q)) {
    return `${bundle.reports.news.summary} ${bundle.reports.news.evidence
      .slice(0, 3)
      .map((e) => e.claim)
      .join(" ")}`;
  }

  if (/valuat|p\/e|multiple|expensive|cheap|fundamental|earnings|revenue|margin/.test(q)) {
    return `${bundle.reports.fundamental.summary} ${bundle.reports.fundamental.limitations[0] ?? ""}`;
  }

  if (/lstm|forecast|predict|target|price will|drift/.test(q)) {
    const d = bundle.pack;
    return d.drift == null
      ? "This run does not include a price forecast. The older LSTM model is not connected here, and no target price is produced."
      : `The only forward-looking number is a historical-drift baseline of ${pct(d.drift)} over ${HORIZON_META[bundle.horizon].days} sessions, with a one-standard-deviation band of ${pct(d.driftLow)} to ${pct(d.driftHigh)}. It restates average past returns from ${d.driftSample} sessions. It is not a trained model and it does not set the stance.`;
  }

  const words = q.split(/[^a-z0-9]+/).filter((w) => w.length > 3);
  const pool = [
    ...Object.values(bundle.reports).flatMap((r) => r.evidence.map((e) => e.claim)),
    ...c.supporting,
    ...c.opposing,
    ...c.disagreements.map((d) => d.detail),
  ];
  const ranked = pool
    .map((claim) => ({
      claim,
      score: words.reduce((n, w) => n + (claim.toLowerCase().includes(w) ? 1 : 0), 0),
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  if (ranked.length === 0) {
    return `Nothing in this run answers that directly. The chair's assessment is ${stanceLabel(c.assessment).toLowerCase()} on a ${horizon} horizon. ${c.summary}`;
  }
  return `From this run's evidence: ${ranked.map((r) => r.claim).join(" ")}`;
}
