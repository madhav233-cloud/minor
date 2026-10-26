import { useState } from "react";
import { AGENT_ORDER, Panel, RiskPill, StancePill, changeLines, committeeProse, proseFor } from "@/components/stocksense/bits";
import { answerFromEvidence } from "@/lib/stocksense/explain";
import { num, prettyDate, stanceLabel } from "@/lib/stocksense/format";
import { useDesk } from "@/lib/stocksense/store";
import { HORIZON_META, STANCE_THRESHOLD } from "@/lib/stocksense/types";

const PROMPTS = [
  "Why is this not a vote?",
  "What evidence is missing?",
  "What would change the conclusion?",
  "How is risk used?",
  "Is there a price forecast?",
];

export function Committee() {
  const current = useDesk((s) => s.current);
  const phase = useDesk((s) => s.phase);
  const mode = useDesk((s) => s.proseMode);
  const setMode = useDesk((s) => s.setProseMode);
  const setEvidenceAgent = useDesk((s) => s.setEvidenceAgent);
  const challenge = useDesk((s) => s.challenge);
  const setChallenge = useDesk((s) => s.setChallenge);
  const [answer, setAnswer] = useState<string | null>(null);

  if (!current) {
    return (
      <Panel>
        <h2 className="font-display text-2xl">No committee is in session.</h2>
        <p className="mt-2 text-muted">Convene one from the desk. This screen does not keep a sample report.</p>
      </Panel>
    );
  }

  const usingModel = mode === "model" && !!current.modelProse?.committee;
  const conditions = changeLines(current, mode);

  return (
    <div className="flex flex-col gap-4">
      <Panel className="border-t-2 border-t-accent">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted">Investment committee · {current.company.name}</p>
            <h2 className="mt-2 font-display text-4xl text-ink md:text-5xl">
              {stanceLabel(current.committee.assessment)}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <RiskPill level={current.committee.riskLevel} />
            <span className="pill pill-neutral">{HORIZON_META[current.horizon].label}</span>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-ink">{committeeProse(current, mode)}</p>
        <p className="mt-3 font-mono text-sm text-muted tabular-nums">
          {current.committee.finalScore == null
            ? "No weighted score"
            : `Score ${num(current.committee.finalScore, 2)} · threshold ±${STANCE_THRESHOLD.toFixed(2)}`}
          {current.committee.rawScore != null &&
          current.committee.finalScore != null &&
          current.committee.rawScore !== current.committee.finalScore
            ? ` · before cap ${num(current.committee.rawScore, 2)}`
            : ""}
        </p>
        {current.committee.capNote ? <p className="mt-2 text-sm text-caution">{current.committee.capNote}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {current.committee.weights.map((row) => (
            <span key={row.agent} className="pill pill-neutral">
              {row.agent} {Math.round(row.weight * 100)}% · {num(row.signal, 2)}
            </span>
          ))}
          <span className="pill pill-neutral">Risk is a constraint, not a weight</span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-faint">
            {usingModel ? "Model wording, checked against the evidence pack." : "Rule synthesis. Figures in the tables are the record."}
          </span>
          {current.modelProse ? (
            <button
              type="button"
              className="h-11 rounded-lg border border-line px-3"
              onClick={() => setMode(mode === "model" ? "rules" : "model")}
            >
              {mode === "model" ? "Show rule synthesis" : "Show model wording"}
            </button>
          ) : null}
        </div>
        {current.modelNote ? <p className="mt-2 text-sm text-muted">{current.modelNote}</p> : null}
        {phase === "narrate" ? (
          <p className="mt-2 text-sm text-accent">Writing the explanation from this evidence pack.</p>
        ) : null}
      </Panel>

      {current.pack.warnings.length > 0 ? (
        <Panel>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Data quality</h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {current.pack.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <Panel>
          <h3 className="font-semibold">Constructive evidence</h3>
          <ul className="mt-3 flex flex-col gap-3 text-sm text-muted">
            {current.committee.supporting.length === 0 ? <li>None of the scored evidence pointed this way.</li> : null}
            {current.committee.supporting.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <h3 className="font-semibold">Reasons for caution</h3>
          <ul className="mt-3 flex flex-col gap-3 text-sm text-muted">
            {current.committee.opposing.length === 0 ? <li>None of the scored evidence pointed this way.</li> : null}
            {current.committee.opposing.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel>
        <h3 className="font-semibold">Where the analysts split</h3>
        <div className="mt-3 flex flex-col gap-4">
          {current.committee.disagreements.map((item) => (
            <div key={item.title}>
              <p className="font-medium">{item.title}</p>
              <p className="mt-1 text-sm text-muted">{item.detail}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-3 md:grid-cols-2">
        {AGENT_ORDER.map((id) => {
          const report = current.reports[id];
          return (
            <Panel key={id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">{report.title}</h3>
                {id === "risk" && report.riskLevel ? (
                  <RiskPill level={report.riskLevel} />
                ) : (
                  <StancePill stance={report.assessment} />
                )}
              </div>
              <p className="mt-3 text-sm text-muted">{proseFor(report, current, mode)}</p>
              <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                {report.metrics.slice(0, 6).map((metric) => (
                  <div key={metric.label} className="min-w-0">
                    <dt className="text-faint">{metric.label}</dt>
                    <dd className="truncate font-mono tabular-nums">{metric.value}</dd>
                  </div>
                ))}
              </dl>
              <button
                type="button"
                className="mt-4 h-11 text-sm text-accent"
                onClick={() => setEvidenceAgent(id)}
              >
                Inspect evidence
              </button>
            </Panel>
          );
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Panel>
          <h3 className="font-semibold">What would change this</h3>
          <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm text-muted">
            {conditions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-faint">
            {usingModel && current.modelProse?.changeConditions
              ? "These conditions were phrased by the model from the rule list."
              : "These conditions come from the rule layer."}
          </p>
        </Panel>
        <Panel>
          <h3 className="font-semibold">Challenge the conclusion</h3>
          <p className="mt-2 text-sm text-muted">
            Answers are assembled from this run. They do not call the model again.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="h-11 rounded-lg border border-line px-3 text-sm"
                onClick={() => {
                  setChallenge(prompt);
                  setAnswer(answerFromEvidence(current, prompt));
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
          <form
            className="mt-3 flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              setAnswer(answerFromEvidence(current, challenge));
            }}
          >
            <input
              value={challenge}
              onChange={(event) => setChallenge(event.target.value)}
              placeholder="Ask about this run"
              className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-canvas px-3"
            />
            <button type="submit" className="press h-11 rounded-lg bg-panel-2 px-4 font-medium">
              Answer from evidence
            </button>
          </form>
          {answer ? <p className="mt-3 text-sm">{answer}</p> : null}
        </Panel>
      </div>

      <p className="text-xs text-faint">
        Run {prettyDate(current.generatedAt)} · {current.company.symbol} · prices through{" "}
        {prettyDate(current.pack.priceAsOf)} · statements {prettyDate(current.pack.statementAsOf)}
      </p>
    </div>
  );
}
