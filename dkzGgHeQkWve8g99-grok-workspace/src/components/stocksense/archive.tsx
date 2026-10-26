import { Panel, RiskPill, StancePill } from "@/components/stocksense/bits";
import { prettyDate } from "@/lib/stocksense/format";
import { useDesk } from "@/lib/stocksense/store";
import { HORIZON_META } from "@/lib/stocksense/types";

export function Archive() {
  const archive = useDesk((s) => s.archive);
  const hydrated = useDesk((s) => s.hydrated);
  const openArchive = useDesk((s) => s.openArchive);

  if (!hydrated) {
    return (
      <Panel>
        <p className="text-muted">Opening saved runs on this device.</p>
      </Panel>
    );
  }

  if (archive.length === 0) {
    return (
      <Panel>
        <h2 className="font-display text-2xl">No saved runs.</h2>
        <p className="mt-2 text-muted">
          Each committee you convene is kept in this browser, with the stance and the time it was produced. Nothing is
          sent to an account.
        </p>
      </Panel>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-3xl">Archive</h2>
        <p className="mt-2 text-muted">Earlier runs stay as they were. A later price does not rewrite them.</p>
      </div>
      <div className="flex flex-col gap-3">
        {archive.map((item, index) => {
          const prior = archive.slice(index + 1).find((row) => row.company.symbol === item.company.symbol);
          return (
            <Panel key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted">
                    {prettyDate(item.generatedAt)} · {HORIZON_META[item.horizon].label}
                  </p>
                  <h3 className="text-lg font-semibold">
                    {item.company.name}
                    <span className="ml-2 font-mono text-sm text-faint">{item.company.symbol}</span>
                  </h3>
                  {prior ? (
                    <p className="mt-1 text-sm text-muted">
                      Previous saved run was {prior.committee.assessment} on {prettyDate(prior.generatedAt)}.
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <StancePill stance={item.committee.assessment} />
                  <RiskPill level={item.committee.riskLevel} />
                </div>
              </div>
              <button
                type="button"
                className="mt-3 h-11 text-sm text-accent"
                onClick={() => openArchive(item.id)}
              >
                Open this run
              </button>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
