import { ArrowUpRight } from "lucide-react";
import { AGENT_ORDER, Panel, RiskPill, StancePill } from "@/components/stocksense/bits";
import { prettyDate } from "@/lib/stocksense/format";
import { useDesk } from "@/lib/stocksense/store";
import type { AgentId } from "@/lib/stocksense/types";
import { METHOD_NOTES } from "@/lib/stocksense/universe";

export function Evidence() {
  const current = useDesk((s) => s.current);
  const filter = useDesk((s) => s.evidenceAgent);
  const setFilter = useDesk((s) => s.setEvidenceAgent);

  if (!current) {
    return (
      <Panel>
        <h2 className="font-display text-2xl">No evidence pack yet.</h2>
        <p className="mt-2 text-muted">Run a company from the desk to trace each claim back to a calculation or a headline.</p>
      </Panel>
    );
  }

  const agents: (AgentId | "all")[] = ["all", ...AGENT_ORDER];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-3xl">Evidence</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Every claim below was produced with the calculated metrics or a retrieved headline. The model, when it
          writes, is not allowed to replace these rows.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {agents.map((agent) => (
          <button
            key={agent}
            type="button"
            aria-pressed={filter === agent}
            onClick={() => setFilter(agent)}
            className={
              filter === agent
                ? "h-11 rounded-lg bg-panel-2 px-3 text-sm font-medium"
                : "h-11 rounded-lg px-3 text-sm text-muted"
            }
          >
            {agent === "all" ? "All" : current.reports[agent].title.replace(" analyst", "")}
          </button>
        ))}
      </div>
      {AGENT_ORDER.filter((id) => filter === "all" || filter === id).map((id) => {
        const report = current.reports[id];
        return (
          <Panel key={id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold">{report.title}</h3>
              {id === "risk" && report.riskLevel ? (
                <RiskPill level={report.riskLevel} />
              ) : (
                <StancePill stance={report.assessment} />
              )}
            </div>
            <p className="mt-1 text-xs text-faint">As of {prettyDate(report.dataAsOf)}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              {report.metrics.map((metric) => (
                <div key={metric.label} className="min-w-0 rounded-lg bg-panel-2 p-3">
                  <dt className="text-xs text-faint">{metric.label}</dt>
                  <dd className="mt-1 truncate font-mono text-sm tabular-nums">{metric.value}</dd>
                </div>
              ))}
            </dl>
            <ul className="mt-4 flex flex-col gap-4">
              {report.evidence.map((item) => (
                <li key={item.id} className="border-t border-line pt-3">
                  <p className="text-sm">{item.claim}</p>
                  <p className="mt-1 text-xs text-faint">
                    {item.pole === "support" ? "Constructive" : item.pole === "caution" ? "Caution" : "Context"}
                    {" · "}
                    {item.source}
                    {item.observedAt ? ` · ${prettyDate(item.observedAt)}` : ""}
                  </p>
                  {item.sourceUrl ? (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex h-11 items-center gap-1 text-sm text-accent"
                    >
                      Open source
                      <ArrowUpRight className="size-4" aria-hidden />
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
            <details className="mt-4">
              <summary className="h-11 text-sm text-muted">Limitations</summary>
              <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-muted">
                {report.limitations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </details>
          </Panel>
        );
      })}
      {filter === "all" || filter === "news" ? (
        <Panel>
          <h3 className="font-semibold">Headlines retrieved</h3>
          {current.pack.headlines.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No headlines were stored for this run.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
              {current.pack.headlines.map((item) => (
                <li key={item.title} className="text-sm">
                  <p>{item.title}</p>
                  <p className="text-xs text-faint">
                    {item.publisher} · {prettyDate(item.publishedAt)} · lexicon {item.sentiment.toFixed(2)}
                    {item.events.length ? ` · ${item.events.join(", ")}` : ""}
                  </p>
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noreferrer" className="text-sm text-accent">
                      Open headline
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      ) : null}
      <Panel>
        <h3 className="font-semibold">How a number gets into the report</h3>
        <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm text-muted">
          {METHOD_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
