import { useMemo } from "react";
import { Panel, RiskPill, StancePill } from "@/components/stocksense/bits";
import { applyScenario, judge } from "@/lib/stocksense/assess";
import { num, pct, stanceLabel } from "@/lib/stocksense/format";
import { useDesk } from "@/lib/stocksense/store";
import { NEUTRAL_SCENARIO, scenarioActive } from "@/lib/stocksense/types";

export function Lab() {
  const current = useDesk((s) => s.current);
  const scenario = useDesk((s) => s.scenario);
  const setScenario = useDesk((s) => s.setScenario);

  const result = useMemo(() => {
    if (!current) return null;
    const active = scenarioActive(scenario);
    const applied = applyScenario(current.pack, active ? scenario : NEUTRAL_SCENARIO);
    const judged = judge(applied.pack, current.horizon, active);
    return { ...judged, notes: applied.notes, active };
  }, [current, scenario]);

  if (!current || !result) {
    return (
      <Panel>
        <h2 className="font-display text-2xl">The lab needs a real run.</h2>
        <p className="mt-2 text-muted">
          Stress tests start from observed metrics. They are not available until a committee has been convened.
        </p>
      </Panel>
    );
  }

  const growthDisabled = current.pack.revenueGrowth == null;
  const volDisabled = current.pack.vol252 == null;
  const newsDisabled = current.pack.newsScore == null;

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-3xl">
        <h2 className="font-display text-3xl">What-if lab</h2>
        <p className="mt-2 text-muted">
          These sliders are assumptions. They do not change the stored report, and they are not a forecast. Technical
          evidence stays on the observed prices. Only growth, volatility, and the headline score move.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Panel>
          <p className="text-sm text-muted">Observed assessment</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <StancePill stance={current.committee.assessment} />
            <RiskPill level={current.committee.riskLevel} />
          </div>
        </Panel>
        <Panel>
          <p className="text-sm text-muted">{result.active ? "Stressed assessment" : "No shock applied"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <StancePill stance={result.committee.assessment} />
            <RiskPill level={result.committee.riskLevel} />
          </div>
          <p className="mt-3 text-sm text-muted">
            {result.active
              ? `Observed was ${stanceLabel(current.committee.assessment).toLowerCase()}. Stressed is ${stanceLabel(result.committee.assessment).toLowerCase()}.`
              : "Move a slider to separate a stress test from the observed run."}
          </p>
        </Panel>
      </div>

      <Panel>
        <div className="flex flex-col gap-5">
          <label className="block">
            <span className="flex items-baseline justify-between gap-3 text-sm">
              <span>Revenue-growth shock</span>
              <span className="font-mono tabular-nums">
                {scenario.revenueGrowthDelta > 0 ? "+" : ""}
                {Math.round(scenario.revenueGrowthDelta * 100)} pp
              </span>
            </span>
            <input
              type="range"
              min={-20}
              max={20}
              step={1}
              disabled={growthDisabled}
              value={Math.round(scenario.revenueGrowthDelta * 100)}
              onChange={(event) =>
                setScenario({ ...scenario, revenueGrowthDelta: Number(event.target.value) / 100 })
              }
              className="mt-2 h-11 w-full accent-accent disabled:opacity-40"
            />
            <span className="text-xs text-faint">
              {growthDisabled
                ? "Disabled. Observed revenue growth was missing or set aside."
                : `Observed growth ${pct(current.pack.revenueGrowth)} becomes ${pct((current.pack.revenueGrowth ?? 0) + scenario.revenueGrowthDelta)}.`}
            </span>
          </label>
          <label className="block">
            <span className="flex items-baseline justify-between gap-3 text-sm">
              <span>Volatility multiple</span>
              <span className="font-mono tabular-nums">{num(scenario.volMultiplier, 1)}×</span>
            </span>
            <input
              type="range"
              min={70}
              max={160}
              step={5}
              disabled={volDisabled}
              value={Math.round(scenario.volMultiplier * 100)}
              onChange={(event) => setScenario({ ...scenario, volMultiplier: Number(event.target.value) / 100 })}
              className="mt-2 h-11 w-full"
            />
            <span className="text-xs text-faint">
              {volDisabled
                ? "Disabled. Observed volatility was missing."
                : `Observed ${pct(current.pack.vol252)} becomes ${pct((current.pack.vol252 ?? 0) * scenario.volMultiplier)}. Drawdown and VaR stay observed.`}
            </span>
          </label>
          <label className="block">
            <span className="flex items-baseline justify-between gap-3 text-sm">
              <span>Headline-score shift</span>
              <span className="font-mono tabular-nums">
                {scenario.newsShift > 0 ? "+" : ""}
                {num(scenario.newsShift, 1)}
              </span>
            </span>
            <input
              type="range"
              min={-40}
              max={40}
              step={5}
              disabled={newsDisabled}
              value={Math.round(scenario.newsShift * 100)}
              onChange={(event) => setScenario({ ...scenario, newsShift: Number(event.target.value) / 100 })}
              className="mt-2 h-11 w-full"
            />
            <span className="text-xs text-faint">
              {newsDisabled
                ? "Disabled. There was no lexicon score."
                : "Shifts the score only. The headlines themselves do not change."}
            </span>
          </label>
          <button
            type="button"
            className="h-11 self-start rounded-lg border border-line px-3 text-sm"
            onClick={() => setScenario(NEUTRAL_SCENARIO)}
          >
            Reset assumptions
          </button>
        </div>
      </Panel>

      {result.notes.length > 0 ? (
        <Panel>
          <h3 className="font-semibold">What the stress test changed</h3>
          <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm text-muted">
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <Panel>
        <h3 className="font-semibold">Stressed chair</h3>
        <p className="mt-2 text-sm text-muted">{result.committee.summary}</p>
      </Panel>
    </div>
  );
}
